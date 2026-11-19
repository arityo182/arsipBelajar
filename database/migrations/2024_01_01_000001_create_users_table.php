<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 100);
            $table->string('username', 50)->unique();
            $table->string('password', 255);
            $table->string('role', 10);
            $table->boolean('aktif')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });

        // Check constraint untuk role di PostgreSQL
        DB::statement("ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'USER'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
