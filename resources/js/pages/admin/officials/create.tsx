import { Head } from '@inertiajs/react';
import OfficialController from '@/actions/App/Http/Controllers/Admin/OfficialController';
import OfficialForm from '@/pages/admin/officials/components/official-form';
import type { Committee } from '@/types';

export default function CreateOfficial({
    committees,
}: {
    committees: Committee[];
}) {
    return (
        <>
            <Head title="Create Official" />
            <OfficialForm
                title="Create Official"
                backHref={OfficialController.index.url()}
                committees={committees}
                onSubmit={(form) => form.post(OfficialController.store.url())}
                submitLabel="Create Official"
            />
        </>
    );
}