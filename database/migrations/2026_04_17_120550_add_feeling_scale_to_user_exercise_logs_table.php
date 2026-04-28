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
        Schema::table('user_exercise_logs', function (Blueprint $table) {
            // Slaat op hoeveel antwoordopties beschikbaar waren bij het invullen
            // Nodig om waarden te normaliseren bij vergelijking (3-schaal vs 5-schaal)
            $table->tinyInteger('feeling_scale')->default(5)->after('feeling_after');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_exercise_logs', function (Blueprint $table) {
            $table->dropColumn('feeling_scale');
        });
    }
};
