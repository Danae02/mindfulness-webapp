<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Services\EmailEncryptionService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    //Seed roles and admin accounts from .env. firstOrCreate so existing data is never overwritten or deleted
    public function run(): void
    {
        $roleNames = ['admin', 'viewer', 'supervisor', 'researcher'];

        foreach ($roleNames as $roleName) {
            Role::firstOrCreate(['role_name' => $roleName]);
        }

        $adminRoleId = Role::where('role_name', 'admin')->first()->id;

        // Admins uit .env (ADMIN_1_EMAIL, ADMIN_1_PASSWORD, etc.)
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
                $emailIndex = app(EmailEncryptionService::class)->blindIndex($email);

                $user = User::where('email_index', $emailIndex)->first();

                if (!$user) {
                    User::create([
                        'name'     => $name,
                        'email'    => $email,
                        'password' => Hash::make($password),
                        'role_id'  => $adminRoleId,
                    ]);

                    echo "✓ Admin aangemaakt: {$name} ({$email})\n";
                } else {
                    echo " x Admin bestaat al: {$name} ({$email})\n";
                }
            } else {
                echo "! Overgeslagen: {$name} — {$emailKey} of {$passwordKey} ontbreekt in .env\n";
            }

            $index++;
        }
    }
}
