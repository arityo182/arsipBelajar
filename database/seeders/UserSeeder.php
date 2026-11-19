<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'id'       => 1,
                'nama'     => 'Administrator SIPLOK',
                'username' => 'admin',
                'password' => Hash::make('admin123'),
                'role'     => 'ADMIN',
                'aktif'    => true,
            ],
            [
                'id'       => 2,
                'nama'     => 'Petugas Arsip Hendra',
                'username' => 'hendra',
                'password' => Hash::make('petugas123'),
                'role'     => 'USER',
                'aktif'    => true,
            ],
            [
                'id'       => 3,
                'nama'     => 'Petugas Arsip Siti',
                'username' => 'siti',
                'password' => Hash::make('petugas123'),
                'role'     => 'USER',
                'aktif'    => true,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['username' => $userData['username']],
                $userData
            );
        }
    }
}
