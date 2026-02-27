<?php

namespace Database\Factories;

use App\Models\Exercise;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExerciseFactory extends Factory
{
    protected $model = Exercise::class;

    public function definition()
    {
        return [
            'exercise_name' => $this->faker->word() . ' Exercise',
//            'category' => $this->faker->randomElement(['relaxation', 'mindfulness']),
            'keywords' => json_encode($this->faker->words(3)),
//            'difficulty_level' => $this->faker->randomElement(['beginner', 'advanced']),
//            'duration' => $this->faker->numberBetween(5, 30),
            'audio_file_path' => 'audio/' . $this->faker->word() . '.mp3',
//            'created_by' => User::factory(),
            'times_done' => $this->faker->numberBetween(0, 50),
//            'last_time' => now(),
        ];
    }
}
