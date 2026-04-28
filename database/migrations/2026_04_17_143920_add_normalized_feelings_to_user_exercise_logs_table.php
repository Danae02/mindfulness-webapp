<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('user_exercise_logs', function (Blueprint $table) {
            $table->integer('feeling_before_pct')->nullable()->after('feeling_scale');
            $table->integer('feeling_after_pct')->nullable()->after('feeling_before_pct');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('user_exercise_logs', function (Blueprint $table) {
            $table->dropColumn(['feeling_before_pct', 'feeling_after_pct']);
        });
    }
};
