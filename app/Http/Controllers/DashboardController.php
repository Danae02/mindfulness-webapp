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
    private ExerciseAvailabilityService $availabilityService;

    public function __construct(ExerciseAvailabilityService $availabilityService)
    {
        $this->availabilityService = $availabilityService;
    }

    public function index()
    {
        $role   = Auth::user()->role_id;
        $userId = Auth::id();

        return match ($role) {
            1 => $this->getDashboardAdmin(),
            2 => $this->getDashboardViewer($userId),
            3 => $this->getDashboardSupervisor(),
            4 => $this->getDashboardResearcher(),
            default => Inertia::render('Dashboard', []),
        };
    }

    private function getDashboardAdmin()
    {
        return Inertia::render('DashboardAdmin', [
            'researchGroups' => $this->getResearchGroups(),
            'exercises'      => $this->getExercisesForAdmin(),
        ]);
    }

    private function getDashboardViewer(int $userId)
    {
        $researchSetting = ResearchSettings::where('key_name', 'mode')->first();
        $showSurvey      = $researchSetting?->value === 'per_session';

        $exercises = Exercise::all();
        $exerciseCountLastWeek = UserExerciseLog::where('user_id', $userId)
            ->where('date_time', '>=', now()->subWeek())
            ->count();

        $nextExercise = $this->availabilityService->getNextExerciseForUser($userId);
        $completedTodayIds = UserExerciseLog::where('user_id', $userId)
            ->whereDate('date_time', today())
            ->where('completed', true)
            ->pluck('exercise_id')
            ->values();

        return Inertia::render('DashboardViewer', [
            'exerciseCountLastWeek' => $exerciseCountLastWeek,
            'exercises'             => $exercises,
            'showSurvey'            => $showSurvey,
            'nextExercise'          => $nextExercise ? [
                'id'              => $nextExercise->id,
                'exercise_name'   => $nextExercise->exercise_name,
            ] : null,
            'completedTodayIds'     => $completedTodayIds,
        ]);
    }

    private function getDashboardSupervisor()
    {
        return Inertia::render('DashboardSupervisor', []);
    }

    private function getDashboardResearcher()
    {
        $exercises = Exercise::all();

        return Inertia::render('DashboardResearcher', [
            'exerciseNames'  => $exercises->pluck('exercise_name')->toArray(),
            'exercises'      => $this->getExercisesForAdmin(),
            'researchGroups' => $this->getResearchGroups(),
        ]);
    }

    private function getResearchGroups()
    {
        return ResearchGroup::select('id', 'name')
            ->orderBy('name')
            ->get();
    }

    private function getExercisesForAdmin()
    {
        return Exercise::all()
            ->map(fn($e) => [
                'id'              => $e->id,
                'exercise_name'   => $e->exercise_name,
            ])
            ->values();
    }
}
