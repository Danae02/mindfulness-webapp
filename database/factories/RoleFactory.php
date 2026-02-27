<?php

namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoleFactory extends Factory
{
    protected $model = Role::class;

    public function definition()
    {
        return [
            'description' => $this->faker->sentence(),
            'permissions' => json_encode(['view_exercises', 'manage_users']),
        ];
    }

    public function predefinedRoles()
    {
        return [
            ['role_name' => 'admin', 'description' => 'Administrator role', 'permissions' => json_encode(['*'])],
            ['role_name' => 'viewer', 'description' => 'View-only user role', 'permissions' => json_encode(['view_exercises'])],
            ['role_name' => 'supervisor', 'description' => 'Supervisor role', 'permissions' => json_encode(['view_exercises', 'manage_users'])],
            ['role_name' => 'researcher', 'description' => 'Researcher role', 'permissions' => json_encode(['view_exercises', 'export_data'])],
        ];
    }
}
