<?php

namespace App\Http\Controllers;

use App\Services\ResearchQuestionService;
use Illuminate\Http\Request;

class ResearchGroupController extends Controller
{
    private ResearchQuestionService $researchService;

    public function __construct(ResearchQuestionService $researchService)
    {
        $this->researchService = $researchService;
    }

    public function index()
    {
        $groups = $this->researchService->getAllGroups();
        return response()->json($groups);
    }

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

        $group = $this->researchService->createGroup(
            $validated['name'],
            $validated['question'] ?? null,
            $validated['answers'] ?? null
        );

        return response()->json($group->load('users:id,name,email,research_group_id'), 201);
    }


    public function update(Request $request, int $id)
    {
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

        $group = $this->researchService->updateGroup($id, $validated);

        return response()->json($group);
    }


    public function destroy(int $id)
    {
        $this->researchService->deleteGroup($id);
        return response()->json(['message' => 'Groep verwijderd']);
    }

    public function addUser(Request $request, int $groupId)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $user = $this->researchService->addUserToGroup($groupId, $validated['user_id']);

        return response()->json(['message' => 'Gebruiker toegevoegd aan groep', 'user' => $user]);
    }


    public function removeUser(int $groupId, int $userId)
    {
        $this->researchService->removeUserFromGroup($groupId, $userId);
        return response()->json(['message' => 'Gebruiker losgekoppeld van groep']);
    }


    public function getActiveQuestion()
    {
        $user = auth()->user();
        $question = $this->researchService->getActiveQuestion($user);
        return response()->json($question);
    }


    public function getDefaultQuestion()
    {
        $question = $this->researchService->getDefaultQuestion();
        return response()->json($question);
    }


    public function saveDefaultQuestion(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:255',
            'answers'  => 'required|array|min:3|max:5',
            'answers.*.text' => 'required|string|max:255',
            'answers.*.icon' => 'nullable|array',
            'answers.*.icon.src' => 'nullable|string',
            'answers.*.icon.label' => 'nullable|string',
        ]);

        $this->researchService->saveDefaultQuestion(
            $validated['question'],
            $validated['answers']
        );

        return response()->json(['message' => 'Standaardvraag opgeslagen']);
    }
}
