<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use App\Models\ResearchSettings;
use App\Models\UserExerciseLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AudioController extends Controller
{

    // CRUD voor Exercises
    public function getAllAudios()
    {
        return response()->json(Exercise::all());
    }

    public function getAudio($filename): StreamedResponse
    {
        // Correct path: storage/app/public/audio/
        $filePath = 'audio/' . $filename;

        if (!Storage::disk('public')->exists($filePath)) {
            abort(404, "Audiofile not found at: " . storage_path('app/public/' . $filePath));
        }

        return Storage::disk('public')->download($filePath);
    }

    //Toont de ExercisePage voor een oefening.Ondersteunt de vaste introductie-oefening via id='intro'.
    public function showExercise($id)
    {
        // Introductie-oefening (hardcoded, geen DB)
        if ($id === 'intro') {
            return Inertia::render('IntroExercisePage', [
                'exercise' => [
                    'id'              => 'intro',
                    'exercise_name'   => 'Introductie mindfulness app',
                    'audio_file_path' => '/storage/audio/1.mindfulness_app_inleiding.m4a',
                ],
            ]);
        }

        // Gewone oefening uit DB
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

        return Inertia::render('ExercisePage', [
            'exercise'              => array_merge($exercise->toArray(), [
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

        // Opslaan in storage/app/public/audio/ via de 'public' disk
        $filePath = $file->storeAs('audio', $filename, 'public');

        // URL genereert: /storage/audio/filename.mp3
        // Dit werkt omdat php artisan storage:link een symlink maakt
        $audioUrl = asset('storage/audio/' . $filename);

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

    private function getAudioDurationSeconds(string $absolutePath): ?int
    {
        if (!file_exists($absolutePath)) {
            return null;
        }

        // getID3 staat standaard in laravel via composer require james-heinrich/getid3
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
