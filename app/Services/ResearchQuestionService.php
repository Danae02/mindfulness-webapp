<?php

namespace App\Services;

use App\Models\ResearchGroup;
use App\Models\ResearchSettings;
use App\Models\User;

class ResearchQuestionService
{

    public function getActiveQuestion(User $user): array
    {
        $user->load('researchGroup');

        if ($user->researchGroup && $user->researchGroup->question) {
            return [
                'source'   => 'group',
                'question' => $user->researchGroup->question,
                'answers'  => $user->researchGroup->answers ?? [],
            ];
        }

        return $this->getDefaultQuestion();
    }

    public function getDefaultQuestion(): array
    {
        $setting = ResearchSettings::where('key_name', 'mode')->first();

        if (!$setting) {
            return [
                'source'   => 'default',
                'question' => '',
                'answers'  => [],
            ];
        }

        $answers = $this->decodeAnswers($setting->answers);

        return [
            'source'   => 'default',
            'question' => $setting->question ?? '',
            'answers'  => $this->formatAnswers($answers),
        ];
    }


    public function saveDefaultQuestion(string $question, array $answers): void
    {
        $setting = ResearchSettings::firstOrCreate(
            ['key_name' => 'mode'],
            ['value' => 'per_exercise']
        );

        $setting->update([
            'question' => $question,
            'answers'  => json_encode($answers),
        ]);
    }


    public function getAllGroups()
    {
        return ResearchGroup::with('users:id,name,email,research_group_id')->get();
    }


    public function createGroup(string $name, ?string $question = null, ?array $answers = null): ResearchGroup
    {
        return ResearchGroup::create([
            'name'     => $name,
            'question' => $question,
            'answers'  => $answers ? json_encode($answers) : null,
        ]);
    }


    public function updateGroup(int $groupId, array $data): ResearchGroup
    {
        $group = ResearchGroup::findOrFail($groupId);

        if (isset($data['answers'])) {
            $data['answers'] = json_encode($data['answers']);
        }

        $group->update($data);
        return $group->load('users:id,name,email,research_group_id');
    }


    public function deleteGroup(int $groupId): void
    {
        // Ontkoppel alle leden
        User::where('research_group_id', $groupId)->update(['research_group_id' => null]);

        // Verwijder groep
        ResearchGroup::findOrFail($groupId)->delete();
    }


    public function addUserToGroup(int $groupId, int $userId): User
    {
        $user = User::findOrFail($userId);
        $user->update(['research_group_id' => $groupId]);
        return $user;
    }


    public function removeUserFromGroup(int $groupId, int $userId): void
    {
        $user = User::where('id', $userId)
            ->where('research_group_id', $groupId)
            ->firstOrFail();

        $user->update(['research_group_id' => null]);
    }



    //Decode answers van JSON-string naar PHP array.
    private function decodeAnswers($answers): array
    {
        if (is_string($answers)) {
            return json_decode($answers, true) ?? [];
        }

        return is_array($answers) ? $answers : [];
    }

    //Format answers array zodat elk item text en icon heeft.
    private function formatAnswers(array $answers): array
    {
        return array_map(function ($answer) {
            if (is_string($answer)) {
                return ['text' => $answer, 'icon' => null];
            }

            return $answer;
        }, $answers);
    }
}
