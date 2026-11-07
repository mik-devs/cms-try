import { Head } from '@inertiajs/react';
import {
    create,
    destroy,
    edit,
} from '@/actions/App/Http/Controllers/Admin/TourismController';
import { Badge } from '@/components/ui/badge';
import ResourceTable, {
    type ResourceTableColumn,
} from '@/pages/admin/components/resource-table';
import type { TourismSpot } from '@/types';

interface PaginatedTourismSpots {
    data: TourismSpot[];
    links: { url: string | null; label: string; active: boolean }[];
}

const columns: ResourceTableColumn<TourismSpot>[] = [
    {
        label: 'Image',
        render: (spot) => (
            <img
                src={spot.image_url}
                alt=""
                className="h-14 w-14 rounded-lg border border-line-soft object-cover shadow-sm"
            />
        ),
    },
    { label: 'Name', render: (spot) => spot.name },
    { label: 'Category', render: (spot) => spot.category ?? '�?"' },
    { label: 'Barangay', render: (spot) => spot.barangay?.name ?? '�?"' },
    { label: 'Order', render: (spot) => spot.order },
    {
        label: 'Status',
        render: (spot) => (
            <Badge
                className={
                    spot.is_active
                        ? 'border-transparent bg-green text-white'
                        : 'border-transparent bg-gold text-ink'
                }
            >
                {spot.is_active ? 'Active' : 'Inactive'}
            </Badge>
        ),
    },
];

export default function TourismIndex({
    tourismSpots,
}: {
    tourismSpots: PaginatedTourismSpots;
}) {
    return (
        <>
            <Head title="Tourism" />
            <ResourceTable
                title="Tourism Spots"
                description="Manage tourist destinations shown on the public site."
                items={tourismSpots.data}
                links={tourismSpots.links}
                columns={columns}
                createHref={create.url()}
                createLabel="Create Tourism Spot"
                editHref={(spot) => edit.url({ tourism: spot.id })}
                deleteHref={(spot) => destroy.url({ tourism: spot.id })}
                getItemLabel={(spot) => spot.name}
                emptyMessage="No tourism spots found."
            />
        </>
    );
}
