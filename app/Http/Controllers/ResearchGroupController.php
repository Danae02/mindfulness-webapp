<?php

namespace App\Http\Controllers;

use App\Models\ResearchGroup;
use App\Models\ResearchSettings;
use App\Models\User;
use Illuminate\Http\Request;

class ResearchGroupController extends Controller
{
    /**
     * Haal alle groepen op, inclusief hun leden
     */
    public function index()
    {
        $groups = ResearchGroup::with('users:id,name,email,research_group_id')->get();

        return response()->json($groups);
    }

    /**
     * Maak een nieuwe onderzoeksgroep aan
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'question' => 'nullable|string|max:255',
            'answers'  => 'nullable|array|min:3|max:5',
            'answers.*' => 'required',
            'answers.*.text' => 'required|string|max:255',
            'answers.*.icon' => 'nullable|array',
            'answers.*.icon.src' => 'nullable|string',
            'answers.*.icon.label' => 'nullable|string',
        ], [
            'name.required'        => 'De naam van de groep is verplicht.',
            'name.max'             => 'De naam mag maximaal 255 tekens bevatten.',
            'answers.min'          => 'Er zijn minimaal 3 antwoorden vereist.',
            'answers.max'          => 'Er zijn maximaal 5 antwoorden toegestaan.',
            'answers.*.text.required' => 'Elk antwoord moet een tekst bevatten.',
            'answers.*.text.max'   => 'Een antwoord mag maximaal 255 tekens bevatten.',
        ]);

        $group = ResearchGroup::create([
            'name'     => $validated['name'],
            'question' => $validated['question'] ?? null,
            'answers'  => isset($validated['answers']) ? $validated['answers'] : null,
        ]);

        return response()->json($group->load('users:id,name,email,research_group_id'), 201);
    }

    /**
     * Update een bestaande groep (naam, vraag, antwoorden)
     */
    public function update(Request $request, int $id)
    {
        $group = ResearchGroup::findOrFail($id);

        $validated = $request->validate([
            'name'      => 'sometimes|required|string|max:255',
            'question'  => 'nullable|string|max:255',
            'answers'   => 'nullable|array|min:3|max:5',
            'answers.*' => 'required',
            'answers.*.text' => 'required|string|max:255',
            'answers.*.icon' => 'nullable|array',
            'answers.*.icon.src' => 'nullable|string',
            'answers.*.icon.label' => 'nullable|string',
        ], [
            'name.required'        => 'De naam van de groep is verplicht.',
            'name.max'             => 'De naam mag maximaal 255 tekens bevatten.',
            'answers.min'          => 'Er zijn minimaal 3 antwoorden vereist.',
            'answers.max'          => 'Er zijn maximaal 5 antwoorden toegestaan.',
            'answers.*.text.required' => 'Elk antwoord moet een tekst bevatten.',
            'answers.*.text.max'   => 'Een antwoord mag maximaal 255 tekens bevatten.',
        ]);

        $group->update($validated);

        return response()->json($group->load('users:id,name,email,research_group_id'));
    }

    /**
     * Verwijder een groep — leden worden losgekoppeld (research_group_id → null)
     */
    public function destroy(int $id)
    {
        $group = ResearchGroup::findOrFail($id);

        // Ontkoppel alle leden zodat ze de standaardvraag krijgen
        User::where('research_group_id', $id)->update(['research_group_id' => null]);

        $group->delete();

        return response()->json(['message' => 'Groep verwijderd']);
    }

    /**
     * Voeg een gebruiker toe aan een groep
     */
    public function addUser(Request $request, int $groupId)
    {
        $group = ResearchGroup::findOrFail($groupId);

        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $user->research_group_id = $groupId;
        $user->save();

        return response()->json(['message' => 'Gebruiker toegevoegd aan groep', 'user' => $user]);
    }

    /**
     * Verwijder een gebruiker uit een groep (koppel los)
     */
    public function removeUser(Request $request, int $groupId, int $userId)
    {
        $user = User::where('id', $userId)
            ->where('research_group_id', $groupId)
            ->firstOrFail();

        $user->research_group_id = null;
        $user->save();

        return response()->json(['message' => 'Gebruiker losgekoppeld van groep']);
    }

    /**
     * Haal de actieve vraag op voor de ingelogde gebruiker:
     * groepsvraag als lid van een groep, anders de standaardvraag
     */
    public function getActiveQuestion()
    {
        $user = auth()->user()->load('researchGroup');

        if ($user->researchGroup && $user->researchGroup->question) {
            return response()->json([
                'source'   => 'group',
                'question' => $user->researchGroup->question,
                'answers'  => $user->researchGroup->answers ?? [],
            ]);
        }

// Fallback naar standaardvraag
        $setting = ResearchSettings::where('key_name', 'mode')->first();

        $answers = is_string($setting?->answers)
            ? json_decode($setting->answers, true)
            : ($setting?->answers ?? []);

        return response()->json([
            'source'   => 'default',
            'question' => $setting?->question ?? '',
            'answers'  => $answers ?? [],
        ]);
    }


    /**
     * Haal de standaardvraag op
     */
// ResearchGroupController.php - getDefaultQuestion()
    public function getDefaultQuestion()
    {
        $setting = ResearchSettings::where('key_name', 'mode')->first();

        if (!$setting) {
            return response()->json([
                'question' => '',
                'answers'  => [],
            ]);
        }

        // ← Decode de JSON-string naar een PHP array
        $answers = is_string($setting->answers)
            ? json_decode($setting->answers, true)
            : ($setting->answers ?? []);

        $formattedAnswers = array_map(function($answer) {
            if (is_string($answer)) {
                return ['text' => $answer, 'icon' => null];
            }
            return $answer;
        }, $answers ?? []);

        return response()->json([
            'question' => $setting->question ?? '',
            'answers'  => $formattedAnswers,
        ]);
    }


    /**
     * Sla de standaardvraag op
     */
    public function saveDefaultQuestion(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:255',
            'answers'  => 'required|array|min:3|max:5',
            'answers.*.text' => 'required|string|max:255',  // ← Let op: answers is nu een array van objecten
            'answers.*.icon' => 'nullable|array',
            'answers.*.icon.src' => 'nullable|string',
            'answers.*.icon.label' => 'nullable|string',
        ]);

        $setting = ResearchSettings::firstOrCreate(
            ['key_name' => 'mode'],
            ['value' => 'per_exercise']
        );

        $setting->question = $validated['question'];
        $setting->answers = json_encode($validated['answers']);
        $setting->save();

        return response()->json(['message' => 'Standaardvraag opgeslagen']);
    }
}
