import { Head } from '@inertiajs/react';
import {
    index,
    update,
} from '@/actions/App/Http/Controllers/Admin/TourismController';
import TourismForm from '@/pages/admin/tourism/components/tourism-form';
import type { TourismSpot } from '@/types';

export default function EditTourismSpot({
    tourismSpot,
    barangays,
}: {
    tourismSpot: TourismSpot;
    barangays: { id: number; name: string }[];
}) {
    return (
        <>
            <Head title={`Edit ${tourismSpot.name}`} />
            <TourismForm
                title="Edit Tourism Spot"
                backHref={index.url()}
                initialValues={tourismSpot}
                barangays={barangays}
                onSubmit={(form) =>
                    form.put(update.url({ tourism: tourismSpot.id }))
                }
                submitLabel="Save Changes"
            />
        </>
    );
}
