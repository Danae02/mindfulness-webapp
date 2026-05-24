<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use App\Models\ResearchSettings;
use App\Models\UserExerciseLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AudioController extends Controller
{

    public function getAllAudios()
    {
        return response()->json(Exercise::all());
    }


    public function getAudio($filename)
    {
        // Correct path: storage/app/public/audio/
        $filePath = storage_path('app/public/audio/' . $filename);

        if (!file_exists($filePath)) {
            abort(404, 'Audiobestand niet gevonden: ' . $filePath);
        }

        return response()->file($filePath);
    }

    private function audioUrl(string $filename): string
    {
        return route('audio.serve', ['filename' => basename($filename)]);
    }

    public function showExercise($id)
    {
        if ($id === 'intro') {
            return Inertia::render('IntroExercisePage', [
                'exercise' => [
                    'id'              => 'intro',
                    'exercise_name'   => 'Introductie mindfulness app',
                    'audio_file_path' => $this->audioUrl('1.mindfulness_app_inleiding.m4a'),
                ],
            ]);
        }

        $exercise = Exercise::find($id);

        if (!$exercise) {
            abort(404, 'Exercise not found');
        }

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

        $exerciseData = $exercise->toArray();

        // Herschrijf de audio-URL naar /audio/{filename} zodat het door Laravel gaat
        $exerciseData['audio_file_path'] = $this->audioUrl($exercise->audio_file_path);

        return Inertia::render('ExercisePage', [
            'exercise'              => array_merge($exerciseData, [
                'duration' => $exercise->duration_minutes,
            ]),
            'researchMode'          => 'per_exercise',
            'researchQuestion'      => $question,
            'researchAnswers'       => $answers,
            'alreadyCompletedToday' => $alreadyCompletedToday,
        ]);
    }

    public function uploadAudio(Request $request)
    {
        $request->validate([
            'audio'          => 'required|file|max:10240',
            'exercise_name'  => 'required|string|max:255',
            'course_id'      => 'required|exists:courses,id',
            'form_question'  => 'nullable|string',
            'form_answers'   => 'nullable|array',
            'mode'           => 'nullable|string|in:per_session,other',
        ]);

        if (!$request->hasFile('audio')) {
            return response()->json(['error' => 'No file uploaded.'], 400);
        }

        $file = $request->file('audio');

        if (!$file->isValid()) {
            return response()->json(['error' => 'Invalid file.'], 400);
        }

        $filename = time() . '_' . $file->getClientOriginalName();

        $file->storeAs('audio', $filename, 'public');

        // Sla de /audio/ route-URL op (niet de asset URL) zodat seeking altijd werkt
        $audioUrl = $this->audioUrl($filename);

        // Bereken de audioduur via getID3
        // Correcte path: storage/app/public/audio/
        $durationSeconds = $this->getAudioDurationSeconds(
            storage_path('app/public/audio/' . $filename)
        );

        // Voeg 60 seconden toe voor het invullen van de gevoelsvragen
        $totalSeconds = $durationSeconds !== null ? $durationSeconds + 60 : null;

        $exercise = Exercise::create([
            'exercise_name'    => $request->input('exercise_name'),
            'audio_file_path'  => $audioUrl,
            'course_id'        => $request->input('course_id'),
            'times_done'       => 0,
            'form_question'    => $request->input('form_question'),
            'form_answers'     => $request->input('form_answers'),
            'duration_seconds' => $totalSeconds,
        ]);

        return response()->json([
            'message'  => 'Exercise created successfully!',
            'exercise' => $exercise,
        ]);
    }

    public function updateAudio(Request $request, $id)
    {
        $request->validate([
            'audio'          => 'required|file|max:10240',
            'exercise_name'  => 'required|string|max:255',
            'form_question'  => 'nullable|string',
            'form_answers'   => 'nullable|array',
        ]);

        $exercise = Exercise::findOrFail($id);

        if (!$request->hasFile('audio')) {
            return response()->json(['error' => 'No file uploaded.'], 400);
        }

        $file = $request->file('audio');

        if (!$file->isValid()) {
            return response()->json(['error' => 'Invalid file.'], 400);
        }

        $filename = time() . '_' . $file->getClientOriginalName();
        $file->storeAs('audio', $filename, 'public');
        $audioUrl = $this->audioUrl($filename);

        $durationSeconds = $this->getAudioDurationSeconds(
            storage_path('app/public/audio/' . $filename)
        );

        $totalSeconds = $durationSeconds !== null ? $durationSeconds + 60 : null;

        $exercise->update([
            'exercise_name'    => $request->input('exercise_name'),
            'audio_file_path'  => $audioUrl,
            'form_question'    => $request->input('form_question'),
            'form_answers'     => $request->input('form_answers'),
            'duration_seconds' => $totalSeconds,
        ]);

        return response()->json([
            'message'  => 'Exercise updated successfully!',
            'exercise' => $exercise,
        ]);
    }

    private function getAudioDurationSeconds(string $absolutePath): ?int
    {
        if (!file_exists($absolutePath)) {
            return null;
        }

        if (!class_exists(\getID3::class)) {
            return null;
        }

        try {
            $getID3   = new \getID3();
            $fileInfo = $getID3->analyze($absolutePath);

            if (isset($fileInfo['playtime_seconds'])) {
                return (int) ceil($fileInfo['playtime_seconds']);
            }
        } catch (\Throwable $e) {
            \Log::warning('getID3 kon duur niet lezen: ' . $e->getMessage());
        }
        return null;
    }
}
