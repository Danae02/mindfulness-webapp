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
        Schema::create('user_exercise_logs', function (Blueprint $table) {
            $table->id('log_id');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('exercise_id')->constrained('exercises')->onDelete('cascade');
            $table->dateTime('date_time'); // Datum en tijdstip van de oefening
            $table->integer('duration_listened')->nullable(); // Aantal seconden geluisterd
            $table->boolean('completed')->default(false); // Of de oefening voltooid is
            $table->tinyInteger('feeling_before')->nullable(); // Stemming voor de oefening
            $table->tinyInteger('feeling_after')->nullable(); // Stemming na de oefening
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_exercise_logs');
    }
};
