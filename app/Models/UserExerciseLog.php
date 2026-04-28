<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserExerciseLog extends Model
{
    use HasFactory;

    protected $primaryKey = 'log_id';

    protected $fillable = [
        'user_id',
        'exercise_id',
        'date_time',
        'duration_listened',
        'completed',
        'feeling_before',
        'feeling_after',
        'feeling_scale',
        'feeling_before_pct',
        'feeling_after_pct',
        'session_duration',
    ];

    protected $casts = [
        'date_time'     => 'datetime',
        'completed'     => 'boolean',
        'feeling_scale' => 'integer',
        'feeling_before_pct' => 'integer',
        'feeling_after_pct' => 'integer',
        'session_duration' => 'integer',
    ];

    // Relaties
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function exercise()
    {
        return $this->belongsTo(Exercise::class, 'exercise_id');
    }

    // Accessors voor genormaliseerde waarden (berekend, niet uit database)
    public function getNormalizedFeelingBeforeAttribute(): ?float
    {
        if ($this->feeling_before === null || $this->feeling_scale <= 1) {
            return null;
        }
        return round(($this->feeling_before - 1) / ($this->feeling_scale - 1) * 100, 1);
    }

    public function getNormalizedFeelingAfterAttribute(): ?float
    {
        if ($this->feeling_after === null || $this->feeling_scale <= 1) {
            return null;
        }
        return round(($this->feeling_after - 1) / ($this->feeling_scale - 1) * 100, 1);
    }

    public function getNormalizedDifferenceAttribute(): ?float
    {
        $before = $this->normalized_feeling_before;
        $after  = $this->normalized_feeling_after;

        if ($before === null || $after === null) {
            return null;
        }

        return round($after - $before, 1);
    }
}
