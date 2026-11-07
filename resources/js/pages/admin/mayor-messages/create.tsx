import { Head } from '@inertiajs/react';
import MayorMessageController from '@/actions/App/Http/Controllers/Admin/MayorMessageController';
import MayorMessageForm from '@/pages/admin/mayor-messages/components/mayor-message-form';
import type { MessageType } from '@/types';

export default function CreateMayorMessage({
    messageTypes,
}: {
    messageTypes: MessageType[];
}) {
    return (
        <>
            <Head title="Create Mayor Message" />
            <MayorMessageForm
                title="Create Mayor Message"
                backHref={MayorMessageController.index.url()}
                messageTypes={messageTypes}
                onSubmit={(form) =>
                    form.post(MayorMessageController.store.url())
                }
                submitLabel="Create Message"
            />
        </>
    );
}
