import { useForm, type InertiaForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import type { JobPosting, JobStatus } from '@/types';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FormWrapper } from '@/components/kiblawan/ui/form-wrapper';
import { DatePicker } from '@/components/kiblawan/ui/date-picker';
import { format } from 'date-fns';

export interface JobFormData {
    title: string;
    description: string;
    department: string;
    deadline: string;
    job_status_id: number | null;
}

interface JobFormProps {
    initialValues?: JobPosting;
    jobStatuses?: JobStatus[];
    onSubmit: (form: InertiaForm<JobFormData>) => void;
    submitLabel: string;
    title?: string;
    backHref?: string;
}

export default function JobForm({
    initialValues,
    jobStatuses = [],
    onSubmit,
    submitLabel,
    title = submitLabel,
    backHref,
}: JobFormProps) {
    const form = useForm<JobFormData>({
        title: initialValues?.title ?? '',
        description: initialValues?.description ?? '',
        department: initialValues?.department ?? '',
        deadline: initialValues?.deadline?.slice(0, 10) ?? '',
        job_status_id: initialValues?.job_status_id ?? null,
    });

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        onSubmit(form);
    }

    return (
        <FormWrapper
            title={title}
            backHref={backHref}
            onSubmit={handleSubmit}
            processing={form.processing}
            submitLabel={submitLabel}
        >
            <div className="space-y-6 lg:col-span-2">
                <div className="grid gap-2">
                    <Label htmlFor="title">
                        Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="title"
                        required
                        value={form.data.title}
                        onChange={(event) =>
                            form.setData('title', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.title)}
                    />
                    <InputError message={form.errors.title} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">
                        Description <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                        id="description"
                        required
                        value={form.data.description}
                        onChange={(event) =>
                            form.setData('description', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.description)}
                        className="min-h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
                    />
                    <InputError message={form.errors.description} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="department">
                        Department <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="department"
                        required
                        value={form.data.department}
                        onChange={(event) =>
                            form.setData('department', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.department)}
                    />
                    <InputError message={form.errors.department} />
                </div>
            </div>

            <div className="space-y-6 bg-cream/50 p-6 rounded-[16px] border border-line-soft h-fit lg:col-span-1">
                <div className="grid gap-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <DatePicker
                        value={
                            form.data.deadline
                                ? new Date(form.data.deadline + 'T00:00:00')
                                : undefined
                        }
                        onChange={(date) =>
                            form.setData(
                                'deadline',
                                date ? format(date, 'yyyy-MM-dd') : '',
                            )
                        }
                    />
                    <InputError message={form.errors.deadline} />
                </div>
                <div className="grid gap-2 sm:max-w-xs">
                    <Label htmlFor="job_status_id">
                        Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={
                            form.data.job_status_id === null
                                ? ''
                                : String(form.data.job_status_id)
                        }
                        onValueChange={(value) =>
                            form.setData('job_status_id', Number(value))
                        }
                    >
                        <SelectTrigger
                            id="job_status_id"
                            aria-invalid={Boolean(form.errors.job_status_id)}
                        >
                            <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                            {jobStatuses.map((status) => (
                                <SelectItem
                                    key={status.id}
                                    value={String(status.id)}
                                >
                                    {status.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={form.errors.job_status_id} />
                </div>
            </div>
        </FormWrapper>
    );
}
