<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Drop teams table and team_id foreign key from users.
     */
    public function up(): void
    {
        // Drop foreign key from users table if it exists
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeignIdFor('Team', 'team_id');
            $table->dropColumn('team_id');
        });

        // Drop teams table
        Schema::dropIfExists('teams');
    }

    /**
     * Restore teams table and team_id column.
     */
    public function down(): void
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('team_id')->constrained('teams')->onDelete('cascade');
        });
    }
};
