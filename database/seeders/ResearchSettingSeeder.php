<?php

namespace Database\Seeders;

use App\Models\ResearchSettings;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ResearchSettingSeeder extends Seeder
{
    public function run()
    {
        ResearchSettings::create([
            'key_name' => 'mode',
            'value' => 'per_session', // Standaardinstelling
        ]);
    }
}
