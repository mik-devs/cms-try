import { Head } from '@inertiajs/react';
import {
    index,
    store,
} from '@/actions/App/Http/Controllers/Admin/JobController';
import JobForm from '@/pages/admin/jobs/components/job-form';
import type { JobStatus } from '@/types';

export default function CreateJob({
    jobStatuses,
}: {
    jobStatuses: JobStatus[];
}) {
    return (
        <>
            <Head title="Create Job" />
            <JobForm
                title="Create Job"
                backHref={index.url()}
                jobStatuses={jobStatuses}
                onSubmit={(form) => form.post(store.url())}
                submitLabel="Create Job"
            />
        </>
    );
}
