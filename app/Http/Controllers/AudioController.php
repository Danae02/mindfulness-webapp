<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AudioController extends Controller
{
    // ================================
    // CRUD voor Exercises
    // ================================

    public function getAllAudios()
    {
        return response()->json(Exercise::all());
    }

    public function getAudio($filename): StreamedResponse
    {
//        $filePath = "/storage/audio/$filename";

        $filePath = storage_path('app/storage/public/audio/');

        if (!Storage::exists($filePath)) {
            abort(404, "Audiofile not found");
        }

        return Storage::download($filePath);
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
        $filePath = $file->storeAs('audio', $filename, 'public');
        $audioUrl = asset('storage/audio/' . $filename);

        // Bereken de audioduur via getID3
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

        // getID3 staat standaard in laravel via james-heinrich/getid3
        // Installeer via: composer require james-heinrich/getid3
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
