<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Format;
use Intervention\Image\ImageManager;
use RuntimeException;

trait HandlesImageUploads
{
    /**
     * Decode an uploaded image, auto-orient it, downscale it to a maximum
     * of 1920px width (maintaining aspect ratio), convert to WebP at 85% quality,
     * and save it to the specified storage disk.
     *
     * @param  UploadedFile  $file  The uploaded image file.
     * @param  string  $directory  Target directory on the disk (e.g. 'hero', 'news').
     * @param  string  $disk  Filesystem disk (defaults to 'public').
     * @return string The relative file path of the stored WebP image.
     *
     * @throws RuntimeException If storing the image fails.
     */
    protected function storeOptimizedImage(UploadedFile $file, string $directory, string $disk = 'public'): string
    {
        $manager = new ImageManager(new Driver);

        $image = $manager->decodePath($file->getRealPath());

        $image->orient()->scaleDown(width: 1920);

        $encoded = $image->encodeUsingFormat(Format::WEBP, quality: 85);

        $path = trim($directory, '/').'/'.Str::uuid()->toString().'.webp';

        if (! Storage::disk($disk)->put($path, (string) $encoded)) {
            throw new RuntimeException('The optimized image could not be stored.');
        }

        return $path;
    }

    /**
     * Alias for storeOptimizedImage.
     *
     * @param  UploadedFile  $file  The uploaded image file.
     * @param  string  $directory  Target directory on the disk.
     * @param  string  $disk  Filesystem disk (defaults to 'public').
     * @return string The relative file path of the stored WebP image.
     */
    protected function uploadImage(UploadedFile $file, string $directory, string $disk = 'public'): string
    {
        return $this->storeOptimizedImage($file, $directory, $disk);
    }

    /**
     * Delete an existing image from the configured storage disk.
     *
     * @param  string|null  $path  The relative path of the image to delete.
     * @param  string  $disk  Filesystem disk (defaults to 'public').
     * @return bool True if deleted or already absent, false on deletion failure.
     */
    protected function deleteImage(?string $path, string $disk = 'public'): bool
    {
        if (blank($path)) {
            return true;
        }

        if (Storage::disk($disk)->exists($path)) {
            return Storage::disk($disk)->delete($path);
        }

        return true;
    }
}
