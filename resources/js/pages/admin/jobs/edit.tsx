import { Head } from '@inertiajs/react';
import {
    index,
    update,
} from '@/actions/App/Http/Controllers/Admin/JobController';
import type { JobPosting, JobStatus } from '@/types';
import JobForm from '@/pages/admin/jobs/components/job-form';

export default function EditJob({
    job,
    jobStatuses,
}: {
    job: JobPosting;
    jobStatuses: JobStatus[];
}) {
    return (
        <>
            <Head title={`Edit ${job.title}`} />
            <JobForm
                title="Edit Job"
                backHref={index.url()}
                initialValues={job}
                jobStatuses={jobStatuses}
                onSubmit={(form) => form.put(update.url({ job: job.id }))}
                submitLabel="Save Changes"
            />
        </>
    );
}
