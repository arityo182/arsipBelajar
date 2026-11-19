<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            KecamatanDesaSeeder::class,
            LokasiSeeder::class,
            DokumenSeeder::class,
        ]);
    }
}
