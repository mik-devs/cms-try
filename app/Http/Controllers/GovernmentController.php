<?php

namespace App\Http\Controllers;

use App\Models\CitizenCharter;
use App\Models\Office;
use App\Models\Official;
use App\Models\Setting;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GovernmentController extends Controller
{
    public function index(?string $tab = null): Response
    {
        return Inertia::render('public/government', [
            'settings' => Setting::query()
                ->pluck('value', 'key')
                ->toArray(),
            'tab' => $tab,
        ]);
    }

    public function citizensCharter(): Response
    {
        return Inertia::render('public/government/citizens-charter', [
            'charters' => CitizenCharter::query()
                ->orderBy('order')
                ->orderBy('id')
                ->get(),
        ]);
    }

    public function directories(): Response
    {
        return Inertia::render('public/government/directories', [
            'offices' => Office::query()
                ->where('is_active', true)
                ->orderBy('order')
                ->orderBy('id')
                ->get(),
        ]);
    }

    public function officials(): Response
    {
        $officials = $this->groupedOfficials();

        return Inertia::render('public/elected-officials', [
            'mayor' => $officials['mayor'],
            'viceMayor' => $officials['viceMayor'],
            'members' => $officials['members'],
        ]);
    }

    public function sanggunianBayan(): Response
    {
        $officials = $this->groupedOfficials();

        return Inertia::render('public/sangguniang-bayan', [
            'viceMayor' => $officials['viceMayor'],
            'members' => $officials['members'],
        ]);
    }

    /**
     * @return array{
     *     mayor: Official|null,
     *     viceMayor: Official|null,
     *     members: Collection<int, Official>
     * }
     */
    private function groupedOfficials(): array
    {
        $officials = Official::query()
            ->with('committees')
            ->orderBy('order')
            ->orderBy('id')
            ->get();

        return [
            'mayor' => $officials->first(fn (Official $official): bool => Str::contains($official->position, 'Mayor', true)
                && ! Str::contains($official->position, 'Vice', true)),
            'viceMayor' => $officials->first(fn (Official $official): bool => Str::contains($official->position, 'Vice Mayor', true)),
            'members' => $officials
                ->filter(fn (Official $official): bool => Str::contains($official->position, 'Sangguniang Bayan', true)
                    || Str::contains($official->position, 'Councilor', true))
                ->values(),
        ];
    }
}
