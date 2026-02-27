<?php

namespace App\Http\Controllers;

use App\Models\Chapter;
use App\Models\Course;
use App\Models\Exercise;
use App\Models\UserExerciseLog;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
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
//            'audio' => 'required|file|mimes:mp3,wav,m4a|max:10240',
            'audio' => 'required|file|max:10240',
            'exercise_name' => 'required|string|max:255',
//            'course_name' => 'required|string|max:255',
//            'category' => 'required|string|max:255',
//            'keywords' => 'required|array',
            'course_id' => 'required|exists:courses,id',
            'form_question' => 'nullable|string',
            'form_answers' => 'nullable|array',
            'mode' => 'nullable|string|in:per_session,other', // new
        ]);

        if ($request->hasFile('audio')) {
            $file = $request->file('audio');

            if ($file->isValid()) {
                $filename = time() . '_' . $file->getClientOriginalName();

                $filePath = $file->storeAs('/audio', $filename);  // 'storage/audio' is de juiste locatie

                $audioUrl = asset('storage/audio/' . $filename);

                $exercise = Exercise::create([
                    'exercise_name' => $request->input('exercise_name'),
//                    'category' => $request->input('category'),
//                    'keywords' => $request->input('keywords'),
                    'audio_file_path' => $audioUrl,
                    'course_id' => $request->input('course_id'),
                    'times_done' => 0,
//                    'last_time' => now(),
                    'form_question' => $request->input('form_question'),
                    'form_answers' => $request->input('form_answers'),
                ]);

                return response()->json([
                    'message' => 'Exercise created successfully!',
                    'exercise' => $exercise,
                ]);
            } else {
                return response()->json(['error' => 'Invalid file.'], 400);
            }
        } else {
            return response()->json(['error' => 'No file uploaded.'], 400);
        }
    }
}
