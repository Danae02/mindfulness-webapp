<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'exercise_name',
        'category',
        'keywords',
        'difficulty_level',
        'duration',
        'audio_file_path',
        'created_by',
        'times_done',
        'last_time',
        'chapter_id',
        'course_id',
        'form_question',
        'form_answers',
        'duration_seconds',
    ];

    protected $casts = [
        'keywords' => 'array',
        'last_time' => 'datetime',
        'form_answers' => 'array',
    ];

    public function chapter()
    {
        return $this->belongsTo(Chapter::clasUs);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Gebruikers die deze oefening als favoriet hebben
    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites');
    }

    /**
     * Geeft de totale duur in minuten terug (afgerond naar boven).
     * Bevat audio + 60 seconden voor de gevoelsvragen.
     * Geeft null terug als de duur onbekend is.
     */
    public function getDurationMinutesAttribute(): ?int
    {
        if ($this->duration_seconds === null) {
            return null;
        }

        return (int) ceil($this->duration_seconds / 60);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function userExerciseLogs()
    {
        return $this->hasMany(UserExerciseLog::class);
    }

}
