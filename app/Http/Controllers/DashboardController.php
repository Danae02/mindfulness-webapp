<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use App\Models\ResearchGroup;
use App\Models\ResearchSettings;
use App\Models\UserExerciseLog;
use App\Services\ExerciseAvailabilityService;
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
        $role   = Auth::user()->role_id;
        $userId = Auth::id();

        $researchSetting = ResearchSettings::where('key_name', 'mode')->first();
        $showSurvey      = $researchSetting && $researchSetting->value === 'per_session';

        $exercises             = Exercise::all();
        $exerciseCountLastWeek = UserExerciseLog::where('user_id', $userId)
            ->where('date_time', '>=', now()->subWeek())
            ->count();

        if ($role === 1) {
            return Inertia::render('DashboardAdmin', [
                'researchGroups' => ResearchGroup::select('id', 'name')->orderBy('name')->get(),
                'exercises'      => $exercises->map(fn($e) => ['id' => $e->id, 'exercise_name' => $e->exercise_name])->values(),
            ]);
        } elseif ($role === 2) {
            // Gebruik de service om de juiste volgende oefening te bepalen, rekening houdend met beschikbaarheid en de +1 dag regel
            $availabilityService = new ExerciseAvailabilityService();
            $nextExercise        = $availabilityService->getNextExerciseForUser($userId);

            // Haal op welke oefeningen de gebruiker vandaag al heeft afgerond
            $completedTodayIds = UserExerciseLog::where('user_id', $userId)
                ->whereDate('date_time', today())
                ->where('completed', true)
                ->pluck('exercise_id')
                ->values();

            return Inertia::render('DashboardViewer', [
                'exerciseCountLastWeek' => $exerciseCountLastWeek,
                'exercises'             => $exercises,
                'showSurvey'            => $showSurvey,
                'nextExercise'          => $nextExercise ?
                    ['id'            => $nextExercise->id,
                    'exercise_name' => $nextExercise->exercise_name, ] : null,
                'completedTodayIds'     => $completedTodayIds,
            ]);
        } elseif ($role === 3) {
            return Inertia::render('DashboardSupervisor', []);
        } elseif ($role === 4) {
            return Inertia::render('DashboardResearcher', [
                'exerciseNames'  => $exercises->pluck('exercise_name')->toArray(),
                'exercises'      => $exercises->map(fn($e) => ['id' => $e->id, 'exercise_name' => $e->exercise_name])->values(),
                'researchGroups' => ResearchGroup::select('id', 'name')->orderBy('name')->get(),
            ]);
        }

        return Inertia::render('Dashboard', []);
    }

    public function medianDataForResearchers()
    {
        $exerciseLogs = UserExerciseLog::all();

        dd($exerciseLogs->where('exercise_id', 1)->where("completed", 1)->count());

//        return $timesOneExerciseCompleted;
    }
}
