<?php

use App\Http\Controllers\AudioController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResearchGroupController;
use App\Http\Controllers\ResearchSettingsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserExerciseLogController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FavoriteController;
use Inertia\Inertia;

// Landing page route
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    $canResetPassword = Route::has('password.request');
    return Inertia::render('Auth/Login', [
        'canResetPassword' => $canResetPassword,
        'status' => session('status'),
    ]);
})->name('home');

// Dashboard route
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Test page
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

    Route::post('registerbysupervisor', [RegisteredUserController::class, 'RegisterBySupervisor'])
        ->name('registerbysupervisor');

    // User management routes
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::put('/{id}', [UserController::class, 'update'])->name('update');
        Route::get('/my-team', [UserController::class, 'getTeamUsers'])->name('get.team');
        Route::get('/my-team-logs', [UserController::class, 'getTeamUserLogs'])->name('get.team.logs');
    });


    // Exercise logs routes
//    Route::prefix('logs')->name('exercise-logs.')->group(function () {
//        Route::get('/', [UserExerciseLogController::class, 'index'])->name('index');
//        Route::get('/statistics', [UserExerciseLogController::class, 'statistics'])->name('statistics');
//        Route::post('/user-exercise-logs/{logId}/track-session', [UserExerciseLogController::class, 'trackSession'])
//            ->name('user_exercise_logs.track_session');
//        Route::get('/getdurationsessions', [UserExerciseLogController::class, 'getDurationSessions'])
//            ->name('get.duration_sessions');
//    });

    // Exercise logs routes
    Route::prefix('logs')->name('exercise-logs.')->group(function () {
        Route::get('/', [UserExerciseLogController::class, 'index'])->name('index');
        Route::get('/export', [UserExerciseLogController::class, 'export'])->name('export');
        Route::get('/statistics', [UserExerciseLogController::class, 'statistics'])->name('statistics');
        Route::post('/user-exercise-logs/{logId}/track-session', [UserExerciseLogController::class, 'trackSession'])
            ->name('user_exercise_logs.track_session');
        Route::get('/getdurationsessions', [UserExerciseLogController::class, 'getDurationSessions'])
            ->name('get.duration_sessions');
    });

    // Course routes
    Route::prefix('courses')->name('courses.')->group(function () {
        Route::post('/', [CourseController::class, 'createCourse'])->name('create');
        Route::get('/', [CourseController::class, 'getAllCourses'])->name('get.all');
        Route::put('/{id}', [CourseController::class, 'updateCourse'])->name('update');
        Route::delete('/{id}/delete', [CourseController::class, 'deleteCourse'])->name('delete');
        Route::get('/{id}', [CourseController::class, 'getCourseDetails'])->name('details');
        Route::get('/{id}/exercises', [ExerciseController::class, 'getExercises'])->name('exercises');
        Route::get('/{id}/availability', [CourseController::class, 'getCourseAvailability'])->name('availability'); // ← NIEUW
    });

    // Favorieten routes
    Route::middleware(['auth'])->group(function () {
        Route::get('/favorites', [FavoriteController::class, 'index'])->name('favorites.index');
        Route::post('/favorites/toggle', [FavoriteController::class, 'toggle'])->name('favorites.toggle');
        Route::get('/favorieten', function () {
            return Inertia::render('Favorites');
        })->name('favorites');
    });

    // Exercise routes
    Route::prefix('exercises')->name('exercises.')->group(function () {
        Route::post('/', [AudioController::class, 'uploadAudio'])->name('create');
        Route::get('/', [ExerciseController::class, 'getAllExercises'])->name('index');
        Route::get('/{id}', [ExerciseController::class, 'showExercise'])->name('show');
        Route::put('/{id}', [ExerciseController::class, 'updateExercise'])->name('update');
        Route::post('/submitCompletedAnswer', [ExerciseController::class, 'submitCompletedLog'])->name('submit');
    });

    // Research settings
    Route::prefix('researchsettings')->name('researchsettings.')->group(function () {
        Route::get('/', [ResearchSettingsController::class, 'getAllSettings'])->name('getallsettings');
        Route::get('/get-mode', [ResearchSettingsController::class, 'getModeSetting'])->name('getmode');
        Route::post('/', [ResearchSettingsController::class, 'updateSettings'])->name('update');
    });

    // Research groups
    Route::prefix('researchgroups')->name('researchgroups.')->group(function () {
        Route::get('/', [ResearchGroupController::class, 'index'])->name('index');
        Route::post('/', [ResearchGroupController::class, 'store'])->name('store');
        Route::put('/{id}', [ResearchGroupController::class, 'update'])->name('update');
        Route::delete('/{id}', [ResearchGroupController::class, 'destroy'])->name('destroy');
        Route::post('/{groupId}/users', [ResearchGroupController::class, 'addUser'])->name('addUser');
        Route::delete('/{groupId}/users/{userId}', [ResearchGroupController::class, 'removeUser'])->name('removeUser');
        //Route::get('/active-question', [ResearchGroupController::class, 'getActiveQuestion'])->name('activeQuestion');
    });

    // Backup routes alleen voor admins
    Route::middleware(['auth', 'admin'])->group(function () {
        Route::get('/admin/backup/download', [BackupController::class, 'downloadBackup'])
            ->name('admin.backup.download');

        Route::post('/admin/backup/restore', [BackupController::class, 'restoreBackup'])
            ->name('admin.backup.restore');
    });

    // Standaardvragen
    Route::prefix('research')->name('research.')->group(function () {
        Route::get('/questions/default', [ResearchGroupController::class, 'getDefaultQuestion'])->name('questions.default');
        Route::post('/questions/default', [ResearchGroupController::class, 'saveDefaultQuestion'])->name('questions.default.save');
    });
});

// Public audio file route
Route::get('/storage/audio/{filename}', [AudioController::class, 'getAudio'])
    ->name('audio.get');

// Authentication routes
require __DIR__ . '/auth.php';
