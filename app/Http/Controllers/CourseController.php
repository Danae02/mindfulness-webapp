<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function getAllCourses()
    {
        $courses = Course::with('exercises')->get();
        return response()->json($courses);
    }

    // Maak een nieuw chapter aan
    public function createCourse(Request $request)
    {
        $validated = $request->validate([
            'course_name' => 'required|string|max:255',
        ]);

        // Controleer of de cursusnaam al bestaat
        $exists = Course::where('course_name', $validated['course_name'])->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Course name already exists!',
            ], 422); // HTTP-status 422: Unprocessable Entity
        }

        $course = Course::create([
            'course_name' => $validated['course_name'],
        ]);

        return response()->json([
            'message' => 'Course created successfully!',
            'course_id' => $course->id,
        ]);
    }

    public function getCourseDetails($id)
    {
        // Haal de cursus op inclusief de bijbehorende oefeningen
        $course = Course::with('exercises')->find($id);

        if (!$course) {
            return response()->json([
                'message' => 'Course not found.',
            ], 404); // HTTP-status 404: Not Found
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

        if (!$course) {
            return response()->json([
                'message' => 'Course not found.',
            ], 404); // HTTP-status 404: Not Found
        }


        $course->update($request->only(['course_name', 'description']));

        return response()->json([
            'message' => 'Course updated successfully!',
            'course' => $course,
        ]);
    }

    public function deleteCourse($id)
    {
        $course = Course::findOrFail($id);

        if (!$course) {
            return response()->json([
                'message' => 'Course not found.',
            ], 404); // HTTP-status 404: Not Found
        }

        $course->delete();

        return response()->json(['message' => 'Course deleted successfully!']);
    }
}
