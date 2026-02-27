<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddSessionDurationToUserExerciseLogsTable extends Migration
{
    public function up()
    {
        Schema::table('user_exercise_logs', function (Blueprint $table) {
            $table->integer('session_duration')->nullable()->after('completed'); // Tijd in seconden
        });
    }

    public function down()
    {
        Schema::table('user_exercise_logs', function (Blueprint $table) {
            $table->dropColumn('session_duration');
        });
    }
}
