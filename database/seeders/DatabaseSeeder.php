<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\Exercise;
use App\Models\UserExerciseLog;
use App\Models\Favorite;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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

            // Default Admins from .env
            $this->seedDefaultAdmins($adminRoleId);

            // Seed Demo Users (only if not production)
            if (app()->environment('local')) {
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
            }

            echo "Seeding completed successfully!\n";
            echo "Created: " . Role::count() . " roles\n";
            echo "Created: " . Exercise::count() . " exercises\n";
            echo "Created: " . User::count() . " users\n";
            echo "Created: " . Favorite::count() . " favorites\n";

        } catch (\Throwable $e) {
            dd('Seeding Error: ' . $e->getMessage());
        }
    }

    /**
     * Seed default admin accounts from .env
     */
    private function seedDefaultAdmins($adminRoleId): void
    {
        $index = 1;

        while (true) {
            $emailKey    = "ADMIN_{$index}_EMAIL";
            $passwordKey = "ADMIN_{$index}_PASSWORD";
            $nameKey     = "ADMIN_{$index}_NAME";

            $email    = env($emailKey);
            $password = env($passwordKey);

            if (!$email && !$password) {
                break;
            }

            $name = env($nameKey, "Admin {$index}");

            if ($email && $password) {
                if (!User::where('email', $email)->exists()) {
                    User::create([
                        'name'     => $name,
                        'email'    => $email,
                        'password' => Hash::make($password),
                        'role_id'  => $adminRoleId,
                    ]);

                    echo "✓ Admin created: {$name} ({$email})\n";
                } else {
                    echo "x Admin already exists: {$name} ({$email})\n";
                }
            } else {
                echo "! Skipped: {$name} - missing {$emailKey} or {$passwordKey}\n";
            }

            $index++;
        }
    }
}
