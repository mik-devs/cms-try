<?php

namespace App\Actions;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use JsonException;

class StoreStructuredPage
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(string $slug, array $data): string
    {
        $directory = 'pages/'.$slug;

        return match ($slug) {
            'demographic' => $this->handleDemographic($data, $directory),
            'socio-economic' => $this->handleSocioEconomic($data, $directory),
            'geography' => $this->handleGeography($data, $directory),
            default => json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        };
    }

    /**
     * @param  array<string, mixed>  $data
     *
     * @throws JsonException
     */
    private function handleDemographic(array $data, string $directory): string
    {
        $stats = [];

        foreach (array_values($data['stats'] ?? $data['stat_cards'] ?? []) as $stat) {
            if (! is_array($stat)) {
                continue;
            }

            $stats[] = [
                'label' => $this->cleanText($stat['label'] ?? ''),
                'value' => $this->cleanText($stat['value'] ?? ''),
                'suffix' => $this->cleanText($stat['suffix'] ?? ''),
            ];
        }

        $normalized = [
            'intro' => $this->cleanText($data['intro'] ?? $data['intro_text'] ?? ''),
            'stats' => $stats,
            'image' => $this->resolveImage($data, $directory, ['image', 'photo', 'cover_image'], ['existing_image', 'existing_photo']),
        ];

        return json_encode(
            $normalized,
            JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE,
        );
    }

    /**
     * @param  array<string, mixed>  $data
     *
     * @throws JsonException
     */
    private function handleSocioEconomic(array $data, string $directory): string
    {
        $sectors = [];

        foreach (array_values($data['sectors'] ?? $data['cards'] ?? $data['sector_cards'] ?? []) as $sector) {
            if (! is_array($sector)) {
                continue;
            }

            $item = [
                'icon' => $this->cleanText($sector['icon'] ?? $sector['icon_name'] ?? ''),
                'title' => $this->cleanText($sector['title'] ?? ''),
                'description' => $this->cleanText($sector['description'] ?? $sector['body'] ?? ''),
            ];

            if (array_key_exists('image', $sector) || array_key_exists('existing_image', $sector)) {
                $item['image'] = $this->resolveImage($sector, $directory, ['image', 'photo'], ['existing_image', 'existing_photo']);
            }

            $sectors[] = $item;
        }

        $normalized = [
            'sectors' => $sectors,
        ];

        return json_encode(
            $normalized,
            JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE,
        );
    }

    /**
     * @param  array<string, mixed>  $data
     *
     * @throws JsonException
     */
    private function handleGeography(array $data, string $directory): string
    {
        $facts = [];

        foreach (array_values($data['facts'] ?? $data['geographical_facts'] ?? $data['facts_list'] ?? []) as $fact) {
            if (! is_array($fact)) {
                continue;
            }

            $facts[] = [
                'label' => $this->cleanText($fact['label'] ?? ''),
                'value' => $this->cleanText($fact['value'] ?? ''),
            ];
        }

        $normalized = [
            'left_text' => $this->cleanText($data['left_text'] ?? $data['left'] ?? $data['text'] ?? $data['content'] ?? ''),
            'facts' => $facts,
            'map_image' => $this->resolveImage($data, $directory, ['map_image', 'map', 'image', 'photo'], ['existing_map_image', 'existing_image', 'existing_photo']),
        ];

        return json_encode(
            $normalized,
            JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE,
        );
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, string>  $existingKeys
     * @param  array<int, string>  $uploadKeys
     */
    private function resolveImage(array $data, string $directory, array $uploadKeys, array $existingKeys): string
    {
        foreach ($uploadKeys as $key) {
            $upload = $data[$key] ?? null;

            if ($upload instanceof UploadedFile) {
                foreach ($existingKeys as $existingKey) {
                    $this->deleteManagedImage($data[$existingKey] ?? null, $directory);
                }

                return '/storage/'.$upload->store($directory, 'public');
            }
        }

        foreach ($existingKeys as $existingKey) {
            $value = $data[$existingKey] ?? null;

            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        return '';
    }

    private function deleteManagedImage(mixed $path, string $directory): void
    {
        if (! is_string($path) || $path === '') {
            return;
        }

        $relative = preg_replace('#^/storage/#', '', $path) ?? '';

        if (! str_starts_with($relative, $directory.'/')) {
            return;
        }

        Storage::disk('public')->delete($relative);
    }

    private function cleanText(mixed $value): string
    {
        return trim(strip_tags((string) $value));
    }
}
