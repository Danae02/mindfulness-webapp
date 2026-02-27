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
        'chapter_id', // Nieuwe veld
        'course_id',
        'form_question',
        'form_answers'
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
}
