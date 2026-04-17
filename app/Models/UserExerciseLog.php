<?php

// UserExerciseLog Model
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
        'feeling_scale', // Aantal antwoordopties (3, 4, of 5) — voor normalisatie
    ];

    protected $casts = [
        'date_time'     => 'datetime',
        'completed'     => 'boolean',
        'feeling_scale' => 'integer', // nog mee bezig
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function exercise()
    {
        return $this->belongsTo(Exercise::class, 'exercise_id');
    }

    /**
     * nog mee bezig
     *
     * Normaliseer een feeling-waarde naar een percentage (0–100).
     * Hiermee zijn waarden van 3-schaal en 5-schaal vergelijkbaar.
     *
     * Formule: (waarde - 1) / (schaal - 1) * 100
     * Voorbeeld: waarde 3 op 5-schaal → (3-1)/(5-1)*100 = 50%
     * Voorbeeld: waarde 2 op 3-schaal → (2-1)/(3-1)*100 = 50%
     */
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
