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
                'available'            => $available,
                'availableLabel'       => $availableLabel,
                'alreadyCompletedToday' => $alreadyCompletedToday,
                'isNewestExercise'     => $isNewestExercise,
            ],
            'research' => [
                'mode'    => $researchMode,
                'question' => $researchQuestion,
                'answers' => $researchAnswers,
            ],
            'proxy' => [
                'forUserId'           => $forUserId,
                'isProxyMode'         => $isProxyMode,
                'feelingAnsweredToday' => $proxyFeelingAnsweredToday,
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
}
//
//
//namespace App\Models;
//
//use App\Services\EmailEncryptionService;
//use Illuminate\Database\Eloquent\Factories\HasFactory;
//use Illuminate\Foundation\Auth\User as Authenticatable;
//use Illuminate\Notifications\Notifiable;
//
//class User extends Authenticatable
//{
//    /** @use HasFactory<\Database\Factories\UserFactory> */
//    use HasFactory, Notifiable;
//
//    /**
//     * The attributes that are mass assignable.
//     *
//     * @var array<int, string>
//     */
//    protected $fillable = [
//        'name',
//        'email',
//        'email_index',
//        'password',
//        'role_id',
//        'is_reviewed',
//        'research_group_id',
//    ];
//
//    /**
//     * The attributes that should be hidden for serialization.
//     *
//     * @var array<int, string>
//     */
//    protected $hidden = [
//        'password',
//        'remember_token',
//        'email_index'
//    ];
//
//    /**
//     * Get the attributes that should be cast.
//     *
//     * @return array<string, string>
//     */
//    protected function casts(): array
//    {
//        return [
//            'email_verified_at' => 'datetime',
//            'password' => 'hashed',
//            'is_reviewed' => 'boolean',
//        ];
//    }
//
//    /**
//     * Automatically encrypt email when setting.
//     */
//    public function setEmailAttribute(string $email): void
//    {
//        $svc = app(EmailEncryptionService::class);
//        $this->attributes['email'] = $svc->encrypt($email);
//        $this->attributes['email_index'] = $svc->blindIndex($email);
//    }
//
//    /**
//     * Automatically decrypt email when retrieving.
//     */
//    public function getEmailAttribute(string $value): string
//    {
//        return app(EmailEncryptionService::class)->decrypt($value);
//    }
//
//    /**
//     * Set default role to 'viewer' (role_id = 2) on creation.
//     */
//    protected static function booted()
//    {
//        static::creating(function ($user) {
//            if (is_null($user->role_id)) {
//                $user->role_id = 2; // Default to 'viewer'
//            }
//        });
//    }
//
//    /**
//     * Get the role associated with this user.
//     */
//    public function role()
//    {
//        return $this->belongsTo(Role::class);
//    }
//
//    /**
//     * Get all sessions for this user.
//     */
//    public function sessions()
//    {
//        return $this->hasMany(Session::class);
//    }
//
//    /**
//     * Get all exercise logs for this user.
//     */
//    public function logs()
//    {
//        return $this->hasMany(UserExerciseLog::class);
//    }
//
//    /**
//     * Get all favorites for this user.
//     */
//    public function favorites()
//    {
//        return $this->hasMany(Favorite::class);
//    }
//
//    /**
//     * Get all exercises marked as favorite by this user.
//     * Many-to-many relation via favorites table.
//     */
//    public function favoriteExercises()
//    {
//        return $this->belongsToMany(Exercise::class, 'favorites');
//    }
//
//    /**
//     * Get the research group this user belongs to (nullable).
//     */
//    public function researchGroup()
//    {
//        return $this->belongsTo(ResearchGroup::class, 'research_group_id');
//    }
//}
