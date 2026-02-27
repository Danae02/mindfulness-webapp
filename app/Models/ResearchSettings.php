<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResearchSettings extends Model
{
    use HasFactory;

    // Velden die je wilt toestaan via mass-assignment
    protected $fillable = ['key_name', 'value', 'question', 'answers'];

    // Casts zorgen ervoor dat bepaalde velden automatisch worden geconverteerd
    protected $casts = [
        'answers' => 'array', // Cast 'answers' naar een array wanneer het uit de database wordt gehaald
        'value' => 'string',   // Zet 'value' als string als dat nodig is (bijvoorbeeld voor 'mode' en andere waarden)
        'question' => 'string' // Zorg ervoor dat 'question' als een string wordt behandeld
    ];

}
