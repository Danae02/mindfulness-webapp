<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserExerciseLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class   UserController extends Controller
{
    public function index()
    {

        $role = Auth::user()->role_id;

        if ($role == 1) {
            $users = User::all();
            return response()->json($users);
        } else {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id); // Haal de gebruiker op of geef een 404-error.

        // Validatie van de input
        $validatedData = $request->validate([
            'role_id' => 'nullable|integer|exists:roles,id', // Controleer of de rol bestaat
            'is_reviewed' => 'nullable|boolean', // Boolean validatie voor "is_reviewed"
            'name' => 'nullable|string|max:255', // Optioneel: Naam kan worden bijgewerkt
            'email' => 'nullable|email|unique:users,email,' . $id, // Controleer unieke e-mail, behalve voor de huidige gebruiker
        ]);

        // Alleen de verzonden velden bijwerken
        $user->fill($validatedData);
        $user->save();

        return response()->json([
            'message' => 'User updated successfully!',
            'user' => $user,
        ], 200);
    }


    public function markAsReviewed($id)
    {
        $user = User::findOrFail($id);

        // Markeer de gebruiker als beoordeeld
        $user->is_reviewed = true;
        $user->save();

        return redirect()->route('users.index')->with('success', 'De gebruiker is beoordeeld.');
    }

    public function getAllUnreviewedUsers() {
        $unreviewedusers = User::where('is_reviewed', false)->get();

        return response()->json($unreviewedusers);
    }

    public function getTeamUsers() {
        $role = Auth::user()->role_id;

        $teamId = Auth::user()->team_id;

        if ($role == 1 || $role == 3 || $role == 4) {
            $users = User::where('team_id', $teamId)
                ->where('role_id', 2)
                ->get();

            return response()->json($users);
        } else {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
    }

    public function getTeamUserLogs()
    {
        $user = Auth::user(); // Ingelogde supervisor
        $teamId = $user->team_id;

        if (!$teamId) {
            return response()->json(['error' => 'Team ID not found for user.'], 404);
        }

        // Haal alle logs van gebruikers binnen hetzelfde team
        $logs = UserExerciseLog::with('user', 'exercise')
            ->whereHas('user', function ($query) use ($teamId) {
                $query->where('team_id', $teamId);
            })
            ->get();

        return response()->json($logs);
    }
}
