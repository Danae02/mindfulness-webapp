<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GenerateSessionLogsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // Haal alle gebruikers met role_id = 2 op
        $users = DB::table('users')->where('role_id', 2)->get();

        foreach ($users as $user) {
            for ($i = 0; $i < 25; $i++) {
                DB::table('session_logs')->insert([
                    'user_id' => $user->id,
                    'date_time' => Carbon::now()->subDays(rand(1, 365))->toDateTimeString(),
                    'total_duration' => rand(15, 120), // Random duur tussen 15 en 120 minuten
                    'feeling_before' => rand(1, 5),    // Random score tussen 1 en 5
                    'feeling_after' => rand(1, 5),     // Random score tussen 1 en 5
                ]);
            }
        }
    }
}
