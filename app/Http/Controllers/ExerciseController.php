<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Exercise;
use App\Models\UserExerciseLog;
use App\Models\ResearchSettings;
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

        if (!$exercise) {
            abort(404, "Exercise not found");
        }

        // Check of de gebruiker deze oefening vandaag al heeft gedaan
        $alreadyCompletedToday = false;
        if (auth()->check()) {
            $alreadyCompletedToday = UserExerciseLog::where('user_id', auth()->id())
                ->where('exercise_id', $id)
                ->whereDate('date_time', today())
                ->where('completed', true)
                ->exists();
        }

        $user     = auth()->user();
        $question = null;
        $answers  = null;

        if ($user && $user->researchGroup && $user->researchGroup->question) {
            $question = $user->researchGroup->question;
            $answers  = $user->researchGroup->answers;
        } else {
            $setting  = ResearchSettings::where('key_name', 'mode')->first();
            $question = $setting->question ?? null;
            $answers  = $setting->answers ?? null;
        }

        return Inertia::render('ExercisePage', [
            'exercise'             => $exercise,
            'researchMode'         => 'per_exercise',
            'researchQuestion'     => $question,
            'researchAnswers'      => $answers,
            'alreadyCompletedToday' => $alreadyCompletedToday,
        ]);
    }

    public function updateExercise(Request $request, $id)
    {
        $request->validate([
            'exercise_name' => 'required|string|max:255',
            'form_question' => 'nullable|string|max:500',
            'form_answers'  => 'nullable|array',
            'form_answers.*' => 'nullable|string|max:255',
            'audio'         => 'nullable|file|mimes:mp3,wav|max:10240',
        ]);

        // Controleer of de oefening bestaat
        $exercise = Exercise::find($id);
        if (!$exercise) {
            return response()->json(['success' => false, 'message' => 'Exercise not found'], 404);
        }

        // Werk de oefening bij
        $exercise->exercise_name = $request->exercise_name;
        $exercise->form_question = $request->form_question ?? null;
        $exercise->form_answers  = $request->form_answers ?? [];

        // Controleer of er een nieuw audiobestand is geüpload
        if ($request->hasFile('audio')) {
            $audioPath = $request->file('audio')->store('public/audio');
            $exercise->audio_file_path = $audioPath;
        }

        // Sla de wijzigingen op
        if ($exercise->save()) {
            return response()->json(['success' => true, 'exercise' => $exercise], 200);
        }

        return response()->json(['success' => false, 'message' => 'Failed to update exercise'], 500);
    }

    public function submitCompletedLog(Request $request)
    {

        $request->validate([
            'user_id'       => 'required|exists:users,id',
            'exercise_id'   => 'required|exists:exercises,id',
            'feeling_before' => 'nullable|integer|min:1|max:5',
            'feeling_after'  => 'nullable|integer|min:1|max:5',
            'feeling_scale'  => 'nullable|integer|min:3|max:5', // Aantal opties dat getoond werd
        ]);

        $log = UserExerciseLog::create([
            'user_id'        => $request->user_id,
            'exercise_id'    => $request->exercise_id,
            'date_time'      => now(),
            //'duration_listened' => 0, // Of de juiste waarde als beschikbaar
            'completed'      => true,
            'feeling_before' => $request->feeling_before,
            'feeling_after'  => $request->feeling_after,

            'feeling_scale'  => $request->feeling_scale ?? 5,// Gebruik meegestuurde schaal, of val terug op 5 voor oude logs
        ]);

        return response()->json([
            'message' => 'Answer submitted successfully.',
            'log' => $log,
        ]);
    }
}
