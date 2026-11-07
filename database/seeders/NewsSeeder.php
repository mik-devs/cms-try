<?php

namespace Database\Seeders;

use App\Models\News;
use App\Models\NewsCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'title' => 'Regular Monday Flag Raising Ceremony',
                'excerpt' => 'Municipal officials and employees gathered for the regular Monday flag raising ceremony at the Municipal Hall grounds.',
                'content' => 'Municipal officials and employees gathered for the regular Monday flag raising ceremony at the Municipal Hall grounds. The activity opened the week with messages on public service and community cooperation.',
                'published_at' => '2026-10-24 08:00:00',
                'is_featured' => true,
            ],
            [
                'title' => 'Serbisyo Caravan, Umarangkada sa Barangay Poblacion',
                'excerpt' => 'Serbisyong pangkalusugan, sibil, at panlipunan ang hatid ng Serbisyo Caravan sa Barangay Poblacion.',
                'content' => 'Umarangkada ang Serbisyo Caravan sa Barangay Poblacion, na may dalang serbisyong pangkalusugan, sibil, at panlipunan para sa mga residente. Layunin ng programa na ilapit ang mga pangunahing serbisyo ng pamahalaang bayan sa bawat barangay.',
                'published_at' => '2026-10-18 09:00:00',
                'is_featured' => false,
            ],
            [
                'title' => 'Bagong Farm-to-Market Road, Pinasinayaan',
                'excerpt' => 'Isang bagong farm-to-market road ang pinasinayaan upang mapabilis ang paghahatid ng mga produkto ng mga magsasaka.',
                'content' => 'Isang bagong farm-to-market road ang pinasinayaan upang mapabilis ang paghahatid ng mga produkto ng mga magsasaka. Ayon sa Pamahalaang Bayan, bahagi ito ng patuloy na pagpapabuti ng imprastrukturang pang-agrikultura ng Kiblawan.',
                'published_at' => '2026-10-10 09:00:00',
                'is_featured' => false,
            ],
            [
                'title' => 'Iskolar ng Bayan, Tumanggap ng Tulong Pinansyal',
                'excerpt' => 'Mga iskolar ng bayan ang tumanggap ng tulong pinansyal sa ilalim ng programa ng Pamahalaang Bayan.',
                'content' => 'Mga iskolar ng bayan ang tumanggap ng tulong pinansyal sa ilalim ng programa ng Pamahalaang Bayan. Patuloy na sinusuportahan ng lokal na pamahalaan ang edukasyon ng mga kabataang Kiblawan.',
                'published_at' => '2026-10-05 09:00:00',
                'is_featured' => false,
            ],
        ];

        foreach ($items as $item) {
            News::query()->updateOrCreate(
                ['slug' => Str::slug($item['title'])],
                [
                    'title' => $item['title'],
                    'excerpt' => $item['excerpt'],
                    'content' => $item['content'],
                    'image' => null,
                    'news_category_id' => NewsCategory::query()
                        ->where('name', 'news')
                        ->value('id'),
                    'is_featured' => $item['is_featured'],
                    'status' => 'published',
                    'published_at' => Carbon::parse($item['published_at']),
                    'user_id' => null,
                ],
            );
        }
    }
}
