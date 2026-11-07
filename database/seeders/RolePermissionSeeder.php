<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = collect([
            'manage users',
            'manage settings',
            'manage news',
            'manage officials',
            'manage transparency',
            'manage tourism',
            'manage jobs',
            'manage services',
            'manage hero',
            'manage stats',
            'manage emergency',
            'manage achievements',
            'access internal chat',
        ])->map(function ($name) {
            /** @var Permission $permission */
            $permission = Permission::findOrCreate($name, 'web');

            return $permission;
        });

        $rolePermissions = [
            'super_admin' => $permissions,
            'admin' => $permissions,
            'editor' => $permissions->filter(
                fn (Permission $permission): bool => in_array($permission->name, ['manage news', 'manage achievements'], true),
            ),
            'department' => $permissions->filter(
                fn (Permission $permission): bool => in_array($permission->name, ['manage news', 'manage transparency', 'access internal chat'], true),
            ),
            'hr' => $permissions->filter(
                fn (Permission $permission): bool => in_array($permission->name, ['manage jobs', 'access internal chat'], true),
            ),
            'legislative' => $permissions->filter(
                fn (Permission $permission): bool => in_array($permission->name, ['manage transparency', 'manage jobs', 'access internal chat'], true),
            ),
            'mmo_info' => $permissions->filter(
                fn (Permission $permission): bool => in_array($permission->name, ['manage news', 'manage achievements', 'access internal chat'], true),
            ),
            'mpdo' => $permissions->filter(
                fn (Permission $permission): bool => in_array($permission->name, ['manage news', 'manage transparency', 'access internal chat'], true),
            ),
            'tourism' => $permissions->filter(
                fn (Permission $permission): bool => in_array($permission->name, ['manage tourism', 'manage news', 'manage achievements', 'access internal chat'], true),
            ),
            'menro' => $permissions->filter(
                fn (Permission $permission): bool => in_array($permission->name, ['manage news', 'manage achievements', 'manage transparency', 'access internal chat'], true),
            ),
        ];

        foreach ($rolePermissions as $roleName => $rolePermissionSet) {
            Role::findOrCreate($roleName, 'web')
                ->syncPermissions($rolePermissionSet);
        }

        $testUsers = [
            'dept@kiblawan.gov.ph' => [
                'name' => 'Department Staff',
                'role' => 'department',
            ],
            'hr@kiblawan.gov.ph' => [
                'name' => 'HR Staff',
                'role' => 'hr',
            ],
            'sb@kiblawan.gov.ph' => [
                'name' => 'Sangguniang Bayan Staff',
                'role' => 'legislative',
            ],
            'mmo@kiblawan.gov.ph' => [
                'name' => "Mayor's Office & Info Staff",
                'role' => 'mmo_info',
            ],
            'mpdo@kiblawan.gov.ph' => [
                'name' => 'Planning & Development Staff',
                'role' => 'mpdo',
            ],
            'tourism@kiblawan.gov.ph' => [
                'name' => 'Tourism Office Staff',
                'role' => 'tourism',
            ],
            'menro@kiblawan.gov.ph' => [
                'name' => 'Environment & Natural Resources Staff',
                'role' => 'menro',
            ],
        ];

        foreach ($testUsers as $email => $attributes) {
            $user = User::query()->updateOrCreate(
                ['email' => $email],
                [
                    'name' => $attributes['name'],
                    'password' => 'password',
                    'email_verified_at' => now(),
                ],
            );

            $user->syncRoles([$attributes['role']]);
        }
    }
}
