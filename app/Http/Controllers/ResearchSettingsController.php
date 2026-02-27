<?php

namespace App\Http\Controllers;

use App\Models\ResearchSettings;
use Illuminate\Http\Request;

class ResearchSettingsController extends Controller
{
    public function getAllSettings() {
        $settings = ResearchSettings::all();

        return response()->json($settings);
    }

    public function getModeSetting() {
        $setting = ResearchSettings::where('key_name', 'mode')->first();
        return response()->json([
            'mode' => $setting ? $setting->value : 'per_session',
            'question' => $setting ? $setting->question : '',
            'answers' => $setting ? $setting->answers : [],
        ]);
    }

    public function updateSettings(Request $request)
    {
        // Valideer de basisvelden
        $validated = $request->validate([
            'key_name' => 'required|string|exists:research_settings,key_name',
            'value' => 'required|string',
            'answers' => 'required|array|min:1',
            'answers.*' => 'required|string|max:255',
        ]);

        // Controleer of het "mode" is en voeg dynamische validatie toe
        if ($request->key_name === 'mode' && $request->value === 'per_session') {
            $request->validate([
                'question' => 'required|string|max:255',
                'answers' => 'required|array|min:1',
                'answers.*' => 'required|string|max:255',
            ]);
        }

        // Haal de instelling op
        $setting = ResearchSettings::where('key_name', $validated['key_name'])->first();

        // Als 'mode' per session is, voer dynamische validatie uit en werk bij
        if ($request->key_name === 'mode' && $request->value === 'per_session') {
            $validated = $request->validate([
                'key_name' => 'required|string|exists:research_settings,key_name',
                'value' => 'required|string',
                'question' => 'required|string|max:255',
                'answers' => 'required|array|min:5|max:5',
                'answers.*' => 'required|string|max:255',
            ]);

            // Wijzig de waarden zonder de update functie, en gebruik 'save'
            $setting->value = $validated['value'];
            $setting->question = $validated['question'];
            $setting->answers = json_encode($validated['answers']);
            $setting->save();

        } else {
            // Update de waarde zonder de update functie
            $setting->value = $validated['value'];
            $setting->save();
        }

        return response()->json(['message' => 'Setting updated successfully', 'setting' => $setting], 200);
    }

}
