<?php

namespace App\Services;

use App\Models\Course;
use App\Models\UserExerciseLog;
use Carbon\Carbon;

class CourseService
{
    //hardcoded intro-oefening die altijd bovenaan staat.
    public function getIntroExercise(): array
    {
        return [
            'id'              => 'intro',
            'exercise_name'   => 'Introductie mindfulness app',
            'audio_file_path' => '/audio/1.mindfulness_app_inleiding.m4a',
            'duration'        => null,
            'form_question'   => null,
            'form_answers'    => null,
            'available'       => true,
            'available_label' => null,
        ];
    }

    // Hardcoded intro-deel die boven alle echte cursussen staat.
    public function getIntroCourse(): array
    {
        return [
            'id'          => 'intro',
            'is_intro'    => true,
            'course_name' => 'Welkom',
            'description' => 'Beluister de introductie voordat je aan de cursussen begint.',
            'available'   => true,
            'exercises'   => [$this->getIntroExercise()],
        ];
    }

    //Haal completion dates op voor oefeningen.
    private function getCompletionDates(int $userId, $exerciseIds): array
    {
        return UserExerciseLog::where('user_id', $userId)
            ->whereIn('exercise_id', $exerciseIds)
            ->where('completed', true)
            ->selectRaw('exercise_id, MIN(DATE(date_time)) as first_completed_date')
            ->groupBy('exercise_id')
            ->pluck('first_completed_date', 'exercise_id')
            ->all();
    }


    public function buildCourseAvailabilityMap(int $userId): array
    {
        $allCourses     = Course::with('exercises')->orderBy('id')->get();
        $allExerciseIds = $allCourses->flatMap(fn($c) => $c->exercises->pluck('id'));

        $completedExerciseIds = UserExerciseLog::where('user_id', $userId)
            ->whereIn('exercise_id', $allExerciseIds)
            ->where('completed', true)
            ->distinct()
            ->pluck('exercise_id')
            ->flip()
            ->all();

        $availabilityMap                = [];
        $previousIsAvailableAndComplete = true;

        foreach ($allCourses as $index => $course) {
            if ($index === 0) {
                $availabilityMap[$course->id] = true;
            } else {
                $availabilityMap[$course->id] = $previousIsAvailableAndComplete;
            }

            if ($availabilityMap[$course->id]) {
                $exerciseIds = $course->exercises->pluck('id');

                if ($exerciseIds->isEmpty()) {
                    $previousIsAvailableAndComplete = true;
                } else {
                    $allCompleted = $exerciseIds->every(
                        fn($id) => array_key_exists($id, $completedExerciseIds)
                    );
                    $previousIsAvailableAndComplete = $allCompleted;
                }
            } else {
                $previousIsAvailableAndComplete = false;
            }
        }

        return $availabilityMap;
    }

    public function buildExerciseAvailability(Course $course, int $userId): array
    {
        $allCourses      = Course::with('exercises')->orderBy('id')->get();
        $availabilityMap = $this->buildCourseAvailabilityMap($userId);
        $courseIsAvailable = $availabilityMap[$course->id] ?? false;

        // Cursus niet beschikbaar → alle oefeningen niet beschikbaar
        if (!$courseIsAvailable) {
            return $course->exercises->map(fn($exercise) => [
                'exercise_id'     => $exercise->id,
                'available'       => false,
                'available_from'  => null,
                'available_label' => 'Voltooi eerst de vorige cursus',
            ])->values()->all();
        }

        // Cursus beschikbaar → check per oefening
        $exerciseIds     = $course->exercises->pluck('id');
        $completionDates = $this->getCompletionDates($userId, $exerciseIds);
        $today           = now()->toDateString();
        $courseIndex     = $allCourses->search(fn($c) => $c->id === $course->id);
        $result          = [];

        foreach ($course->exercises as $index => $exercise) {
            // Eerste oefening van cursus
            if ($index === 0) {
                $availabilityData = $this->resolveFirstExerciseAvailability(
                    $course, $courseIndex, $allCourses, $userId, $today, $completionDates
                );
                $result[] = array_merge(['exercise_id' => $exercise->id], $availabilityData);
                continue;
            }

            // Volgende oefeningen in cursus
            $availabilityData = $this->resolveFollowingExerciseAvailability(
                $exercise, $index, $course, $completionDates, $today
            );
            $result[] = array_merge(['exercise_id' => $exercise->id], $availabilityData);
        }

        return $result;
    }


    public function getClientProgress(int $userId): array
    {
        $courses         = Course::with('exercises')->orderBy('id')->get();
        $availabilityMap = $this->buildCourseAvailabilityMap($userId);

        $completedLogs = UserExerciseLog::where('user_id', $userId)
            ->where('completed', true)
            ->selectRaw('exercise_id, MAX(date_time) as last_completed_at')
            ->groupBy('exercise_id')
            ->get()
            ->keyBy('exercise_id');

        return $courses->map(function ($course) use ($availabilityMap, $completedLogs) {
            $available = $availabilityMap[$course->id] ?? false;
            $total     = $course->exercises->count();
            $done      = 0;

            $exercises = $course->exercises->map(function ($ex) use ($completedLogs, &$done) {
                $log       = $completedLogs->get($ex->id);
                $completed = $log !== null;
                if ($completed) $done++;

                return [
                    'exercise_id'       => $ex->id,
                    'exercise_name'     => $ex->exercise_name,
                    'completed'         => $completed,
                    'last_completed_at' => $completed ? $log->last_completed_at : null,
                ];
            });

            return [
                'course_id'   => $course->id,
                'course_name' => $course->course_name,
                'available'   => $available,
                'progress'    => $total > 0 ? round($done / $total * 100) : 0,
                'done'        => $done,
                'total'       => $total,
                'exercises'   => $exercises,
            ];
        })->values()->all();
    }


    private function resolveFirstExerciseAvailability(
        Course $course,
        int $courseIndex,
               $allCourses,
        int $userId,
        string $today,
        array $completionDates
    ): array {
        // Eerste oefening van eerste cursus: altijd beschikbaar
        if ($courseIndex === 0) {
            return [
                'available'       => true,
                'available_from'  => null,
                'available_label' => null,
            ];
        }
        // Eerste oefening van latere cursus: dag na vorige cursus af
        $previousCourse     = $allCourses[$courseIndex - 1];
        $lastExerciseOfPrev = $previousCourse->exercises->last();

        if (!$lastExerciseOfPrev) {
            return [
                'available'       => true,
                'available_from'  => null,
                'available_label' => null,
            ];
        }

        $prevLastCompletedDate = UserExerciseLog::where('user_id', $userId)
            ->where('exercise_id', $lastExerciseOfPrev->id)
            ->where('completed', true)
            ->selectRaw('MIN(DATE(date_time)) as first_completed_date')
            ->value('first_completed_date');

        if ($prevLastCompletedDate === null) {
            return [
                'available'       => false,
                'available_from'  => null,
                'available_label' => 'Voltooi eerst de vorige cursus',
            ];
        }

        $availableFrom = Carbon::parse($prevLastCompletedDate)->addDay()->toDateString();

        return [
            'available'       => $availableFrom <= $today,
            'available_from'  => $availableFrom,
            'available_label' => $availableFrom <= $today ? null : $this->buildAvailableLabel($availableFrom, $today),
        ];
    }


    private function resolveFollowingExerciseAvailability(
        $exercise,
        int $index,
        Course $course,
        array $completionDates,
        string $today
    ): array {
        $previousExerciseId = $course->exercises[$index - 1]->id;
        $prevCompletedDate  = $completionDates[$previousExerciseId] ?? null;

        if ($prevCompletedDate === null) {
            return [
                'available'       => false,
                'available_from'  => null,
                'available_label' => 'Voltooi eerst de vorige oefening',
            ];
        }

        $availableFrom = Carbon::parse($prevCompletedDate)->addDay()->toDateString();

        return [
            'available'       => $availableFrom <= $today,
            'available_from'  => $availableFrom,
            'available_label' => $availableFrom <= $today ? null : $this->buildAvailableLabel($availableFrom, $today),
        ];
    }

    // geeft leesbare tekst weer Bouwt
    private function buildAvailableLabel(string $availableFrom, string $today): string
    {
        $availableFromCarbon = Carbon::parse($availableFrom);
        $todayCarbon         = Carbon::parse($today);
        $diffDays            = $todayCarbon->diffInDays($availableFromCarbon);

        if ($diffDays === 1) {
            return 'Morgen beschikbaar';
        } elseif ($diffDays <= 6) {
            $days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
            return 'Beschikbaar op ' . $days[$availableFromCarbon->dayOfWeek];
        } else {
            $months = [
                1 => 'januari', 2 => 'februari',  3 => 'maart',    4 => 'april',
                5 => 'mei',     6 => 'juni',       7 => 'juli',     8 => 'augustus',
                9 => 'september', 10 => 'oktober', 11 => 'november', 12 => 'december',
            ];
            return 'Beschikbaar op ' . $availableFromCarbon->day . ' ' . $months[$availableFromCarbon->month];
        }
    }


}
