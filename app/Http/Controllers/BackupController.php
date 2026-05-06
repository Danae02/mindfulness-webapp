<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Exercise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use ZipArchive;


class BackupController extends Controller
{

// voor het downloaden van een backup zip
    public function downloadBackup()
    {
        // verzamel alle cursussen met oefeningen
        $courses = Course::with('exercises')->orderBy('id')->get();

        // Bouw metadata json bestand
        $metadata = [
            'backup_version' => '1.0',
            'created_at'     => now()->toISOString(),
            'courses'        => [],
        ];

        foreach ($courses as $course) {
            $courseData = [
                'id'          => $course->id,
                'course_name' => $course->course_name,
                'description' => $course->description,
                'exercises'   => [],
            ];

            foreach ($course->exercises as $exercise) {
                $courseData['exercises'][] = [
                    'id'              => $exercise->id,
                    'exercise_name'   => $exercise->exercise_name,
                    'audio_file_path' => $exercise->audio_file_path,
                    'form_question'   => $exercise->form_question,
                    'form_answers'    => $exercise->form_answers,
                    'times_done'      => $exercise->times_done,
                ];
            }
            $metadata['courses'][] = $courseData;
        }

        $zipFileName = 'backup_' . now()->format('Y-m-d_His') . '.zip';
        $zipPath     = storage_path('app/temp/' . $zipFileName);

        if (!is_dir(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return response()->json(['message' => 'Kon ZIP-bestand niet aanmaken.'], 500);
        }

        // Voeg metadata JSON toe
        $zip->addFromString('metadata.json', json_encode($metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        // Voeg alle audiobestanden toe
        $audioDir = storage_path('app/public/audio');
        if (is_dir($audioDir)) {
            $audioFiles = scandir($audioDir);
            foreach ($audioFiles as $file) {
                if ($file === '.' || $file === '..') {
                    continue;
                }
                $fullPath = $audioDir . '/' . $file;
                if (is_file($fullPath)) {
                    $zip->addFile($fullPath, 'audio/' . $file);
                }
            }
        }
        $zip->close();

        // Stuur bestand naar de browser en verwijder het daarna
        return response()->download($zipPath, $zipFileName)->deleteFileAfterSend(true);
    }


    // Voor herstel: terug zetten van backup
    public function restoreBackup(Request $request)
    {
        $request->validate([
            'backup' => 'required|file|mimes:zip|max:102400', // max 100MB
        ]);

        $file    = $request->file('backup');
        $tmpPath = storage_path('app/temp/restore_' . time() . '.zip');

        if (!is_dir(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        $file->move(storage_path('app/temp'), basename($tmpPath));

        $zip = new ZipArchive();
        if ($zip->open($tmpPath) !== true) {
            unlink($tmpPath);
            return response()->json(['message' => 'Ongeldig ZIP-bestand.'], 422);
        }

        // Lees data uit de ZIP
        $metadataJson = $zip->getFromName('metadata.json');
        if ($metadataJson === false) {
            $zip->close();
            unlink($tmpPath);
            return response()->json(['message' => 'metadata.json niet gevonden in backup.'], 422);
        }

        $metadata = json_decode($metadataJson, true);
        if (!isset($metadata['courses'])) {
            $zip->close();
            unlink($tmpPath);
            return response()->json(['message' => 'Ongeldige metadata structuur.'], 422);
        }

        // zorg dat audio-map bestaat
        $audioDir = storage_path('app/public/audio');
        if (!is_dir($audioDir)) {
            mkdir($audioDir, 0755, true);
        }

        // Herstel audiobestanden
        $restoredAudio = 0;
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            if (str_starts_with($name, 'audio/') && strlen($name) > 6) {
                $filename    = basename($name);
                $destination = $audioDir . '/' . $filename;
                $content     = $zip->getFromIndex($i);
                file_put_contents($destination, $content);
                $restoredAudio++;
            }
        }

        $zip->close();
        unlink($tmpPath);

        // Herstel cursussen en oefeningen in de database
        // Bestaande cursussen en oefeningen NIET verwijderen om foreign key problemen (user_exercise_logs) te vermijden
        $restoredCourses   = 0;
        $restoredExercises = 0;

        DB::transaction(function () use ($metadata, &$restoredCourses, &$restoredExercises) {
            foreach ($metadata['courses'] as $courseData) {
                // zoek op naam, maak aan als niet bestaat
                $course = Course::firstOrCreate(
                    ['course_name' => $courseData['course_name']],
                    ['description' => $courseData['description'] ?? null]
                );

                // Als cursus al bestond, update description
                if (!$course->wasRecentlyCreated) {
                    $course->update(['description' => $courseData['description'] ?? null]);
                } else {
                    $restoredCourses++;
                }

                foreach ($courseData['exercises'] as $exerciseData) {
                    $audioUrl = asset('storage/audio/' . basename($exerciseData['audio_file_path']));

                    $exercise = Exercise::firstOrCreate(
                        [
                            'exercise_name' => $exerciseData['exercise_name'],
                            'course_id'     => $course->id,
                        ],
                        [
                            'audio_file_path' => $audioUrl,
                            'form_question'   => $exerciseData['form_question'] ?? null,
                            'form_answers'    => $exerciseData['form_answers'] ?? null,
                            'times_done'      => $exerciseData['times_done'] ?? 0,
                        ]
                    );

                    if (!$exercise->wasRecentlyCreated) {
                        // update audiopad (kan veranderd zijn na server-reset)
                        $exercise->update(['audio_file_path' => $audioUrl]);
                    } else {
                        $restoredExercises++;
                    }
                }
            }
        });

        return response()->json([
            'message'            => 'Backup succesvol teruggezet!',
            'restored_courses'   => $restoredCourses,
            'restored_exercises' => $restoredExercises,
            'restored_audio'     => $restoredAudio,
        ]);
    }
}
