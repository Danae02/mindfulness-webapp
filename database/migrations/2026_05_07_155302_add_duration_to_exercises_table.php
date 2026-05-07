<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('exercises', function (Blueprint $table) {
            // Duur in seconden (audio + ~60 seconden voor gevoelsvragen)
            // Wordt automatisch berekend bij upload via getID3
            $table->unsignedInteger('duration_seconds')->nullable()->after('audio_file_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exercises', function (Blueprint $table) {
            $table->dropColumn('duration_seconds');
        });
    }
};
