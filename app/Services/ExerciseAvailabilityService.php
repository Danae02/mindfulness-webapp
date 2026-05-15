<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Exercise;
use App\Models\UserExerciseLog;
use Carbon\Carbon;

class ExerciseAvailabilityService
{

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


    // geef eerste oefening beschikbaar die nog niet afgerond is
    public function getNextExerciseForUser(int $userId): ?Exercise
    {
        $allCourses      = Course::with('exercises')->orderBy('id')->get();
        $availabilityMap = $this->buildCourseAvailabilityMap($userId);
        $today           = now()->toDateString();

        $allExerciseIds  = $allCourses->flatMap(fn($c) => $c->exercises->pluck('id'));
        $completionDates = $this->getCompletionDates($userId, $allExerciseIds);
        $completedTodayIds = $this->getCompletedTodayIds($userId);

        foreach ($allCourses as $courseIndex => $course) {
            if (!($availabilityMap[$course->id] ?? false)) {
                continue;
            }

            foreach ($course->exercises as $index => $exercise) {
                $availableFrom = $this->resolveExerciseAvailableFrom(
                    $course, $courseIndex, $index, $allCourses, $completionDates, $userId
                );

                if ($availableFrom !== null && $availableFrom > $today) {
                    break;
                }

                $prevCompletedDate = $completionDates[$exercise->id] ?? null;
                if ($prevCompletedDate !== null && $prevCompletedDate < $today) {
                    continue;
                }

                if (array_key_exists($exercise->id, $completedTodayIds)) {
                    continue;
                }

                return $exercise;
            }
        }

        return null;
    }

    public function isNewestAvailableExercise(int $exerciseId, int $userId): bool
    {
        $today = now()->toDateString();
        $allCourses = Course::with('exercises')->orderBy('id')->get();
        $availabilityMap = $this->buildCourseAvailabilityMap($userId);

        $allExerciseIds = $allCourses->flatMap(fn($c) => $c->exercises->pluck('id'));
        $completionDates = $this->getCompletionDates($userId, $allExerciseIds);

        $availableExercises = [];

        foreach ($allCourses as $courseIndex => $course) {
            if (!($availabilityMap[$course->id] ?? false)) {
                continue;
            }

            foreach ($course->exercises as $exerciseIndex => $exercise) {
                $availableFrom = $this->resolveExerciseAvailableFrom(
                    $course, $courseIndex, $exerciseIndex, $allCourses, $completionDates, $userId
                );

                if ($availableFrom === null || $availableFrom <= $today) {
                    $availableExercises[] = [
                        'id'             => $exercise->id,
                        'course_index'   => $courseIndex,
                        'exercise_index' => $exerciseIndex,
                    ];
                }
            }
        }

        if (empty($availableExercises)) {
            return false;
        }

        usort($availableExercises, fn($a, $b) =>
        $a['course_index'] !== $b['course_index']
            ? $a['course_index'] <=> $b['course_index']
            : $a['exercise_index'] <=> $b['exercise_index']
        );

        return end($availableExercises)['id'] === $exerciseId;
    }


    public function hasAnsweredFeelingToday(int $userId): bool
    {
        return UserExerciseLog::where('user_id', $userId)
            ->whereDate('date_time', now()->toDateString())
            ->where(function ($q) {
                $q->whereNotNull('feeling_before')
                    ->orWhereNotNull('feeling_after');
            })
            ->exists();
    }

    private function resolveExerciseAvailableFrom(
        $course,
        int $courseIndex,
        int $exerciseIndex,
        $allCourses,
        $completionDates,
        int $userId
    ): ?string {
        if ($exerciseIndex === 0) {
            if ($courseIndex === 0) {
                return null;
            }

            $previousCourse = $allCourses[$courseIndex - 1];
            $lastExerciseOfPrev = $previousCourse->exercises->last();

            if (!$lastExerciseOfPrev) {
                return null;
            }

            $prevLastCompletedDate = UserExerciseLog::where('user_id', $userId)
                ->where('exercise_id', $lastExerciseOfPrev->id)
                ->where('completed', true)
                ->selectRaw('MIN(DATE(date_time)) as first_completed_date')
                ->value('first_completed_date');

            if ($prevLastCompletedDate === null) {
                return '9999-99-99';
            }

            return Carbon::parse($prevLastCompletedDate)->addDay()->toDateString();
        }

        $previousExerciseId = $course->exercises[$exerciseIndex - 1]->id;
        $prevCompletedDate = $completionDates[$previousExerciseId] ?? null;

        if ($prevCompletedDate === null) {
            return '9999-99-99';
        }

        return Carbon::parse($prevCompletedDate)->addDay()->toDateString();
    }


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

    private function getCompletedTodayIds(int $userId): array
    {
        return UserExerciseLog::where('user_id', $userId)
            ->whereDate('date_time', today())
            ->where('completed', true)
            ->pluck('exercise_id')
            ->flip()
            ->all();
    }
}
