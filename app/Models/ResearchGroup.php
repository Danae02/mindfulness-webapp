<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResearchGroup extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'question', 'answers'];

    protected $casts = [
        'answers' => 'array',
    ];

    /**
     * Gebruikers die aan deze groep zijn gekoppeld
     */
    public function users()
    {
        return $this->hasMany(User::class, 'research_group_id');
    }
}
