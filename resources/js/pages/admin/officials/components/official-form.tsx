import { useState, type FormEvent } from 'react';
import { useForm, type InertiaForm } from '@inertiajs/react';
import type { Committee, Official } from '@/types';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormWrapper } from '@/components/kiblawan/ui/form-wrapper';
import { ImageUploader } from '@/components/kiblawan/ui/image-uploader';

export interface OfficialFormData {
    name: string;
    position: string;
    committees: number[];
    facebook_url: string;
    instagram_url: string;
    photo: File | null;
    order: number;
}

interface OfficialFormProps {
    initialValues?: Official;
    committees?: Committee[];
    onSubmit: (form: InertiaForm<OfficialFormData>) => void;
    submitLabel: string;
    title?: string;
    backHref?: string;
}

export default function OfficialForm({
    initialValues,
    committees = [],
    onSubmit,
    submitLabel,
    title = submitLabel,
    backHref,
}: OfficialFormProps) {
    const form = useForm<OfficialFormData>({
        name: initialValues?.name ?? '',
        position: initialValues?.position ?? '',
        committees:
            initialValues?.committees?.map((committee) => committee.id) ?? [],
        facebook_url: initialValues?.facebook_url ?? '',
        instagram_url: initialValues?.instagram_url ?? '',
        photo: null,
        order: initialValues?.order ?? 0,
    });
    const [photoCleared, setPhotoCleared] = useState(false);

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
                    <Label htmlFor="name">
                        Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        required
                        value={form.data.name}
                        onChange={(event) =>
                            form.setData('name', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.name)}
                    />
                    <InputError message={form.errors.name} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="position">
                        Position <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="position"
                        required
                        value={form.data.position}
                        onChange={(event) =>
                            form.setData('position', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.position)}
                    />
                    <InputError message={form.errors.position} />
                </div>
                <div className="grid gap-2">
                    <Label>Committees</Label>
                    <div className="grid gap-2 rounded-md border border-input p-3 sm:grid-cols-2">
                        {committees.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No committees available.
                            </p>
                        ) : (
                            committees.map((committee) => {
                                const checked = form.data.committees.includes(
                                    committee.id,
                                );

                                return (
                                    <div
                                        key={committee.id}
                                        className="flex items-center gap-2"
                                    >
                                        <Checkbox
                                            id={`committee-${committee.id}`}
                                            checked={checked}
                                            onCheckedChange={(value) =>
                                                form.setData(
                                                    'committees',
                                                    value === true
                                                        ? [
                                                              ...form.data
                                                                  .committees,
                                                              committee.id,
                                                          ]
                                                        : form.data.committees.filter(
                                                              (id) =>
                                                                  id !==
                                                                  committee.id,
                                                          ),
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor={`committee-${committee.id}`}
                                        >
                                            {committee.name}
                                        </Label>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <InputError message={form.errors.committees} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="facebook_url">Facebook URL</Label>
                    <Input
                        id="facebook_url"
                        type="url"
                        placeholder="https://facebook.com/..."
                        value={form.data.facebook_url}
                        onChange={(event) =>
                            form.setData('facebook_url', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.facebook_url)}
                    />
                    <InputError message={form.errors.facebook_url} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="instagram_url">Instagram URL</Label>
                    <Input
                        id="instagram_url"
                        type="url"
                        placeholder="https://instagram.com/..."
                        value={form.data.instagram_url}
                        onChange={(event) =>
                            form.setData('instagram_url', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.instagram_url)}
                    />
                    <InputError message={form.errors.instagram_url} />
                </div>
            </div>

            <div className="space-y-6 bg-cream/50 p-6 rounded-[16px] border border-line-soft h-fit lg:col-span-1">
                <ImageUploader
                    label="Photo"
                    value={
                        photoCleared
                            ? null
                            : (form.data.photo ??
                              initialValues?.photo_url ??
                              null)
                    }
                    onChange={(file) => {
                        form.setData('photo', file);
                        if (file === null) {
                            setPhotoCleared(true);
                        } else {
                            setPhotoCleared(false);
                        }
                    }}
                    error={form.errors.photo}
                />
                <div className="grid gap-2 sm:max-w-xs">
                    <Label htmlFor="order">
                        Order <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="order"
                        type="number"
                        required
                        value={form.data.order}
                        onChange={(event) =>
                            form.setData(
                                'order',
                                event.target.value === ''
                                    ? 0
                                    : Number(event.target.value),
                            )
                        }
                        aria-invalid={Boolean(form.errors.order)}
                    />
                    <InputError message={form.errors.order} />
                </div>
            </div>
        </FormWrapper>
    );
}