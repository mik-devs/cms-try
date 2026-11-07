<?php

namespace Database\Seeders;

use App\Models\JobPosting;
use App\Models\JobStatus;
use Illuminate\Database\Seeder;

class JobSeeder extends Seeder
{
    public function run(): void
    {
        $jobs = [
            ['title' => 'Internal Auditor III', 'department' => 'Municipality of Kiblawan', 'deadline' => '2026-10-26'],
            ['title' => 'Local Disaster Risk Reduction and Management Officer I', 'department' => 'MDRRMO', 'deadline' => '2026-09-01'],
            ['title' => 'Social Welfare Officer II', 'department' => 'MSWDO', 'deadline' => '2026-09-01'],
        ];

        foreach ($jobs as $job) {
            JobPosting::query()->updateOrCreate(
                ['title' => $job['title']],
                $job + [
                    'description' => 'Qualified applicants may submit their application to the Human Resource Management Office of the Municipality of Kiblawan.',
                    'job_status_id' => JobStatus::query()
                        ->where('name', 'open')
                        ->value('id'),
                ],
            );
        }
    }
}
