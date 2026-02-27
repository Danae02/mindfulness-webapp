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
        Schema::create('exercises', function (Blueprint $table) {
            $table->id();
            $table->string('exercise_name');
            $table->json('keywords')->nullable(); // Eventueel als JSON-veld
//            $table->string('difficulty_level')->default('beginner'); // Bijvoorbeeld 'beginner', 'gevorderd'
//            $table->integer('duration'); // In minuten
            $table->string('audio_file_path'); // Locatie van het audiobestand
//            $table->foreignId('created_by')->constrained('users')->onDelete('set null'); // Optioneel: ID van de aanmaker
            $table->integer('times_done')->default(0);
//            $table->timestamp('last_time')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exercises');
    }
};
