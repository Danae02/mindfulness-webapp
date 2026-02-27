<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Exercise;
use App\Models\UserExerciseLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExerciseController extends Controller
{
    public function getExercises($id)
    {
        $course = Course::with('exercises')->find($id);

        if (!$course) {
            return response()->json([
                'message' => 'Course not found.',
            ], 404);
        }

        return response()->json($course->exercises);
    }

    public function showExercise($id)
    {
        $exercise = Exercise::find($id);

        // Controleer of de oefening bestaat
        if (!$exercise) {
            abort(404, "Exercise not found");
        }

        return Inertia::render('ExercisePage', [
            'exercise' => $exercise,
        ]);
    }

    public function updateExercise(Request $request, $id)
    {
        $request->validate([
            'exercise_name' => 'required|string|max:255',
            'form_question' => 'nullable|string|max:500',
            'form_answers' => 'nullable|array',
            'form_answers.*' => 'nullable|string|max:255',
            'audio' => 'nullable|file|mimes:mp3,wav|max:10240', // Max 10MB
        ]);

        // Controleer of de oefening bestaat
        $exercise = Exercise::find($id);
        if (!$exercise) {
            return response()->json([
                'success' => false,
                'message' => 'Exercise not found',
            ], 404);
        }

        // Werk de oefening bij
        $exercise->exercise_name = $request->exercise_name;
        $exercise->form_question = $request->form_question ?? null;
        $exercise->form_answers = $request->form_answers ?? []; // JSON array

        // Controleer of er een nieuw audiobestand is geüpload
        if ($request->hasFile('audio')) {
            $audioPath = $request->file('audio')->store('public/audio');
            $exercise->audio_file_path = $audioPath;
        }

        // Sla de wijzigingen op
        if ($exercise->save()) {
            return response()->json([
                'success' => true,
                'message' => 'Exercise updated successfully',
                'exercise' => $exercise,
            ], 200);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update exercise',
            ], 500);
        }
    }

    public function submitCompletedLog(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'exercise_id' => 'required|exists:exercises,id',
            'feeling_before' => 'nullable|string',
            'feeling_after' => 'nullable|string',
        ]);

        $userId = $request->user_id;
        $exerciseId = $request->exercise_id;

        // Maak altijd een nieuwe log aan
        $log = UserExerciseLog::create([
            'user_id' => $userId,
            'exercise_id' => $exerciseId,
            'date_time' => now(),
//            'duration_listened' => 0, // Of de juiste waarde als beschikbaar
            'completed' => true,
            'feeling_before' => $request->feeling_before,
            'feeling_after' => $request->feeling_after,
        ]);

        return response()->json([
            'message' => 'Answer submitted successfully.',
            'log' => $log,
        ]);
    }
}
