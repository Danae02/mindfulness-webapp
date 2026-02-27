<?php


namespace App\Http\Controllers;

use App\Models\Exercise;
use App\Models\ResearchSettings;
use App\Models\UserExerciseLog;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
//    public function index()
//    {
//        $role = Auth::user()->role_id;
//        $exercises = Exercise::all();
//        $exerciseNames = $exercises->pluck('exercise_name')->toArray();
//        $userId = Auth::id();
//
//        $exerciseCountLastWeek = UserExerciseLog::where('user_id', $userId)
//            ->where('date_time', '>=', now()->subWeek())
//            ->count();
//
//
//        if ($role === 1) {
//            return Inertia::render('DashboardAdmin', []);
//        }
//        elseif ($role === 2) {
//            return Inertia::render('DashboardViewer', [
//                'exerciseCountLastWeek' => $exerciseCountLastWeek,
//                'exercises' => $exercises
//            ]);
//        } elseif($role === 3) {
//            return Inertia::render('DashboardSupervisor', []);
//        } elseif($role === 4) {
//            return Inertia::render('DashboardResearcher', [
//                'exerciseNames' => $exerciseNames,
//            ]);
//        }
//        return Inertia::render('Dashboard', []);
//    }

    public function index()
    {
        $role = Auth::user()->role_id;
        $userId = Auth::id();

        $researchSetting = ResearchSettings::where('key_name', 'mode')->first();
        $showSurvey = $researchSetting && $researchSetting->value === 'per_session';


        // Overige logica
        $exercises = Exercise::all();
        $exerciseCountLastWeek = UserExerciseLog::where('user_id', $userId)
            ->where('date_time', '>=', now()->subWeek())
            ->count();

        if ($role === 1) {
            return Inertia::render('DashboardAdmin', []);
        } elseif ($role === 2) {
            return Inertia::render('DashboardViewer', [
                'exerciseCountLastWeek' => $exerciseCountLastWeek,
                'exercises' => $exercises,
                'showSurvey' => $showSurvey,
            ]);
        } elseif ($role === 3) {
            return Inertia::render('DashboardSupervisor', []);
        } elseif ($role === 4) {
            return Inertia::render('DashboardResearcher', [
                'exerciseNames' => $exercises->pluck('exercise_name')->toArray(),
            ]);
        }
        return Inertia::render('Dashboard', []);
    }

    public function medianDataForResearchers() {
        $exerciseLogs = UserExerciseLog::all();

        dd($exerciseLogs->where('exercise_id', 1)->where("completed", 1)->count());

//        return $timesOneExerciseCompleted;
    }

};

