<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Canonical lookup values used to backfill existing string columns.
     *
     * @var array<string, array<int, string>>
     */
    private array $lookups = [
        'message_types' => ['photo_release', 'speech', 'achievement', 'gallery'],
        'news_categories' => ['news', 'announcement'],
        'job_statuses' => ['open', 'closed'],
    ];

    public function up(): void
    {
        Schema::create('committees', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('committee_official', function (Blueprint $table) {
            $table->foreignId('committee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('official_id')->constrained()->cascadeOnDelete();
            $table->primary(['committee_id', 'official_id']);
        });

        Schema::create('message_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('news_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('job_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        foreach ($this->lookups as $table => $names) {
            DB::table($table)->insert(array_map(fn (string $name): array => [
                'name' => $name,
                'created_at' => now(),
                'updated_at' => now(),
            ], $names));
        }

        Schema::table('tourism_spots', function (Blueprint $table) {
            $table->foreignId('barangay_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
        });

        Schema::table('mayor_messages', function (Blueprint $table) {
            $table->foreignId('message_type_id')
                ->nullable()
                ->constrained('message_types')
                ->nullOnDelete();
        });

        Schema::table('news', function (Blueprint $table) {
            $table->foreignId('news_category_id')
                ->nullable()
                ->constrained('news_categories')
                ->nullOnDelete();
        });

        Schema::table('job_postings', function (Blueprint $table) {
            $table->foreignId('job_status_id')
                ->nullable()
                ->constrained('job_statuses')
                ->nullOnDelete();
        });

        $this->backfillLegacyValues();

        Schema::table('mayor_messages', function (Blueprint $table) {
            $table->dropColumn('type');
        });

        Schema::table('news', function (Blueprint $table) {
            $table->dropColumn('category');
        });

        Schema::table('job_postings', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('officials', function (Blueprint $table) {
            $table->dropColumn('committee');
        });
    }

    public function down(): void
    {
        Schema::table('officials', function (Blueprint $table) {
            $table->string('committee')->nullable();
        });

        Schema::table('mayor_messages', function (Blueprint $table) {
            $table->string('type')->default('photo_release');
        });

        Schema::table('news', function (Blueprint $table) {
            $table->string('category')->default('news');
        });

        Schema::table('job_postings', function (Blueprint $table) {
            $table->string('status')->default('open');
        });

        DB::table('mayor_messages')->update([
            'type' => DB::raw('(select name from message_types where message_types.id = mayor_messages.message_type_id)'),
        ]);
        DB::table('news')->update([
            'category' => DB::raw('(select name from news_categories where news_categories.id = news.news_category_id)'),
        ]);
        DB::table('job_postings')->update([
            'status' => DB::raw('(select name from job_statuses where job_statuses.id = job_postings.job_status_id)'),
        ]);
        DB::table('officials')->update([
            'committee' => DB::raw('(select name from committees inner join committee_official on committee_official.committee_id = committees.id where committee_official.official_id = officials.id limit 1)'),
        ]);

        Schema::table('tourism_spots', function (Blueprint $table) {
            $table->dropConstrainedForeignId('barangay_id');
        });

        Schema::table('mayor_messages', function (Blueprint $table) {
            $table->dropConstrainedForeignId('message_type_id');
        });

        Schema::table('news', function (Blueprint $table) {
            $table->dropConstrainedForeignId('news_category_id');
        });

        Schema::table('job_postings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('job_status_id');
        });

        Schema::dropIfExists('committee_official');
        Schema::dropIfExists('committees');
        Schema::dropIfExists('message_types');
        Schema::dropIfExists('news_categories');
        Schema::dropIfExists('job_statuses');
    }

        private function backfillLegacyValues(): void
    {
        foreach ($this->lookups as $table => $names) {
            $foreignKey = match ($table) {
                'message_types' => ['mayor_messages', 'message_type_id', 'type'],
                'news_categories' => ['news', 'news_category_id', 'category'],
                'job_statuses' => ['job_postings', 'job_status_id', 'status'],
                
                default => throw new \InvalidArgumentException("Unexpected lookup table: {$table}"),
            };

            [$targetTable, $foreignColumn, $legacyColumn] = $foreignKey;

            foreach ($names as $name) {
                $lookupId = DB::table($table)->where('name', $name)->value('id');

                if ($lookupId === null) {
                    continue;
                }

                DB::table($targetTable)
                    ->where($legacyColumn, $name)
                    ->update([$foreignColumn => $lookupId]);
            }
        }
    
        $legacyCommittees = DB::table('officials')
            ->whereNotNull('committee')
            ->where('committee', '!=', '')
            ->distinct()
            ->pluck('committee');

        foreach ($legacyCommittees as $committeeName) {
            $committeeId = DB::table('committees')->insertGetId([
                'name' => $committeeName,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $officialIds = DB::table('officials')
                ->where('committee', $committeeName)
                ->pluck('id');

            foreach ($officialIds as $officialId) {
                DB::table('committee_official')->insert([
                    'committee_id' => $committeeId,
                    'official_id' => $officialId,
                ]);
            }
        }
    }
};
