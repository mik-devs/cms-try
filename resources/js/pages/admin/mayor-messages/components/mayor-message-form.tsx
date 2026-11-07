import { useState, type FormEvent } from 'react';
import { useForm, type InertiaForm } from '@inertiajs/react';
import type { MayorMessage, MessageType } from '@/types';
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
import { ImageUploader } from '@/components/kiblawan/ui/image-uploader';
import { DatePicker } from '@/components/kiblawan/ui/date-picker';
import { format } from 'date-fns';

export interface MayorMessageFormData {
    title: string;
    content: string;
    image: File | null;
    message_type_id: number | null;
    published_at: string;
}

interface MayorMessageFormProps {
    initialValues?: MayorMessage;
    messageTypes?: MessageType[];
    onSubmit: (form: InertiaForm<MayorMessageFormData>) => void;
    submitLabel: string;
    title?: string;
    backHref?: string;
}

export default function MayorMessageForm({
    initialValues,
    messageTypes = [],
    onSubmit,
    submitLabel,
    title = submitLabel,
    backHref,
}: MayorMessageFormProps) {
    const form = useForm<MayorMessageFormData>({
        title: initialValues?.title ?? '',
        content: initialValues?.content ?? '',
        image: null,
        message_type_id: initialValues?.message_type_id ?? null,
        published_at: initialValues?.published_at?.slice(0, 10) ?? '',
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
                        className="min-h-48 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
                    />
                    <InputError message={form.errors.content} />
                </div>
            </div>

            <div className="space-y-6 bg-cream/50 p-6 rounded-[16px] border border-line-soft h-fit lg:col-span-1">
                <div className="grid gap-2 sm:max-w-md">
                    <Label htmlFor="message_type_id">
                        Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={
                            form.data.message_type_id === null
                                ? ''
                                : String(form.data.message_type_id)
                        }
                        onValueChange={(value) =>
                            form.setData('message_type_id', Number(value))
                        }
                    >
                        <SelectTrigger
                            id="message_type_id"
                            aria-invalid={Boolean(form.errors.message_type_id)}
                        >
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                            {messageTypes.map((messageType) => (
                                <SelectItem
                                    key={messageType.id}
                                    value={String(messageType.id)}
                                >
                                    {messageType.name.replaceAll('_', ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={form.errors.message_type_id} />
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
            </div>
        </FormWrapper>
    );
}
