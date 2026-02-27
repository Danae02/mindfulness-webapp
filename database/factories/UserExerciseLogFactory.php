<?php

namespace Database\Factories;

use App\Models\UserExerciseLog;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Exercise;

class UserExerciseLogFactory extends Factory
{
    protected $model = UserExerciseLog::class;

    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'exercise_id' => Exercise::inRandomOrder()->first()->id,
            'date_time' => now(),
            'duration_listened' => $this->faker->numberBetween(300, 1200),
            'completed' => $this->faker->boolean(),
            'feeling_before' => $this->faker->numberBetween(1, 5),
            'feeling_after' => $this->faker->numberBetween(1, 5),
        ];
    }
}

