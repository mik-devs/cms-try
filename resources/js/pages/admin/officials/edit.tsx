import { Head } from '@inertiajs/react';
import type { Committee, Official } from '@/types';
import OfficialController from '@/actions/App/Http/Controllers/Admin/OfficialController';
import OfficialForm from '@/pages/admin/officials/components/official-form';

export default function EditOfficial({
    official,
    committees,
}: {
    official: Official;
    committees: Committee[];
}) {
    return (
        <>
            <Head title={`Edit ${official.name}`} />
            <OfficialForm
                title="Edit Official"
                backHref={OfficialController.index.url()}
                initialValues={official}
                committees={committees}
                onSubmit={(form) =>
                    form.put(OfficialController.update.url(official.id))
                }
                submitLabel="Save Changes"
            />
        </>
    );
}