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
        $query = UserExerciseLog::with(['exercise', 'user'])
            ->when($request->filled('exercise_id'), function($q) use ($request) {
                $q->where('exercise_id', $request->exercise_id);
            })
            ->when($request->filled('research_group_id'), function($q) use ($request) {
                $q->whereHas('user', function($u) use ($request) {
                    $u->where('research_group_id', $request->research_group_id);
                });
            })
            ->when($request->filled('date_from'), function($q) use ($request) {
                $q->whereDate('date_time', '>=', $request->date_from);
            })
            ->when($request->filled('date_to'), function($q) use ($request) {
                $q->whereDate('date_time', '<=', $request->date_to);
            })
            ->orderBy('date_time', 'desc');

        return response()->json($query->paginate(20));
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

    public function export(Request $request)
    {
        $query = UserExerciseLog::with(['exercise', 'user'])
            ->when($request->filled('exercise_id'), function ($q) use ($request) {
                $q->where('exercise_id', $request->exercise_id);
            })
            ->when($request->filled('research_group_id'), function ($q) use ($request) {
                // Filter via de user relatie op research_group_id
                $q->whereHas('user', function ($u) use ($request) {
                    $u->where('research_group_id', $request->research_group_id);
                });
            })
            ->when($request->filled('date_from'), function ($q) use ($request) {
                $q->whereDate('date_time', '>=', $request->date_from);
            })
            ->when($request->filled('date_to'), function ($q) use ($request) {
                $q->whereDate('date_time', '<=', $request->date_to);
            })
            ->orderBy('date_time', 'desc');

        return response()->json($query->get());
    }
}
