import { Head } from '@inertiajs/react';
import MayorMessageController from '@/actions/App/Http/Controllers/Admin/MayorMessageController';
import ResourceTable, {
    type ResourceTableColumn,
} from '@/pages/admin/components/resource-table';
import type { MayorMessage } from '@/types';

interface PaginatedMayorMessages {
    data: MayorMessage[];
    links: { url: string | null; label: string; active: boolean }[];
}

export default function MayorMessagesIndex({
    mayorMessages,
}: {
    mayorMessages: PaginatedMayorMessages;
}) {
    const columns: ResourceTableColumn<MayorMessage>[] = [
        { label: 'Title', render: (message) => message.title },
        {
            label: 'Type',
            render: (message) =>
                message.message_type?.name.replaceAll('_', ' ') ?? '-',
        },
        {
            label: 'Published At',
            render: (message) =>
                message.published_at
                    ? new Date(message.published_at).toLocaleString()
                    : '—',
        },
    ];

    return (
        <>
            <Head title="Mayor's Corner" />
            <ResourceTable
                title="Mayor Messages"
                description="Manage the Mayor's Corner photo releases, speeches, achievements, and gallery."
                items={mayorMessages.data}
                links={mayorMessages.links}
                columns={columns}
                createHref={MayorMessageController.create.url()}
                createLabel="Add Message"
                editHref={(message) =>
                    MayorMessageController.edit.url(message.id)
                }
                deleteHref={(message) =>
                    MayorMessageController.destroy.url(message.id)
                }
                emptyMessage="No mayor messages have been added yet."
            />
        </>
    );
}
