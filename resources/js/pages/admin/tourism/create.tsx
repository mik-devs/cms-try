import { Head } from '@inertiajs/react';
import {
    index,
    store,
} from '@/actions/App/Http/Controllers/Admin/TourismController';
import TourismForm from '@/pages/admin/tourism/components/tourism-form';

export default function CreateTourismSpot({
    barangays,
}: {
    barangays: { id: number; name: string }[];
}) {
    return (
        <>
            <Head title="Create Tourism Spot" />
            <TourismForm
                title="Create Tourism Spot"
                backHref={index.url()}
                barangays={barangays}
                onSubmit={(form) => form.post(store.url())}
                submitLabel="Create Tourism Spot"
            />
        </>
    );
}
