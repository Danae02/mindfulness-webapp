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
        Schema::table('research_settings', function (Blueprint $table) {
            $table->string('question')->nullable();
            $table->json('answers')->nullable(); // Opslaan als een JSON-array
        });
    }

    public function down()
    {
        Schema::table('research_settings', function (Blueprint $table) {
            $table->dropColumn(['question', 'answers']);
        });
    }
};
