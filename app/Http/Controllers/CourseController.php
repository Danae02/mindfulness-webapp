<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\UserExerciseLog;
use Illuminate\Http\Request;

class CourseController extends Controller
{

     //De vaste introductie-oefening die altijd bovenaan staat en altijd beschikbaar is.
     //Dit is een hardcoded object, geen DB-record.
    private function introExercise(): array
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

    //Het hardcoded intro-cursus-object dat boven alle echte cursussen wordt getoond.
    private function introCourse(): array
    {
        return [
            'id'          => 'intro',
            'is_intro'    => true,
            'course_name' => 'Welkom',
            'description' => 'Beluister de introductie voordat je aan de cursussen begint.',
            'available'   => true,
            'exercises'   => [$this->introExercise()],
        ];
    }

    // Berekent per cursus-ID of die beschikbaar is voor de opgegeven gebruiker.
    //
    // Cursus-volgorde = oplopend op id.
    // Cursus 1 (index 0): altijd beschikbaar.
    // Cursus N: beschikbaar als cursus N-1 beschikbaar ÉN alle oefeningen van cursus N-1 minstens één keer completed zijn.
    private function buildCourseAvailabilityMap(int $userId): array
    {
        $allCourses = Course::with('exercises')->orderBy('id')->get();

        // Haal in één query alle exercise_ids op die deze user ooit voltooid heeft
        $allExerciseIds = $allCourses->flatMap(fn($c) => $c->exercises->pluck('id'));

        $completedExerciseIds = UserExerciseLog::where('user_id', $userId)
            ->whereIn('exercise_id', $allExerciseIds)
            ->where('completed', true)
            ->distinct()
            ->pluck('exercise_id')
            ->flip()
            ->all();

        $availabilityMap = [];
        $previousIsAvailableAndComplete = true;

        foreach ($allCourses as $index => $course) {
            if ($index === 0) {
                // Eerste cursus altijd beschikbaar
                $availabilityMap[$course->id] = true;
            } else {
                $availabilityMap[$course->id] = $previousIsAvailableAndComplete;
            }

            // Bepaal of de cursus afgerond is
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


    public function getAllCourses()
    {
        $courses = Course::with('exercises')->orderBy('id')->get();

        // Bouw de intro-cursus alvast op
        $intro = $this->introCourse();

        if (!auth()->check()) {
            // Niet ingelogd: intro + cursussen zonder beschikbaarheidsinfo
            return response()->json(array_merge([$intro], $courses->values()->all()));
        }

        $userId          = auth()->id();
        $availabilityMap = $this->buildCourseAvailabilityMap($userId);

        $result = $courses->map(function ($course) use ($availabilityMap) {
            $available = $availabilityMap[$course->id] ?? false;

            return array_merge($course->toArray(), [
                'available'       => $available,
                'available_label' => $available ? null : 'Nog niet beschikbaar',
            ]);
        });

        return response()->json(array_merge([$intro], $result->values()->all()));
    }

    public function createCourse(Request $request)
    {
        $validated = $request->validate([
            'course_name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $exists = Course::where('course_name', $validated['course_name'])->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Course name already exists!',
            ], 422);
        }

        $course = Course::create([
            'course_name' => $validated['course_name'],
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message'   => 'Course created successfully!',
            'course_id' => $course->id,
        ]);
    }

    public function getCourseDetails($id)
    {
        $course = Course::with('exercises')->find($id);

        if (!$course) {
            return response()->json(['message' => 'Course not found.'], 404);
        }

        // Voeg duration toe aan elke oefening
        $exercises = $course->exercises->map(function ($exercise) {
            return array_merge($exercise->toArray(), [
                'duration' => $exercise->duration_minutes,
            ]);
        });

        return response()->json([
            'id'          => $course->id,
            'course_name' => $course->course_name,
            'description' => $course->description,
            'exercises'   => $exercises,
        ]);
    }

    public function updateCourse(Request $request, $id)
    {
        $request->validate([
            'course_name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $course = Course::findOrFail($id);
        $course->update($request->only(['course_name', 'description']));

        return response()->json([
            'message' => 'Course updated successfully!',
            'course'  => $course,
        ]);
    }

    public function deleteCourse($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();

        return response()->json(['message' => 'Course deleted successfully!']);
    }

    // Helper om een leesbaar label te maken op basis van het aantal dagen verschil
    private function buildAvailableLabel(string $availableFrom, string $today): string
    {
        $availableFromCarbon = \Carbon\Carbon::parse($availableFrom);
        $todayCarbon         = \Carbon\Carbon::parse($today);
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

    // Regels:
    //   - Als cursus niet beschikbaar is: alles op slot
    //   - Oefening 1 (0) van cursus 1 (index 0): altijd direct beschikbaar
    //   - Oefening 1 (0) van cursus N (N > 0): beschikbaar de dag na afronden van de laatste oefening van de vorige cursus
    //   - Oefening N binnen een cursus: beschikbaar de dag na afronden van oefening N-1
    //   - Eerder vrijgekomen oefeningen blijven altijd beschikbaar
    public function getCourseAvailability($id)
    {
        $course = Course::with('exercises')->find($id);
        if (!$course) {
            return response()->json(['message' => 'Course not found.'], 404);
        }

        $userId = auth()->id();

        // Stap 1: is de cursus beschikbaar?
        $allCourses        = Course::with('exercises')->orderBy('id')->get();
        $availabilityMap   = $this->buildCourseAvailabilityMap($userId);
        $courseIsAvailable = $availabilityMap[$course->id] ?? false;

        if (!$courseIsAvailable) {
            $result = $course->exercises->map(fn($exercise) => [
                'exercise_id'     => $exercise->id,
                'available'       => false,
                'available_from'  => null,
                'available_label' => 'Voltooi eerst de vorige cursus',
            ])->values()->all();

            return response()->json($result);
        }

        // Stap 2: cursus beschikbaar en haal completion dates op voor oefeningen in deze cursus
        $exerciseIds = $course->exercises->pluck('id');

        $completionDates = UserExerciseLog::where('user_id', $userId)
            ->whereIn('exercise_id', $exerciseIds)
            ->where('completed', true)
            ->selectRaw('exercise_id, MIN(DATE(date_time)) as first_completed_date')
            ->groupBy('exercise_id')
            ->pluck('first_completed_date', 'exercise_id');

        $today       = now()->toDateString();
        $courseIndex = $allCourses->search(fn($c) => $c->id === $course->id);
        $result      = [];

        foreach ($course->exercises as $index => $exercise) {

            // Eerste oefening van de cursus
            if ($index === 0) {

                // Eerste oefening van de eerste cursus: altijd direct beschikbaar
                if ($courseIndex === 0) {
                    $result[] = [
                        'exercise_id'     => $exercise->id,
                        'available'       => true,
                        'available_from'  => null,
                        'available_label' => null,
                    ];
                    continue;
                }

                // Eerste oefening van een latere cursus: beschikbaar de dag ná de laatste oefening van de vorige cursus
                $previousCourse     = $allCourses[$courseIndex - 1];
                $lastExerciseOfPrev = $previousCourse->exercises->last();

                if (!$lastExerciseOfPrev) {
                    $result[] = [
                        'exercise_id'     => $exercise->id,
                        'available'       => true,
                        'available_from'  => null,
                        'available_label' => null,
                    ];
                    continue;
                }

                $prevLastCompletedDate = UserExerciseLog::where('user_id', $userId)
                    ->where('exercise_id', $lastExerciseOfPrev->id)
                    ->where('completed', true)
                    ->selectRaw('MIN(DATE(date_time)) as first_completed_date')
                    ->value('first_completed_date');

                if ($prevLastCompletedDate === null) {
                    $result[] = [
                        'exercise_id'     => $exercise->id,
                        'available'       => false,
                        'available_from'  => null,
                        'available_label' => 'Voltooi eerst de vorige cursus',
                    ];
                    continue;
                }

                $availableFrom = \Carbon\Carbon::parse($prevLastCompletedDate)->addDay()->toDateString();

                if ($availableFrom <= $today) {
                    $result[] = [
                        'exercise_id'     => $exercise->id,
                        'available'       => true,
                        'available_from'  => $availableFrom,
                        'available_label' => null,
                    ];
                } else {
                    $result[] = [
                        'exercise_id'     => $exercise->id,
                        'available'       => false,
                        'available_from'  => $availableFrom,
                        'available_label' => $this->buildAvailableLabel($availableFrom, $today),
                    ];
                }

                continue;
            }

            // Overige oefeningen binnen de cursus
            $previousExerciseId = $course->exercises[$index - 1]->id;
            $prevCompletedDate  = $completionDates[$previousExerciseId] ?? null;

            if ($prevCompletedDate === null) {
                $result[] = [
                    'exercise_id'     => $exercise->id,
                    'available'       => false,
                    'available_from'  => null,
                    'available_label' => 'Voltooi eerst de vorige oefening',
                ];
                continue;
            }

            $availableFrom = \Carbon\Carbon::parse($prevCompletedDate)->addDay()->toDateString();

            if ($availableFrom <= $today) {
                $result[] = [
                    'exercise_id'     => $exercise->id,
                    'available'       => true,
                    'available_from'  => $availableFrom,
                    'available_label' => null,
                ];
            } else {
                $result[] = [
                    'exercise_id'     => $exercise->id,
                    'available'       => false,
                    'available_from'  => $availableFrom,
                    'available_label' => $this->buildAvailableLabel($availableFrom, $today),
                ];
            }
        }

        return response()->json($result);
    }
}
