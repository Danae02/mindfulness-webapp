<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('session_logs', function (Blueprint $table) {
            $table->id('session_id'); // Primair sleutel
            $table->unsignedBigInteger('user_id'); // Verwijzing naar gebruiker
            $table->dateTime('date_time'); // Starttijd van de sessie
            $table->integer('total_duration')->nullable(); // Totale duur in minuten
            $table->tinyInteger('feeling_before')->nullable(); // Gevoel voor sessie
            $table->tinyInteger('feeling_after')->nullable(); // Gevoel na sessie
            $table->timestamps(); // Voor created_at en updated_at

            // Foreign key constraints
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('session_logs');
    }
};
