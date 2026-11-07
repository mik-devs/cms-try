import { Head } from '@inertiajs/react';
import MayorMessageController from '@/actions/App/Http/Controllers/Admin/MayorMessageController';
import MayorMessageForm from '@/pages/admin/mayor-messages/components/mayor-message-form';
import type { MayorMessage, MessageType } from '@/types';

export default function EditMayorMessage({
    mayorMessage,
    messageTypes,
}: {
    mayorMessage: MayorMessage;
    messageTypes: MessageType[];
}) {
    return (
        <>
            <Head title={`Edit ${mayorMessage.title}`} />
            <MayorMessageForm
                title="Edit Mayor Message"
                backHref={MayorMessageController.index.url()}
                initialValues={mayorMessage}
                messageTypes={messageTypes}
                onSubmit={(form) =>
                    form.put(
                        MayorMessageController.update.url(mayorMessage.id),
                    )
                }
                submitLabel="Save Changes"
            />
        </>
    );
}
