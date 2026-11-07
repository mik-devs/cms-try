import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
    create,
    destroy,
    edit,
} from '@/actions/App/Http/Controllers/Admin/JobController';
import ResourceTable, {
    type ResourceTableColumn,
} from '@/pages/admin/components/resource-table';
import type { JobPosting } from '@/types';

interface PaginatedJobs {
    data: JobPosting[];
    links: { url: string | null; label: string; active: boolean }[];
}

const columns: ResourceTableColumn<JobPosting>[] = [
    { label: 'Title', render: (job) => job.title },
    { label: 'Department', render: (job) => job.department },
    {
        label: 'Deadline',
        render: (job) =>
            job.deadline
                ? new Date(`${job.deadline}T00:00:00`).toLocaleDateString()
                : '—',
    },
    {
        label: 'Status',
        render: (job) => (
            <Badge
                className={
                    job.status?.name === 'open'
                        ? 'border-transparent bg-green text-white'
                        : 'border-transparent bg-gold text-ink'
                }
            >
                {job.status?.name ?? '-'}
            </Badge>
        ),
    },
];

export default function JobsIndex({ jobs }: { jobs: PaginatedJobs }) {
    return (
        <>
            <Head title="Jobs" />
            <ResourceTable
                title="Jobs"
                description="Manage municipal job postings."
                items={jobs.data}
                links={jobs.links}
                columns={columns}
                createHref={create.url()}
                createLabel="Create Job"
                editHref={(job) => edit.url({ job: job.id })}
                deleteHref={(job) => destroy.url({ job: job.id })}
                emptyMessage="No jobs found."
            />
        </>
    );
}
