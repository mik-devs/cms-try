<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

it('seeds the configured roles, permissions, and department test users', function () {
    $this->seed(RolePermissionSeeder::class);

    $allPermissions = [
        'access internal chat',
        'manage achievements',

        'manage emergency',
        'manage hero',
        'manage jobs',
        'manage news',
        'manage officials',

        'manage services',
        'manage settings',
        'manage stats',
        'manage tourism',
        'manage transparency',
        'manage users',
    ];

    $this->assertDatabaseCount('permissions', 13);
    $this->assertDatabaseCount('roles', 10);

    expect(Role::findByName('super_admin', 'web')->permissions->pluck('name')->sort()->values()->all())
        ->toBe($allPermissions);
    expect(Role::findByName('admin', 'web')->permissions->pluck('name')->sort()->values()->all())
        ->toBe($allPermissions);
    expect(Role::findByName('editor', 'web')->permissions->pluck('name')->sort()->values()->all())
        ->toBe(['manage achievements', 'manage news']);
    expect(Role::findByName('department', 'web')->permissions->pluck('name')->sort()->values()->all())
        ->toBe(['access internal chat', 'manage news', 'manage transparency']);
    expect(Role::findByName('hr', 'web')->permissions->pluck('name')->sort()->values()->all())
        ->toBe(['access internal chat', 'manage jobs']);
    expect(Role::findByName('legislative', 'web')->permissions->pluck('name')->sort()->values()->all())
        ->toBe(['access internal chat', 'manage jobs', 'manage transparency']);

    $dept = User::query()->where('email', 'dept@kiblawan.gov.ph')->firstOrFail();
    $hr = User::query()->where('email', 'hr@kiblawan.gov.ph')->firstOrFail();
    $sb = User::query()->where('email', 'sb@kiblawan.gov.ph')->firstOrFail();

    expect($dept->hasRole('department'))->toBeTrue();
    expect($hr->hasRole('hr'))->toBeTrue();
    expect($sb->hasRole('legislative'))->toBeTrue();

    expect($dept->email_verified_at)->not->toBeNull();
    expect(Hash::check('password', $dept->password))->toBeTrue();
});

it('shares authorization data and enforces editor permissions on admin routes', function () {
    $this->seed(RolePermissionSeeder::class);

    $editor = User::factory()->create();
    $editor->assignRole('editor');

    $this->actingAs($editor)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.roles', ['editor'])
            ->has('auth.user.permissions', 2)
            ->where('auth.user.permissions.0', 'manage achievements')
            ->where('auth.user.permissions.1', 'manage news'));

    $this->get(route('admin.news.index'))->assertOk();
    $this->get(route('admin.achievements.index'))->assertOk();
    $this->get(route('admin.services.index'))->assertForbidden();
    $this->get(route('admin.barangays.index'))->assertForbidden();
});

it('enforces department role permissions on admin routes', function () {
    $this->withoutVite();
    $this->seed(RolePermissionSeeder::class);

    $dept = User::query()->where('email', 'dept@kiblawan.gov.ph')->firstOrFail();

    $this->actingAs($dept);

    $this->get(route('admin.news.index'))->assertOk();
    $this->get(route('admin.bids.index'))->assertOk();
    $this->get(route('admin.annual-reports.index'))->assertOk();
    $this->get(route('admin.chat.index'))->assertOk();
    $this->get(route('admin.jobs.index'))->assertForbidden();
});

it('enforces hr and legislative role permissions on admin routes', function () {
    $this->withoutVite();
    $this->seed(RolePermissionSeeder::class);

    $hr = User::query()->where('email', 'hr@kiblawan.gov.ph')->firstOrFail();

    $this->actingAs($hr);
    $this->get(route('admin.jobs.index'))->assertOk();
    $this->get(route('admin.chat.index'))->assertOk();
    $this->get(route('admin.news.index'))->assertForbidden();
    $this->get(route('admin.bids.index'))->assertForbidden();

    $sb = User::query()->where('email', 'sb@kiblawan.gov.ph')->firstOrFail();

    $this->actingAs($sb);
    $this->get(route('admin.jobs.index'))->assertOk();
    $this->get(route('admin.bids.index'))->assertOk();
    $this->get(route('admin.annual-reports.index'))->assertOk();
    $this->get(route('admin.chat.index'))->assertOk();
    $this->get(route('admin.news.index'))->assertForbidden();
});

it('allows super admin to view and edit role permissions and forbids non-super-admins', function () {
    $this->withoutVite();
    $this->seed(RolePermissionSeeder::class);

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('super_admin');

    $regularUser = User::factory()->create();
    $regularUser->assignRole('editor');

    // Super admin can see roles index (excluding super_admin role)
    $this->actingAs($superAdmin)
        ->get(route('admin.roles.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/roles/index')
            ->has('roles', 9)
            ->where('roles', fn ($roles) => collect($roles)->every(fn ($r) => $r['name'] !== 'super_admin')));

    $editorRole = Role::findByName('editor', 'web');

    // Super admin can view edit page
    $this->actingAs($superAdmin)
        ->get(route('admin.roles.edit', $editorRole))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/roles/edit')
            ->where('role.name', 'editor')
            ->has('allPermissions', 13));

    // Super admin updates permissions
    $this->actingAs($superAdmin)
        ->put(route('admin.roles.update', $editorRole), [
            'permissions' => ['manage news', 'manage achievements', 'manage tourism'],
        ])
        ->assertRedirect(route('admin.roles.index'));

    expect($editorRole->fresh()->permissions->pluck('name')->sort()->values()->all())
        ->toBe(['manage achievements', 'manage news', 'manage tourism']);

    // Non-super admin is forbidden
    $this->actingAs($regularUser)
        ->get(route('admin.roles.index'))
        ->assertForbidden();

    $this->actingAs($regularUser)
        ->get(route('admin.roles.edit', $editorRole))
        ->assertForbidden();

    $this->actingAs($regularUser)
        ->put(route('admin.roles.update', $editorRole), [
            'permissions' => ['manage news'],
        ])
        ->assertForbidden();
});

it('protects super_admin role from being edited or updated even by super admin', function () {
    $this->withoutVite();
    $this->seed(RolePermissionSeeder::class);

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('super_admin');

    $superAdminRole = Role::findByName('super_admin', 'web');

    $this->actingAs($superAdmin)
        ->get(route('admin.roles.edit', $superAdminRole))
        ->assertForbidden();

    $this->actingAs($superAdmin)
        ->put(route('admin.roles.update', $superAdminRole), [
            'permissions' => ['manage news'],
        ])
        ->assertForbidden();
});

it('allows super admin to create a custom role with permissions', function () {
    $this->withoutVite();
    $this->seed(RolePermissionSeeder::class);

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('super_admin');

    $this->actingAs($superAdmin)
        ->get(route('admin.roles.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/roles/create')
            ->has('allPermissions', 13)
            ->has('permissionGroups'));

    $this->actingAs($superAdmin)
        ->post(route('admin.roles.store'), [
            'name' => 'assessor',
            'permissions' => ['manage news', 'manage transparency'],
        ])
        ->assertRedirect(route('admin.roles.index'));

    $role = Role::query()->where('name', 'assessor')->firstOrFail();

    expect($role->guard_name)->toBe('web')
        ->and($role->permissions->pluck('name')->sort()->values()->all())
        ->toBe(['manage news', 'manage transparency']);
});

it('validates the role name when storing a custom role', function () {
    $this->withoutVite();
    $this->seed(RolePermissionSeeder::class);

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('super_admin');

    $this->actingAs($superAdmin)
        ->from(route('admin.roles.create'))
        ->post(route('admin.roles.store'), [
            'name' => 'editor',
        ])
        ->assertRedirect(route('admin.roles.create'))
        ->assertSessionHasErrors(['name']);
});

it('allows super admin to delete a custom role but protects super_admin', function () {
    $this->withoutVite();
    $this->seed(RolePermissionSeeder::class);

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('super_admin');

    $customRole = Role::create(['name' => 'assessor', 'guard_name' => 'web']);

    $this->actingAs($superAdmin)
        ->delete(route('admin.roles.destroy', $customRole))
        ->assertRedirect(route('admin.roles.index'));

    $this->assertDatabaseMissing('roles', ['name' => 'assessor']);

    $superAdminRole = Role::findByName('super_admin', 'web');

    $this->actingAs($superAdmin)
        ->from(route('admin.roles.index'))
        ->delete(route('admin.roles.destroy', $superAdminRole))
        ->assertRedirect(route('admin.roles.index'))
        ->assertSessionHas('error', 'The Super Admin role cannot be deleted.');

    $this->assertDatabaseHas('roles', ['name' => 'super_admin']);
});
