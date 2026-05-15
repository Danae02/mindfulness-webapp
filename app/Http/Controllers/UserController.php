<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserExerciseLog;
use App\Services\EmailEncryptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
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
        $user = User::findOrFail($id);

        $validatedData = $request->validate([
            'role_id' => 'nullable|integer|exists:roles,id', // Controleer of de rol bestaat
            'is_reviewed' => 'nullable|boolean', // Boolean validatie voor "is_reviewed"
            'name' => 'nullable|string|max:255', // Optioneel: Naam kan worden bijgewerkt
            'email' => 'nullable|email', // Controleer unieke e-mail, behalve voor de huidige gebruiker
        ]);

        // Uniek check email via blind index
        if ($request->filled('email')) {
            $svc = app(EmailEncryptionService::class);
            $emailIndex = $svc->blindIndex($request->email);

            if (User::where('email_index', $emailIndex)->where('id', '!=', $id)->exists()) {
                return response()->json(['error' => 'E-mailadres is al in gebruik.'], 422);
            }
        }

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
        $user->is_reviewed = true;
        $user->save();

        return redirect()->route('users.index')->with('success', 'De gebruiker is beoordeeld.');
    }

    public function getAllUnreviewedUsers()
    {
        $unreviewedusers = User::where('is_reviewed', false)->get();
        return response()->json($unreviewedusers);
    }


    public function getTeamUsers()
    {
        $role = Auth::user()->role_id;

        if (!in_array($role, [1, 3, 4])) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $users = User::where('role_id', 2)->get();

        return response()->json($users);
    }


    public function getTeamUserLogs(Request $request)
    {
        $user = Auth::user();

        // Check rechten - alleen supervisors/admins
        if (!in_array($user->role_id, [1, 3, 4])) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Haal ALLE logs op (geen team filter)
        $query = UserExerciseLog::with('user', 'exercise');

        // Filter op specifieke gebruiker indien gewenst
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter op datum range indien gewenst
        if ($request->filled('date_from')) {
            $query->whereDate('date_time', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('date_time', '<=', $request->date_to);
        }

        $logs = $query->orderBy('date_time', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json($logs);
    }

    //Haal logs op van een specifieke gebruiker (voor supervisors om voortgang te zien)
    public function getUserLogs($userId, Request $request)
    {
        $supervisor = Auth::user();

        if (!in_array($supervisor->role_id, [1, 3, 4])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $targetUser = User::findOrFail($userId);

        $query = UserExerciseLog::with('exercise')
            ->where('user_id', $userId);

        if ($request->filled('date_from')) {
            $query->whereDate('date_time', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('date_time', '<=', $request->date_to);
        }

        $logs = $query->orderBy('date_time', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json($logs);
    }
}
