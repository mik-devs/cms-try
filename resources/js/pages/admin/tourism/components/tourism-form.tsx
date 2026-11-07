import { useEffect, useState, type FormEvent } from 'react';
import { router, useForm, type InertiaForm } from '@inertiajs/react';

import type { TourismSpot } from '@/types';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
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
import { ImageUploader } from '@/components/kiblawan/ui/image-uploader';
import { MultiImageUploader } from '@/components/kiblawan/ui/multi-image-uploader';

export interface TourismFormData {
    name: string;
    slug: string;
    description: string;
    category: string;
    barangay_id: number | null;
    latitude: string;
    longitude: string;
    image: File | null;
    images: File[];
    order: number;
    is_active: boolean;
}

interface TourismFormProps {
    initialValues?: TourismSpot;
    barangays?: { id: number; name: string }[];
    onSubmit: (form: InertiaForm<TourismFormData>) => void;
    submitLabel: string;
    title?: string;
    backHref?: string;
}

export default function TourismForm({
    initialValues,
    barangays = [],
    onSubmit,
    submitLabel,
    title = submitLabel,
    backHref,
}: TourismFormProps) {
    const form = useForm<TourismFormData>({
        name: initialValues?.name ?? '',
        slug: initialValues?.slug ?? '',
        description: initialValues?.description ?? '',
        category: initialValues?.category ?? '',
        barangay_id: initialValues?.barangay_id ?? null,
        latitude: initialValues?.latitude ?? '',
        longitude: initialValues?.longitude ?? '',
        image: null,
        images: [],
        order: initialValues?.order ?? 0,
        is_active: initialValues?.is_active ?? true,
    });
    const [imageCleared, setImageCleared] = useState(false);
    const existingGalleryImages = initialValues?.images ?? [];

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
                <h3 className="mb-4 border-b border-line-soft pb-2 text-sm font-bold tracking-wider text-maroon uppercase">
                    Basic Information
                </h3>
                <div className="grid gap-2">
                    <Label htmlFor="name">
                        Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        required
                        maxLength={255}
                        value={form.data.name}
                        onChange={(event) =>
                            form.setData('name', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.name)}
                    />
                    <InputError message={form.errors.name} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="slug">
                        Slug <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="slug"
                        required
                        maxLength={255}
                        placeholder="e.g. lawayan-falls"
                        value={form.data.slug}
                        onChange={(event) =>
                            form.setData('slug', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.slug)}
                    />
                    <InputError message={form.errors.slug} />
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
                    <Label htmlFor="category">
                        Category <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="category"
                        required
                        maxLength={255}
                        value={form.data.category}
                        onChange={(event) =>
                            form.setData('category', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.category)}
                    />
                    <InputError message={form.errors.category} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="barangay_id">Barangay</Label>
                    <Select
                        value={
                            form.data.barangay_id === null
                                ? 'none'
                                : String(form.data.barangay_id)
                        }
                        onValueChange={(value) =>
                            form.setData(
                                'barangay_id',
                                value === 'none' ? null : Number(value),
                            )
                        }
                    >
                        <SelectTrigger
                            id="barangay_id"
                            aria-invalid={Boolean(form.errors.barangay_id)}
                        >
                            <SelectValue placeholder="Select a barangay" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {barangays.map((barangay) => (
                                <SelectItem
                                    key={barangay.id}
                                    value={String(barangay.id)}
                                >
                                    {barangay.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={form.errors.barangay_id} />
                </div>
                <h3 className="mb-4 border-b border-line-soft pb-2 text-sm font-bold tracking-wider text-maroon uppercase">
                    Location & Settings
                </h3>
                <fieldset className="grid gap-4 sm:grid-cols-2">
                    <legend className="mb-2 text-sm font-medium">
                        Coordinates
                    </legend>
                    <div className="grid gap-2">
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                            id="latitude"
                            type="number"
                            step="any"
                            placeholder="e.g. 6.5348513"
                            value={form.data.latitude}
                            onChange={(event) =>
                                form.setData('latitude', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.latitude)}
                        />
                        <InputError message={form.errors.latitude} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                            id="longitude"
                            type="number"
                            step="any"
                            placeholder="e.g. 125.2345303"
                            value={form.data.longitude}
                            onChange={(event) =>
                                form.setData('longitude', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.longitude)}
                        />
                        <InputError message={form.errors.longitude} />
                    </div>
                </fieldset>
                <h3 className="mb-4 border-b border-line-soft pb-2 text-sm font-bold tracking-wider text-maroon uppercase">
                    Gallery & Media
                </h3>
                <p className="mb-2 text-xs text-ink-muted">
                    These photos will be displayed in a carousel when a user views
                    the full Tourism Spot details.
                </p>
                <div className="max-w-2xl">
                    <MultiImageUploader
                        label="Additional Gallery Photos"
                    value={form.data.images}
                    onChange={(files) => form.setData('images', files)}
                    existingImages={existingGalleryImages.map((image) => ({
                        id: image.id,
                        image_url: image.image_url,
                    }))}
                    onRemoveExisting={(image) => {
                        if (
                            confirm(
                                'Are you sure you want to delete this image?',
                            )
                        ) {
                            router.delete(
                                `/admin/tourism-images/${
                                    (image as { id?: number }).id
                                }`,
                            );
                        }
                    }}
                    error={form.errors.images}
                />
            </div>
            </div>

            <div className="space-y-6 bg-cream/50 p-6 rounded-[16px] border border-line-soft h-fit lg:col-span-1">
                <h3 className="mb-4 border-b border-line-soft pb-2 text-sm font-bold tracking-wider text-maroon uppercase">
                    Primary Media
                </h3>
                <p className="mb-2 text-xs text-ink-muted">
                    This is the primary photo shown on the Home Page and Tourism
                    cards.
                </p>
                <ImageUploader
                    label="Main Cover Image"
                    value={
                        imageCleared
                            ? null
                            : (form.data.image ??
                              initialValues?.image_url ??
                              null)
                    }
                    onChange={(file) => {
                        form.setData('image', file);
                        if (file === null) {
                            setImageCleared(true);
                        } else {
                            setImageCleared(false);
                        }
                    }}
                    error={form.errors.image}
                />
                <div className="grid gap-2 sm:max-w-xs">
                    <Label htmlFor="order">
                        Order <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="order"
                        type="number"
                        min={0}
                        step={1}
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
                <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_active"
                            checked={form.data.is_active}
                            onCheckedChange={(checked) =>
                                form.setData('is_active', checked === true)
                            }
                            aria-invalid={Boolean(form.errors.is_active)}
                        />
                        <Label htmlFor="is_active">Active</Label>
                    </div>
                    <InputError message={form.errors.is_active} />
                </div>
            </div>
        </FormWrapper>
    );
}
