<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\UserExerciseLog;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    // berekent per cursus-ID of die beschikbaar is voor de opgegeven gebruiker.
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

            // Bepaal of de cursus volledig afgerond is
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

        if (!auth()->check()) {
            return response()->json($courses);
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

        return response()->json($result);
    }

    public function createCourse(Request $request)
    {
        $validated = $request->validate([
            'course_name' => 'required|string|max:255',
        ]);

        $exists = Course::where('course_name', $validated['course_name'])->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Course name already exists!',
            ], 422);
        }

        $course = Course::create([
            'course_name' => $validated['course_name'],
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
            return response()->json([
                'message' => 'Course not found.',
            ], 404);
        }

        return response()->json($course);
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

    //regels:
    //   - Als de cursus niet beschikbaar is alles op slot
    //   - Oefening 1 (index 0) van een beschikbare cursus: altijd open
    //   - Oefening N: beschikbaar als oefening N-1 voltooid is
    //   - Eerder vrijgekomen oefeningen blijven altijd beschikbaar
    public function getCourseAvailability($id)
    {
        $course = Course::with('exercises')->find($id);
        if (!$course) {
            return response()->json(['message' => 'Course not found.'], 404);
        }

        $userId = auth()->id();

        // Stap 1: is de cursus beschikbaar?
        $availabilityMap   = $this->buildCourseAvailabilityMap($userId);
        $courseIsAvailable = $availabilityMap[$course->id] ?? false;

        if (!$courseIsAvailable) {
            // Cursus is niet beschikbaar dus alle oefeningen op slot
            $result = $course->exercises->map(fn($exercise) => [
                'exercise_id'     => $exercise->id,
                'available'       => false,
                'available_from'  => null,
                'available_label' => 'Voltooi eerst de vorige cursus',
            ])->values()->all();

            return response()->json($result);
        }

        // Stap 2: cursus beschikbaar
        $exerciseIds = $course->exercises->pluck('id');

        $completionDates = UserExerciseLog::where('user_id', $userId)
            ->whereIn('exercise_id', $exerciseIds)
            ->where('completed', true)
            ->selectRaw('exercise_id, MIN(DATE(date_time)) as first_completed_date')
            ->groupBy('exercise_id')
            ->pluck('first_completed_date', 'exercise_id');

        $today  = now()->toDateString();
        $result = [];

        foreach ($course->exercises as $index => $exercise) {
            if ($index === 0) {
                $result[] = [
                    'exercise_id'     => $exercise->id,
                    'available'       => true,
                    'available_from'  => null,
                    'available_label' => null,
                ];
                continue;
            }

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

            // Beschikbaar de dag na afronden van oefening
            $availableFrom = \Carbon\Carbon::parse($prevCompletedDate)->addDay()->toDateString();

            if ($availableFrom <= $today) {
                $result[] = [
                    'exercise_id'     => $exercise->id,
                    'available'       => true,
                    'available_from'  => $availableFrom,
                    'available_label' => null,
                ];
            } else {
                $availableFromCarbon = \Carbon\Carbon::parse($availableFrom);
                $todayCarbon         = \Carbon\Carbon::parse($today);
                $diffDays            = $todayCarbon->diffInDays($availableFromCarbon);

                if ($diffDays === 1) {
                    $label = 'Morgen beschikbaar';
                } elseif ($diffDays <= 6) {
                    $days  = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
                    $label = 'Beschikbaar op ' . $days[$availableFromCarbon->dayOfWeek];
                } else {
                    $months = [
                        1 => 'januari', 2 => 'februari',  3 => 'maart',    4 => 'april',
                        5 => 'mei',     6 => 'juni',       7 => 'juli',     8 => 'augustus',
                        9 => 'september', 10 => 'oktober', 11 => 'november', 12 => 'december',
                    ];
                    $label = 'Beschikbaar op ' . $availableFromCarbon->day . ' ' . $months[$availableFromCarbon->month];
                }

                $result[] = [
                    'exercise_id'     => $exercise->id,
                    'available'       => false,
                    'available_from'  => $availableFrom,
                    'available_label' => $label,
                ];
            }
        }

        return response()->json($result);
    }
}
