<?php

use App\Http\Controllers\AudioController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResearchSettingsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserExerciseLogController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Landing page route
Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : Inertia::render('Auth/Login');
})->name('home');

// Dashboard route
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Test page (Example route)
Route::get('/test', fn() => Inertia::render('Test'))->name('test');

// Public Exercise route
Route::get('/exercise/{id}', [AudioController::class, 'showExercise'])
    ->name('exercise.show');

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {

    // Profile routes
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });

    Route::post('registerbysupervisor', [RegisteredUserController::class, 'RegisterBySupervisor'])->name('registerbysupervisor');


    // User management routes
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::put('/{id}', [UserController::class, 'update'])->name('update');
        Route::get('/my-team', [UserController::class, 'getTeamUsers'])->name('get.team');
        Route::get('/my-team-logs', [UserController::class, 'getTeamUserLogs'])->name('get.team.logs');

    });

    // Exercise logs routes
    Route::prefix('logs')->name('exercise-logs.')->group(function () {
        Route::get('/', [UserExerciseLogController::class, 'index'])->name('index');
        Route::get('/statistics', [UserExerciseLogController::class, 'statistics'])->name('statistics');
        Route::post('/user-exercise-logs/{logId}/track-session', [UserExerciseLogController::class, 'trackSession'])
            ->name('user_exercise_logs.track_session');
        Route::get('/getdurationsessions', [UserExerciseLogController::class, 'getDurationSessions'])->name('get.duration_sessions');
    });

    // Course routes
    Route::prefix('courses')->name('courses.')->group(function () {
        Route::post('/', [CourseController::class, 'createCourse'])->name('create');
        Route::get('/', [CourseController::class, 'getAllCourses'])->name('get.all');
        Route::put('/{id}', [CourseController::class, 'updateCourse'])->name('update');
        Route::delete('/{id}/delete', [CourseController::class, 'deleteCourse'])->name('delete');
        Route::get('/{id}', [CourseController::class, 'getCourseDetails'])->name('details');
        Route::get('/{id}/exercises', [ExerciseController::class, 'getExercises'])->name('exercises');
    });

    // Exercise routes
    Route::prefix('exercises')->name('exercises.')->group(function () {
        Route::post('/', [AudioController::class, 'uploadAudio'])->name('create');
        Route::get('/', [ExerciseController::class, 'getAllExercises'])->name('index');
        Route::get('/{id}', [ExerciseController::class, 'showExercise'])->name('show');
        Route::put('/{id}', [ExerciseController::class, 'updateExercise'])->name('update');
        Route::post('/submitCompletedAnswer', [ExerciseController::class, 'submitCompletedLog'])->name('submit');
    });


    Route::prefix('researchsettings')->name('researchsettings.')->group(function () {
        Route::get('/', [ResearchSettingsController::class, 'getAllSettings'])->name('getallsettings');
        Route::get('/get-mode', [ResearchSettingsController::class, 'getModeSetting'])->name('getmode');
        Route::post('/', [ResearchSettingsController::class, 'updateSettings'])->name('update');
    });
});

// Public audio file route
Route::get('/storage/audio/{filename}', [AudioController::class, 'getAudio'])
    ->name('audio.get');

// Authentication routes
require __DIR__ . '/auth.php';
