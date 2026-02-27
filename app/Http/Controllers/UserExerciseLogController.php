<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use App\Models\UserExerciseLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UserExerciseLogController extends Controller
{
//    public function index(Request $request) {
//        // Haal logs op met de gekoppelde exercises
//        $userExerciseLogs = UserExerciseLog::with('exercise')->get();
//
//        // Optionele filter op naam van de oefening
//        $exerciseName = $request->query('exercise_name');
//        if ($exerciseName) {
//            $userExerciseLogs = $userExerciseLogs->filter(function ($log) use ($exerciseName) {
//                return stripos($log->exercise->exercise_name, $exerciseName) !== false;
//            });
//        }
//
//        return response()->json($userExerciseLogs);
//    }

    public function index(Request $request)
    {
        // Pagineren van logs met bijbehorende oefeningen
        $userExerciseLogs = UserExerciseLog::with('exercise')
            ->paginate(10); // Geeft 10 resultaten per pagina

        return response()->json($userExerciseLogs);
    }

//    public function index()
//    {
//        // Haal de logs op met paginering
//        $userExerciseLogs = UserExerciseLog::with('exercise') // Als je oefeninggegevens nodig hebt
//        ->paginate(10);  // Je kunt het aantal per pagina aanpassen (10 is hier als voorbeeld)
//
//        return Inertia::render('UserExerciseLogs', [
//            'userExerciseLogs' => $userExerciseLogs
//        ]);
//    }

    public function statistics(Request $request) {
        $exerciseName = $request->query('exercise_name');
        $exerciseId = Exercise::where('exercise_name', $exerciseName)->first()->id;

        if($exerciseId) {
            return UserExerciseLog::where('exercise_id', $exerciseId)->get();
        }
    }

    public function trackSession(Request $request, $logId)
    {
        $request->validate([
            'duration' => 'required|integer|min:1',
        ]);

        $log = UserExerciseLog::findOrFail($logId);

        // Update sessieduur
        $log->session_duration = $log->session_duration + $request->duration ?? $request->duration;
        $log->save();

        return response()->json(['message' => 'Session duration updated successfully!']);
    }

    public function getDurationSessions()
    {
        $userLogs = UserExerciseLog::select('user_id', DB::raw('SUM(session_duration) as total_duration'))
            ->groupBy('user_id')
            ->with('user')
            ->get();

        return response()->json($userLogs);
    }
}
