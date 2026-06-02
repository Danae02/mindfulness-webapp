<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\Exercise;
use App\Models\UserExerciseLog;
use App\Models\Favorite;
use App\Services\EmailEncryptionService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        try {
            // Altijd veilig: rollen en admins
            $this->call(AdminSeeder::class);

            // Alleen lokaal of bij tests: testdata aanmaken
            if (app()->environment('local', 'testing')) {
                $this->seedLocalData();
            }
            echo "Seeding voltooid!\n";

        } catch (\Throwable $e) {
            dd('Seeding fout: ' . $e->getMessage());
        }
    }

    //Lokale testdata wordt nooit op productie uitgevoerd
    private function seedLocalData(): void
    {
        // Wis bestaande testdata
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('user_exercise_logs')->truncate();
        DB::table('favorites')->truncate();
        DB::table('exercises')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // seed oefeningen
        $exercises = Exercise::factory(5)->create();

        if ($exercises->isEmpty()) {
            throw new \Exception('Geen oefeningen aangemaakt. Controleer ExerciseFactory.');
        }

        // Seed Users
        $viewerRoleId     = Role::where('role_name', 'viewer')->first()->id;
        $researcherRoleId = Role::where('role_name', 'researcher')->first()->id;

        // Testgebruikers voor accessibility pipeline
        if (app()->environment('local', 'testing')) {
            $this->seedTestUsers();
        }

        // Researcher
        User::factory()->create([
            'role_id' => $researcherRoleId,
            'email'   => 'researcher@example.com',
            'name'    => 'Researcher User',
        ]);

        // Viewers met logs
        User::factory(9)->create()->each(function ($viewer) use ($viewerRoleId, $exercises) {
            $viewer->update([
                'role_id' => $viewerRoleId,
            ]);

            $logCount = rand(10, 25);
            for ($i = 0; $i < $logCount; $i++) {
                UserExerciseLog::factory()->create([
                    'user_id'     => $viewer->id,
                    'exercise_id' => $exercises->random()->id,
                ]);
            }
        });

        echo "Lokale testdata aangemaakt.\n";
        echo "Favorieten: " . Favorite::count() . "\n";
    }

//Testaccounts voor accessibility tests uit .env.
    private function seedTestUsers(): void
    {
        $testAccounts = [
            [
                'env_email'    => 'TEST_ADMIN_EMAIL',
                'env_password' => 'TEST_ADMIN_PASSWORD',
                'name'         => 'Test Admin',
                'role_name'    => 'admin',
            ],
            [
                'env_email'    => 'TEST_CLIENT_EMAIL',
                'env_password' => 'TEST_CLIENT_PASSWORD',
                'name'         => 'Test Client',
                'role_name'    => 'viewer',
            ],
            [
                'env_email'    => 'TEST_SUPERVISOR_EMAIL',
                'env_password' => 'TEST_SUPERVISOR_PASSWORD',
                'name'         => 'Test Begeleider',
                'role_name'    => 'supervisor',
            ],
            [
                'env_email'    => 'TEST_RESEARCHER_EMAIL',
                'env_password' => 'TEST_RESEARCHER_PASSWORD',
                'name'         => 'Test Onderzoeker',
                'role_name'    => 'researcher',
            ],
        ];

        foreach ($testAccounts as $account) {
            $email    = env($account['env_email']);
            $password = env($account['env_password']);

            if (!$email || !$password) {
                echo "! Testgebruiker overgeslagen: {$account['env_email']} of {$account['env_password']} niet ingesteld in .env\n";
                continue;
            }

            $role = Role::where('role_name', $account['role_name'])->first();

            if (!$role) {
                echo "! Rol niet gevonden: {$account['role_name']}\n";
                continue;
            }

            $emailIndex = app(EmailEncryptionService::class)->blindIndex($email);

            if (!User::where('email_index', $emailIndex)->exists()) {
                User::create([
                    'name'     => $account['name'],
                    'email'    => $email,
                    'password' => Hash::make($password),
                    'role_id'  => $role->id,
                ]);
                echo "Testgebruiker aangemaakt: {$account['name']} ({$email})\n";
            } else {
                echo "Testgebruiker bestaat al: {$email}\n";
            }
        }
    }
}
