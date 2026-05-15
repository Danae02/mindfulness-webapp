<?php

namespace App\Http\Controllers;

use App\Services\CourseService;
use App\Models\Course;
use App\Models\Exercise;
use App\Models\UserExerciseLog;
use App\Models\ResearchSettings;
use App\Services\ExerciseAvailabilityService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExerciseController extends Controller
{
    private ExerciseAvailabilityService $availabilityService;
    private CourseService $courseService;

    public function __construct(ExerciseAvailabilityService $availabilityService, CourseService $courseService)
    {
        $this->availabilityService = $availabilityService;
        $this->courseService = $courseService;
    }

    public function index()
    {
        $exercises = Exercise::all();
        return response()->json($exercises);
    }

    public function getAllExercises()
    {
        $exercises = Exercise::all();
        return response()->json($exercises);
    }

    public function showExercise($id)
    {
        $exercise = Exercise::find($id);

        if (!$exercise) {
            abort(404, 'Exercise not found');
        }

        $exerciseData = $exercise->toArray();
        $exerciseAvailable = true;
        $availableLabel = null;
        $alreadyCompletedToday = false;
        $researchMode = null;
        $researchQuestion = null;
        $researchAnswers = null;
        $forUserId = null;
        $isProxyMode = false;
        $isNewestExercise = false;
        $proxyFeelingAnsweredToday = false;

        if (auth()->check()) {
            $userId = auth()->id();
            $rawForUser = request('for_user_id') ?? request('for_user');

            if ($rawForUser) {
                $forUserId = (int) $rawForUser;
                $isProxyMode = true;
            }

            $userForAvailability = $isProxyMode ? $forUserId : $userId;

            [$exerciseAvailable, $availableLabel] = $this->checkExerciseAvailability(
                $exercise, $userForAvailability
            );

            $alreadyCompletedToday = $this->hasCompletedTodayCheck($id, $userForAvailability);

            $isNewestExercise = $this->availabilityService->isNewestAvailableExercise(
                (int) $id, $userForAvailability
            );

            $proxyFeelingAnsweredToday = $this->availabilityService->hasAnsweredFeelingToday(
                $userForAvailability
            );

            [$researchMode, $researchQuestion, $researchAnswers] = $this->getResearchSettings();
        }

        return Inertia::render('ExercisePage', [
            'exercise'                  => $exerciseData,
            'available'                 => $exerciseAvailable,
            'availableLabel'            => $availableLabel,
            'alreadyCompletedToday'     => $alreadyCompletedToday,
            'forUserId'                 => $forUserId,
            'isProxyMode'               => $isProxyMode,
            'researchMode'              => $researchMode,
            'researchQuestion'          => $researchQuestion,
            'researchAnswers'           => $researchAnswers,
            'isNewestExercise'          => $isNewestExercise,
            'proxyFeelingAnsweredToday' => $proxyFeelingAnsweredToday,
        ]);
    }

    public function getExerciseAvailability($id)
    {
        $exercise = Exercise::find($id);
        if (!$exercise) {
            return response()->json(['available' => true, 'available_label' => null]);
        }

        $userId = auth()->id();
        $rawForUser = request('for_user_id') ?? request('for_user');
        $targetUser = $rawForUser ? (int) $rawForUser : $userId;

        [$available, $availableLabel] = $this->checkExerciseAvailability($exercise, $targetUser);

        $alreadyCompletedToday = $this->hasCompletedTodayCheck($id, $targetUser);

        return response()->json([
            'available'             => $available,
            'available_label'       => $availableLabel,
            'alreadyCompletedToday' => $alreadyCompletedToday,
        ]);
    }

    public function getExercises($courseId)
    {
        $course = Course::with('exercises')->find($courseId);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        return response()->json($course->exercises);
    }

    public function updateExercise(Request $request, $id)
    {
        $request->validate([
            'exercise_name'   => 'nullable|string|max:255',
            'description'     => 'nullable|string',
            'audio_file_path' => 'nullable|string',
        ]);

        $exercise = Exercise::findOrFail($id);
        $exercise->update($request->only(['exercise_name', 'description', 'audio_file_path']));

        return response()->json([
            'message'  => 'Exercise updated successfully!',
            'exercise' => $exercise,
        ]);
    }

    public function submitCompletedLog(Request $request)
    {
        $validated = $request->validate([
            'user_id'          => 'required|integer|exists:users,id',
            'exercise_id'      => 'required|integer|exists:exercises,id',
            'feeling_before'   => 'nullable|integer|min:1|max:10',
            'feeling_after'    => 'nullable|integer|min:1|max:10',
            'feeling_scale'    => 'nullable|integer|min:3|max:10',
            'session_duration' => 'nullable|integer|min:0',
            'date_time'        => 'nullable|date',
        ]);

        $currentUser = auth()->user();
        $logUserId = $validated['user_id'];

        // Autorisatiecheck
        if ($currentUser->role_id === 2) {
            if ($logUserId !== $currentUser->id) {
                return response()->json(['error' => 'Je kunt alleen voor jezelf oefeningen loggen'], 403);
            }
        } elseif (!in_array($currentUser->role_id, [1, 3, 4])) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $log = UserExerciseLog::create([
            'user_id'          => $logUserId,
            'exercise_id'      => $validated['exercise_id'],
            'feeling_before'   => $validated['feeling_before'] ?? null,
            'feeling_after'    => $validated['feeling_after'] ?? null,
            'feeling_scale'    => $validated['feeling_scale'] ?? null,
            'session_duration' => $validated['session_duration'] ?? 0,
            'date_time'        => $validated['date_time'] ?? now(),
            'completed'        => true,
        ]);

        return response()->json([
            'message' => 'Oefening voltooid en opgeslagen',
            'log'     => $log,
        ], 201);
    }

    public function destroy($id)
    {
        $exercise = Exercise::findOrFail($id);
        $exercise->delete();

        return response()->json(['message' => 'Exercise deleted successfully']);
    }


    private function checkExerciseAvailability(Exercise $exercise, int $userId): array
    {
        $exerciseAvailable = true;
        $availableLabel = null;

        $courseId = $exercise->course_id;
        if ($courseId) {
            $course = Course::find($courseId);
            if ($course) {
                $courseController = new CourseController($this->courseService);
                $availabilityResponse = $courseController->getCourseAvailabilityForUser($courseId, $userId);
                $availabilityData = json_decode($availabilityResponse->getContent(), true);

                $exerciseAvailability = collect($availabilityData)
                    ->firstWhere('exercise_id', (int) $exercise->id);

                if ($exerciseAvailability) {
                    $exerciseAvailable = $exerciseAvailability['available'] ?? true;
                    $availableLabel = $exerciseAvailability['available_label'] ?? null;
                }
            }
        }

        return [$exerciseAvailable, $availableLabel];
    }


    private function hasCompletedTodayCheck(int $exerciseId, int $userId): bool
    {
        return UserExerciseLog::where('user_id', $userId)
            ->where('exercise_id', $exerciseId)
            ->whereDate('date_time', today())
            ->where('completed', true)
            ->exists();
    }


    private function getResearchSettings(): array
    {
        $researchMode = null;
        $researchQuestion = null;
        $researchAnswers = null;

        $researchSetting = ResearchSettings::where('key_name', 'mode')->first();
        if ($researchSetting) {
            $researchMode = $researchSetting->value;

            if ($researchSetting->question && $researchSetting->answers) {
                $researchQuestion = $researchSetting->question;
                $researchAnswers = $researchSetting->answers;
            }
        }

        return [$researchMode, $researchQuestion, $researchAnswers];
    }
}
