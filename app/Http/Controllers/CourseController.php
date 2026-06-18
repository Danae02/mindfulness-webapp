<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Services\ExerciseAvailabilityService;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    private ExerciseAvailabilityService $availabilityService;

    public function __construct(ExerciseAvailabilityService $availabilityService)
    {
        $this->availabilityService = $availabilityService;
    }

    public function getAllCourses()
    {
        $courses = Course::with('exercises')->orderBy('id')->get();
        $intro   = $this->availabilityService->getIntroCourse();

        if (!auth()->check()) {
            return response()->json(array_merge([$intro], $courses->values()->all()));
        }

        $userId          = auth()->id();
        $availabilityMap = $this->availabilityService->buildCourseAvailabilityMap($userId);

        $result = $courses->map(function ($course) use ($availabilityMap) {
            $available = $availabilityMap[$course->id] ?? false;

            return array_merge($course->toArray(), [
                'available'       => $available,
                'available_label' => $available ? null : 'Nog niet open, maak eerst het vorige deel af',
            ]);
        });
        return response()->json(array_merge([$intro], $result->values()->all()));
    }


    public function createCourse(Request $request)
    {
        $validated = $request->validate([
            'course_name' => 'required|string|max:255|unique:courses,course_name',
            'description' => 'nullable|string',
        ], [
            'course_name.unique' => 'Course name already exists!',
        ]);

        $course = Course::create($validated);

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

    public function getCourseAvailability($id)
    {
        $course = Course::with('exercises')->find($id);

        if (!$course) {
            return response()->json(['message' => 'Course not found.'], 404);
        }
        $userId = auth()->id();
        $result = $this->availabilityService->buildExerciseAvailability($course, $userId);

        return response()->json($result);
    }

    public function getCourseAvailabilityForUser($courseId, $userId)
    {
        if (!in_array(auth()->user()->role_id, [1, 3, 4])) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $course = Course::with('exercises')->find($courseId);

        if (!$course) {
            return response()->json(['message' => 'Course not found.'], 404);
        }
        $result = $this->availabilityService->buildExerciseAvailability($course, $userId);

        return response()->json($result);
    }

    public function getClientProgress($userId)
    {
        if (!in_array(auth()->user()->role_id, [1, 3, 4])) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $intro  = $this->availabilityService->getIntroCourse();
        $result = $this->availabilityService->getClientProgress($userId);

        return response()->json(array_merge([$intro], $result));
    }
}
