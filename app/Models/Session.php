<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    use HasFactory;

    // De tabelnaam (optioneel, als je conventies volgt, kan Laravel dit raden)
    protected $table = 'session_logs';

    // Velden die massaal ingevuld mogen worden
    protected $fillable = [
        'user_id',
        'date_time',
        'total_duration',
        'feeling_before',
        'feeling_after',
    ];
    // Relatie: een sessie hoort bij een gebruiker
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relatie: een sessie kan meerdere oefeningen hebben
//    public function exercises()
//    {
//        return $this->hasMany(SessionExerciseLog::class, 'session_id', 'session_id');
//    }
}
