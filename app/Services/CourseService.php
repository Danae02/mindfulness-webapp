<?php
//
//namespace App\Services;
//
//use App\Models\Course;
//use App\Models\UserExerciseLog;
//
//class CourseService
//{
//    public function __construct(
//        private ExerciseAvailabilityService $availabilityService
//    ) {}
//
//
//    // Hardcoded intro-oefening die altijd bovenaan staat.
//    public function getIntroExercise(): array
//    {
//        return [
//            'id'              => 'intro',
//            'exercise_name'   => 'Introductie mindfulness app',
//            'audio_file_path' => '/audio/1.mindfulness_app_inleiding.m4a',
//            'duration'        => null,
//            'form_question'   => null,
//            'form_answers'    => null,
//            'available'       => true,
//            'available_label' => null,
//        ];
//    }
//
//    // Hardcoded intro-deel die boven alle echte cursussen staat.
//    public function getIntroCourse(): array
//    {
//        return [
//            'id'          => 'intro',
//            'is_intro'    => true,
//            'course_name' => 'Welkom',
//            'description' => 'Beluister de introductie voordat je aan de cursussen begint.',
//            'available'   => true,
//            'exercises'   => [$this->getIntroExercise()],
//        ];
//    }
//
//
//    public function buildCourseAvailabilityMap(int $userId): array
//    {
//        return $this->availabilityService->buildCourseAvailabilityMap($userId);
//    }
//
//
//    public function buildExerciseAvailability(Course $course, int $userId): array
//    {
//        return $this->availabilityService->buildExerciseAvailability($course, $userId);
//    }
//
//    // -------------------------------------------------------------------------
//    // Voortgang per gebruiker
//    // -------------------------------------------------------------------------
//
//    public function getClientProgress(int $userId): array
//    {
//        $courses         = Course::with('exercises')->orderBy('id')->get();
//        $availabilityMap = $this->availabilityService->buildCourseAvailabilityMap($userId);
//
//        $completedLogs = UserExerciseLog::where('user_id', $userId)
//            ->where('completed', true)
//            ->selectRaw('exercise_id, MAX(date_time) as last_completed_at')
//            ->groupBy('exercise_id')
//            ->get()
//            ->keyBy('exercise_id');
//
//        return $courses->map(function ($course) use ($availabilityMap, $completedLogs) {
//            $available = $availabilityMap[$course->id] ?? false;
//            $total     = $course->exercises->count();
//            $done      = 0;
//
//            $exercises = $course->exercises->map(function ($ex) use ($completedLogs, &$done) {
//                $log       = $completedLogs->get($ex->id);
//                $completed = $log !== null;
//                if ($completed) $done++;
//
//                return [
//                    'exercise_id'       => $ex->id,
//                    'exercise_name'     => $ex->exercise_name,
//                    'completed'         => $completed,
//                    'last_completed_at' => $completed ? $log->last_completed_at : null,
//                ];
//            });
//
//            return [
//                'course_id'   => $course->id,
//                'course_name' => $course->course_name,
//                'available'   => $available,
//                'progress'    => $total > 0 ? round($done / $total * 100) : 0,
//                'done'        => $done,
//                'total'       => $total,
//                'exercises'   => $exercises,
//            ];
//        })->values()->all();
//    }
//}
