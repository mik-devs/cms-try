<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Display a listing of all roles and their permission counts.
     */
    public function index(): Response
    {
        $roles = Role::query()
            ->where('name', '!=', 'super_admin')
            ->withCount(['users', 'permissions'])
            ->with('permissions:id,name')
            ->orderBy('id')
            ->get();

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
        ]);
    }

    /**
     * Show the form for creating a new role.
     */
    public function create(): Response
    {
        return Inertia::render('admin/roles/create', [
            'allPermissions' => $this->allPermissions(),
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('roles', 'name')],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        $role->syncPermissions($validated['permissions'] ?? []);

        return to_route('admin.roles.index')
            ->with('success', "Role '{$role->name}' created successfully.");
    }

    /**
     * Show the form for editing permissions of the specified role.
     */
    public function edit(Role $role): Response
    {
        if ($role->name === 'super_admin') {
            abort(403, 'The Super Admin role is protected and cannot be edited.');
        }

        $role->loadMissing('permissions:id,name');

        return Inertia::render('admin/roles/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
            ],
            'assignedPermissions' => $role->permissions->pluck('name')->values()->all(),
            'allPermissions' => $this->allPermissions(),
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    /**
     * Update the specified role's permissions.
     */
    public function update(Request $request, Role $role): RedirectResponse
    {
        if ($role->name === 'super_admin') {
            abort(403, 'The Super Admin role is protected and cannot be modified.');
        }

        $validated = $request->validate([
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role->syncPermissions($validated['permissions'] ?? []);

        return to_route('admin.roles.index')
            ->with('success', "Permissions for role '{$role->name}' updated successfully.");
    }

    /**
     * Delete the specified role.
     */
    public function destroy(Role $role): RedirectResponse
    {
        if ($role->name === 'super_admin') {
            return back()->with('error', 'The Super Admin role cannot be deleted.');
        }

        $roleName = $role->name;
        $role->delete();

        return to_route('admin.roles.index')
            ->with('success', "Role '{$roleName}' deleted successfully.");
    }

    /**
     * @return Collection<int, Permission>
     */
    private function allPermissions(): Collection
    {
        return Permission::query()
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /**
     * @return array<string, array<string, string>>
     */
    private function permissionGroups(): array
    {
        return [
            'Content Management' => [
                'manage news' => 'Create, edit, and publish municipal news and updates',
                'manage achievements' => 'Manage awards, recognitions, and milestones',
                'manage tourism' => 'Manage tourism spots, destinations, and photo galleries',
                'manage services' => 'Manage public services, applications, and guidelines',
                'manage hero' => 'Manage hero slider images and highlights on the homepage',
            ],
            'Governance & Officials' => [
                'manage officials' => 'Manage municipal officials, mayor messages, and staff profiles',
            ],
            'Transparency & Bids' => [
                'manage transparency' => 'Manage transparency seal documents, bids, reports, and public records',
            ],
            'Careers & Recruitment' => [
                'manage jobs' => 'Post vacancies, job openings, and qualifications',
            ],
            'Communication' => [
                'access internal chat' => 'Access internal LGU messaging and staff communications',
            ],
            'System & Administration' => [
                'manage users' => 'Manage user accounts, assign roles, and grant permissions',
                'manage settings' => 'Update general site settings, directories, and static pages',
                'manage stats' => 'Update municipal demographic, economic, and administrative stats',
                'manage emergency' => 'Manage emergency contacts, hotlines, and crisis numbers',
            ],
        ];
    }
}
