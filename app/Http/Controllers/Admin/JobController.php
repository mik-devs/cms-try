<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreJobRequest;
use App\Http\Requests\Admin\UpdateJobRequest;
use App\Models\JobPosting;
use App\Models\JobStatus;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class JobController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/jobs/index', [
            'jobs' => JobPosting::query()->with('status')->latest()->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/jobs/create', [
            'jobStatuses' => JobStatus::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreJobRequest $request): RedirectResponse
    {
        JobPosting::query()->create($request->validated());

        return to_route('admin.jobs.index')->with('success', 'Job created');
    }

    public function edit(JobPosting $job): Response
    {
        $job->load('status');

        return Inertia::render('admin/jobs/edit', [
            'job' => $job,
            'jobStatuses' => JobStatus::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateJobRequest $request, JobPosting $job): RedirectResponse
    {
        $job->update($request->validated());

        return to_route('admin.jobs.index')->with('success', 'Job updated');
    }

    public function destroy(JobPosting $job): RedirectResponse
    {
        $job->delete();

        return to_route('admin.jobs.index')->with('success', 'Job deleted');
    }
}
