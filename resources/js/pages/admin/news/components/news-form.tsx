import { useState, type FormEvent } from 'react';
import { useForm, type InertiaForm } from '@inertiajs/react';
import type { News, NewsCategory } from '@/types';
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
import { DatePicker } from '@/components/kiblawan/ui/date-picker';
import { format } from 'date-fns';

export interface NewsFormData {
    title: string;
    excerpt: string;
    content: string;
    news_category_id: number | null;
    status: 'draft' | 'published';
    published_at: string;
    is_featured: boolean;
    image: File | null;
}

interface NewsFormProps {
    initialValues?: News;
    newsCategories?: NewsCategory[];
    onSubmit: (form: InertiaForm<NewsFormData>) => void;
    submitLabel: string;
    title?: string;
    backHref?: string;
}

export default function NewsForm({
    initialValues,
    newsCategories = [],
    onSubmit,
    submitLabel,
    title = submitLabel,
    backHref,
}: NewsFormProps) {
    const form = useForm<NewsFormData>({
        title: initialValues?.title ?? '',
        excerpt: initialValues?.excerpt ?? '',
        content: initialValues?.content ?? '',
        news_category_id: initialValues?.news_category_id ?? null,
        status: initialValues?.status ?? 'draft',
        published_at: initialValues?.published_at?.slice(0, 10) ?? '',
        is_featured: initialValues?.is_featured ?? false,
        image: null,
    });
    const [imageCleared, setImageCleared] = useState(false);

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
                    <Label htmlFor="news_category_id">
                        Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={
                            form.data.news_category_id === null
                                ? ''
                                : String(form.data.news_category_id)
                        }
                        onValueChange={(value) =>
                            form.setData('news_category_id', Number(value))
                        }
                    >
                        <SelectTrigger
                            id="news_category_id"
                            aria-invalid={Boolean(form.errors.news_category_id)}
                        >
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {newsCategories.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={String(category.id)}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={form.errors.news_category_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <textarea
                        id="excerpt"
                        value={form.data.excerpt}
                        onChange={(event) =>
                            form.setData('excerpt', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.excerpt)}
                        className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
                    />
                    <InputError message={form.errors.excerpt} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="content">
                        Content <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                        id="content"
                        required
                        value={form.data.content}
                        onChange={(event) =>
                            form.setData('content', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.content)}
                        className="min-h-64 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
                    />
                    <InputError message={form.errors.content} />
                </div>
            </div>

            <div className="space-y-6 bg-cream/50 p-6 rounded-[16px] border border-line-soft h-fit lg:col-span-1">
                <div className="grid gap-2">
                    <Label htmlFor="published_at">Published At</Label>
                    <DatePicker
                        value={
                            form.data.published_at
                                ? new Date(form.data.published_at + 'T00:00:00')
                                : undefined
                        }
                        onChange={(date) =>
                            form.setData(
                                'published_at',
                                date ? format(date, 'yyyy-MM-dd') : '',
                            )
                        }
                    />
                    <InputError message={form.errors.published_at} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="status">
                        Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={form.data.status}
                        onValueChange={(value) => {
                            if (value === 'draft' || value === 'published') {
                                form.setData('status', value);
                            }
                        }}
                    >
                        <SelectTrigger
                            id="status"
                            aria-invalid={Boolean(form.errors.status)}
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={form.errors.status} />
                </div>

                <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_featured"
                            checked={form.data.is_featured}
                            onCheckedChange={(checked) =>
                                form.setData('is_featured', checked === true)
                            }
                            aria-invalid={Boolean(form.errors.is_featured)}
                        />
                        <Label htmlFor="is_featured">Featured</Label>
                    </div>
                    <InputError message={form.errors.is_featured} />
                </div>

                <ImageUploader
                    label="Image"
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
            </div>
        </FormWrapper>
    );
}
