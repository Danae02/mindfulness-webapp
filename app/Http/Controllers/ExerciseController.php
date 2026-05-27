<?php

namespace App\Http\Controllers;

use App\Services\ResearchQuestionService;
use App\Models\Course;
use App\Models\Exercise;
use App\Models\UserExerciseLog;
use App\Models\ResearchSettings;
use App\Models\User;
use App\Services\ExerciseAvailabilityService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExerciseController extends Controller
{
    private ExerciseAvailabilityService $availabilityService;
    private ResearchQuestionService $researchQuestionService;

    public function __construct(
        ExerciseAvailabilityService $availabilityService,
        ResearchQuestionService $researchQuestionService
    ) {
        $this->availabilityService     = $availabilityService;
        $this->researchQuestionService = $researchQuestionService;
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
        if ($id === 'intro') {
            return Inertia::render('IntroExercisePage', [
                'exercise' => [
                    'id'              => 'intro',
                    'exercise_name'   => 'Begin uitleg mindfulness app',
                    'audio_file_path' => '/audio/1.mindfulness_app_inleiding.m4a',
                ],
            ]);
        }

        $exercise = Exercise::find($id);

        if (!$exercise) {
            abort(404, 'Exercise not found');
        }

        $exerciseData = $exercise->toArray();
        $exerciseData['audio_file_path'] = '/audio/' . basename($exercise->audio_file_path);
        $available = true;
        $availableLabel = null;
        $alreadyCompletedToday = false;
        $isNewestExercise = false;
        $researchMode = null;
        $researchQuestion = null;
        $researchAnswers = null;
        $forUserId = null;
        $isProxyMode = false;
        $proxyFeelingAnsweredToday = false;

        if (auth()->check()) {
            $userId = auth()->id();
            $rawForUser = request('for_user_id') ?? request('for_user');

            if ($rawForUser) {
                $forUserId = (int) $rawForUser;
                $isProxyMode = true;
            }

            $userForAvailability = $isProxyMode ? $forUserId : $userId;

            [$available, $availableLabel] = $this->checkExerciseAvailability(
                $exercise, $userForAvailability
            );

            $alreadyCompletedToday = $this->hasCompletedTodayCheck($id, $userForAvailability);

            $isNewestExercise = $this->availabilityService->isNewestAvailableExercise(
                (int) $id, $userForAvailability
            );

            $proxyFeelingAnsweredToday = $this->availabilityService->hasAnsweredFeelingToday(
                $userForAvailability
            );

            $userForQuestion = User::find($userForAvailability);
            [$researchMode, $researchQuestion, $researchAnswers] =
                $this->getResearchSettingsForUser($userForQuestion);
        }

        return Inertia::render('ExercisePage', [
            'exercise' => $exerciseData,
            'availability' => [
                'available'             => $available,
                'availableLabel'        => $availableLabel,
                'alreadyCompletedToday' => $alreadyCompletedToday,
                'isNewestExercise'      => $isNewestExercise,
            ],
            'research' => [
                'mode'     => $researchMode,
                'question' => $researchQuestion,
                'answers'  => $researchAnswers,
            ],
            'supervisorMode' => [
                'forUserId'               => $forUserId,
                'isSupervisorMode'        => $isProxyMode,
                'feelingAnsweredToday'    => $proxyFeelingAnsweredToday,
            ],
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
        $exercise = Exercise::findOrFail($id);

        // Als audio meegestuurd wordt, handle dat
        if ($request->hasFile('audio')) {
            $request->validate([
                'audio'          => 'required|file|max:10240',
                'exercise_name'  => 'required|string|max:255',
                'form_question'  => 'nullable|string',
                'form_answers'   => 'nullable|array',
            ]);

            $file = $request->file('audio');

            if (!$file->isValid()) {
                return response()->json(['error' => 'Invalid file.'], 400);
            }

            $filename = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('audio', $filename, 'public');

            $audioUrl = route('audio.serve', ['filename' => basename($filename)]);

            $durationSeconds = $this->getAudioDurationSeconds(
                storage_path('app/public/audio/' . $filename)
            );

            $totalSeconds = $durationSeconds !== null ? $durationSeconds + 60 : null;

            $exercise->update([
                'exercise_name'    => $request->input('exercise_name'),
                'audio_file_path'  => $audioUrl,
                'form_question'    => $request->input('form_question'),
                'form_answers'     => $request->input('form_answers'),
                'duration_seconds' => $totalSeconds,
            ]);
        } else {
            // update zonder audio
            $request->validate([
                'exercise_name'   => 'nullable|string|max:255',
                'description'     => 'nullable|string',
                'form_question'   => 'nullable|string',
                'form_answers'    => 'nullable|array',
            ]);
            $exercise->update($request->only(['exercise_name', 'description', 'form_question', 'form_answers']));
        }

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
        $logUserId   = $validated['user_id'];

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
            'message' => 'Oefening klaar en opgeslagen',
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
        $courseId = $exercise->course_id;
        if (!$courseId) {
            return [true, null];
        }

        $course = Course::find($courseId);
        if (!$course) {
            return [true, null];
        }

        $result = $this->availabilityService->buildExerciseAvailability($course, $userId);
        $exerciseAvailability = collect($result)->firstWhere('exercise_id', (int) $exercise->id);

        return [
            $exerciseAvailability['available'] ?? true,
            $exerciseAvailability['available_label'] ?? null,
        ];
    }

    private function hasCompletedTodayCheck(int $exerciseId, int $userId): bool
    {
        return UserExerciseLog::where('user_id', $userId)
            ->where('exercise_id', $exerciseId)
            ->whereDate('date_time', today())
            ->where('completed', true)
            ->exists();
    }

    private function getResearchSettingsForUser(?User $user): array
    {
        $researchSetting = ResearchSettings::where('key_name', 'mode')->first();
        $researchMode    = $researchSetting?->value;

        if (!$user) {
            return [$researchMode, null, null];
        }

        $activeQuestion = $this->researchQuestionService->getActiveQuestion($user);

        $researchQuestion = $activeQuestion['question'] ?: null;
        $researchAnswers  = !empty($activeQuestion['answers']) ? $activeQuestion['answers'] : null;

        return [$researchMode, $researchQuestion, $researchAnswers];
    }

    private function getAudioDurationSeconds(string $absolutePath): ?int
    {
        if (!file_exists($absolutePath)) {
            return null;
        }

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
