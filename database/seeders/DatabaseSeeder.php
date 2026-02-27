<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Team;
use App\Models\User;
use App\Models\Exercise;
use App\Models\UserExerciseLog;
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
            DB::table('exercises')->truncate();
            DB::table('users')->truncate();
            DB::table('teams')->truncate();
            DB::table('roles')->truncate();
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            // Seed Roles
            $roles = Role::factory()->predefinedRoles();

            foreach ($roles as $role) {
                Role::create($role);
            }

            // Seed Teams
            $teams = [
                ['name' => 'Team Alpha'],
                ['name' => 'Team Beta'],
            ];
            foreach ($teams as $team) {
                Team::create($team);
            }

            // Debug $teams
            if (Team::count() === 0) {
                throw new \Exception('No teams found. Ensure teams are seeded properly.');
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
            $admin = User::factory()->create([
                'role_id' => $adminRoleId,
                'team_id' => Team::inRandomOrder()->first()->id,
                'email' => 'admin@example.com',
                'name' => 'Admin User',
            ]);

            $researcher = User::factory()->create([
                'role_id' => $researcherRoleId,
                'team_id' => Team::inRandomOrder()->first()->id,
                'email' => 'researcher@example.com',
                'name' => 'Researcher User',
            ]);

            if (!$admin) {
                throw new \Exception('Admin user could not be created.');
            }

            if (!$researcher) {
                throw new \Exception('Admin user could not be created.');
            }

            // Create viewers
            $viewers = User::factory(9)->create()->each(function ($viewer) use ($viewerRoleId, $exercises) {
                $viewer->update([
                    'role_id' => $viewerRoleId,
                    'team_id' => Team::inRandomOrder()->first()->id,
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

            if ($viewers->isEmpty()) {
                throw new \Exception('No viewer users were created.');
            }
        } catch (\Throwable $e) {
            dd('Seeding Error: ' . $e->getMessage());
        }
    }
}
