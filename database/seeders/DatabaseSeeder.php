<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\Exercise;
use App\Models\UserExerciseLog;
use App\Models\Favorite;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database
     */
    public function run(): void
    {
        try {
            // Reset database
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            DB::table('user_exercise_logs')->truncate();
            DB::table('favorites')->truncate();
            DB::table('exercises')->truncate();
            DB::table('users')->truncate();
            DB::table('roles')->truncate();
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            // Seed Roles
            $roles = Role::factory()->predefinedRoles();

            foreach ($roles as $role) {
                Role::create($role);
            }

            // Seed Exercises
            $exercises = Exercise::factory(5)->create();

            if ($exercises->isEmpty()) {
                throw new \Exception('No exercises were created. Check your ExerciseFactory.');
            }

            // Seed Users
            $adminRoleId = Role::where('role_name', 'admin')->first()->id;
            $viewerRoleId = Role::where('role_name', 'viewer')->first()->id;
            $researcherRoleId = Role::where('role_name', 'researcher')->first()->id;

            if (!$adminRoleId || !$viewerRoleId) {
                throw new \Exception('Roles not found. Ensure roles are seeded correctly.');
            }

            // Create admin
            User::factory()->create([
                'role_id' => $adminRoleId,
                'email' => 'admin@example.com',
                'name' => 'Admin User',
            ]);

            // Create researcher
            User::factory()->create([
                'role_id' => $researcherRoleId,
                'email' => 'researcher@example.com',
                'name' => 'Researcher User',
            ]);

            // Create viewers
            User::factory(9)->create()->each(function ($viewer) use ($viewerRoleId, $exercises) {
                $viewer->update([
                    'role_id' => $viewerRoleId,
                ]);

                // Create logs for each viewer
                $logCount = rand(10, 25);
                for ($i = 0; $i < $logCount; $i++) {
                    UserExerciseLog::factory()->create([
                        'user_id' => $viewer->id,
                        'exercise_id' => $exercises->random()->id,
                    ]);
                }
            });

            echo "Seeding completed successfully!\n";
            echo "Created: " . Role::count() . " roles\n";
            echo "Created: " . Exercise::count() . " exercises\n";
            echo "Created: " . User::count() . " users\n";
            echo "Created: " . Favorite::count() . " favorites\n";

        } catch (\Throwable $e) {
            dd('Seeding Error: ' . $e->getMessage());
        }
    }
}
