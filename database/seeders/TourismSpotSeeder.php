<?php

namespace Database\Seeders;

use App\Models\Barangay;
use App\Models\TourismSpot;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TourismSpotSeeder extends Seeder
{
    public function run(): void
    {
        $spots = [
            ['name' => 'Lawayan Falls', 'description' => 'A quiet, natural waterfall spot in Barangay Kisulan, open 24 hours for nature lovers.', 'image' => '/tourism/lawayan2.jpg', 'category' => 'Waterfalls', 'barangay' => 'Kisulan', 'latitude' => 6.5348513, 'longitude' => 125.2345303],
            ['name' => 'Pandong Bato Peak & Trail', 'description' => 'Located in Brgy. Waterfall, featuring the Bito Waterfall, Sigpit River moss garden, and Amakanin rock-wall rappelling.', 'image' => '/tourism/waterfall.jpg', 'category' => 'Eco-Adventure', 'barangay' => 'Waterfall', 'latitude' => 6.5934238, 'longitude' => 125.2038305],
            ['name' => 'Lorenza Amando Farm Resort', 'description' => 'A well-visited family and leisure farm in New Sibunga, offering a relaxing countryside experience.', 'image' => '/tourism/LA1.jpg', 'category' => 'Agri-Tourism', 'barangay' => 'New Sibonga', 'latitude' => 6.6532300, 'longitude' => 125.2683943],
            ['name' => 'The Farm Inland Resort', 'description' => 'A popular inland resort in New Sibunga featuring swimming pools, outdoor dining, and farm-to-table experiences.', 'image' => '/images/kib.png', 'category' => 'Agri-Tourism', 'barangay' => 'New Sibonga', 'latitude' => 6.6500, 'longitude' => 125.2000],
        ];

        foreach ($spots as $index => $spot) {
            TourismSpot::query()->updateOrCreate(
                ['slug' => Str::slug($spot['name'])],
                [
                    'name' => $spot['name'],
                    'slug' => Str::slug($spot['name']),
                    'description' => $spot['description'],
                    'image' => $spot['image'],
                    'category' => $spot['category'],
                    'barangay_id' => Barangay::query()
                        ->where('name', $spot['barangay'])
                        ->value('id'),
                    'latitude' => $spot['latitude'],
                    'longitude' => $spot['longitude'],
                    'order' => $index + 1,
                    'is_active' => true,
                ],
            );
        }
    }
}
