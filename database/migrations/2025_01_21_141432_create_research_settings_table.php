<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('research_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key_name')->unique(); // De naam van de instelling (bijvoorbeeld 'mode')
            $table->string('value');             // De waarde (bijvoorbeeld 'per_session')
            $table->timestamps();                // Voor created_at en updated_at
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('research_settings');
    }
};
