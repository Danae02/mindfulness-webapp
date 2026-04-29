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
                // eerste cursus altijd beschikbaar
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

        // Haal completion dates op per oefening
        $allExerciseIds = $allCourses->flatMap(fn($c) => $c->exercises->pluck('id'));

        $completionDates = UserExerciseLog::where('user_id', $userId)
            ->whereIn('exercise_id', $allExerciseIds)
            ->where('completed', true)
            ->selectRaw('exercise_id, MIN(DATE(date_time)) as first_completed_date')
            ->groupBy('exercise_id')
            ->pluck('first_completed_date', 'exercise_id');

        $completedTodayIds = UserExerciseLog::where('user_id', $userId)
            ->whereDate('date_time', today())
            ->where('completed', true)
            ->pluck('exercise_id')
            ->flip()
            ->all();

        foreach ($allCourses as $courseIndex => $course) {
            if (!($availabilityMap[$course->id] ?? false)) {
                continue;
            }

            foreach ($course->exercises as $index => $exercise) {
                if ($index === 0) {
                    if ($courseIndex === 0) {
                        // Eerste oefening van eerste cursus: altijd beschikbaar
                        $availableFrom = null;
                    } else {
                        // Eerste oefening van latere cursus: dag na laatste oefening vorige cursus
                        $previousCourse     = $allCourses[$courseIndex - 1];
                        $lastExerciseOfPrev = $previousCourse->exercises->last();

                        if (!$lastExerciseOfPrev) {
                            $availableFrom = null;
                        } else {
                            $prevCompleted = $completionDates[$lastExerciseOfPrev->id] ?? null;
                            $availableFrom = $prevCompleted
                                ? Carbon::parse($prevCompleted)->addDay()->toDateString()
                                : null;
                        }
                    }
                } else {
                    // Overige oefeningen: beschikbaar dag na voltooien vorige oefening
                    $previousExerciseId = $course->exercises[$index - 1]->id;
                    $prevCompleted      = $completionDates[$previousExerciseId] ?? null;

                    if ($prevCompleted === null) {
                        // Vorige oefening nog niet gedaan: rest van cursus ook niet beschikbaar
                        break;
                    }

                    $availableFrom = Carbon::parse($prevCompleted)->addDay()->toDateString();
                }

                // Oefening nog niet beschikbaar (te vroeg)
                if ($availableFrom !== null && $availableFrom > $today) {
                    break; // Volgende oefeningen in deze cursus zijn ook niet beschikbaar
                }

                // Oefening al eerder voltooid (vóór vandaag): sla over en ga door naar volgende
                $prevCompletedDate = $completionDates[$exercise->id] ?? null;
                if ($prevCompletedDate !== null && $prevCompletedDate < $today) {
                    continue;
                }

                // Oefening al vandaag afgerond: sla over
                if (array_key_exists($exercise->id, $completedTodayIds)) {
                    continue;
                }

                return $exercise;
            }
        }

        return null;
    }
}
