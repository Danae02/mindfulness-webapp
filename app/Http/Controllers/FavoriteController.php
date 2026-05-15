<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    /**
     * Haal alle favorieten van de ingelogde gebruiker op
     */
    public function index()
    {
        $favorites = Auth::user()->favoriteExercises()->get();

        $favorites = $favorites->map(function($exercise) {
            $exercise->duration = $exercise->duration_minutes;
            return $exercise;
        });

        return response()->json($favorites);
    }

    /**
     * Haal favorieten op van een specifieke gebruiker (voor supervisors)
     */
    public function getUserFavorites($userId)
    {
        $user = \App\Models\User::findOrFail($userId);

        // Check: supervisors/admins mogen favorieten zien
        $currentUser = Auth::user();
        if (!in_array($currentUser->role_id, [1, 3, 4])) {
            // Alleen clients mogen hun eigen favorieten zien
            if ($currentUser->id !== $userId) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        }

        $favorites = $user->favoriteExercises()->get()->map(function($exercise) {
            $exercise->duration = $exercise->duration_minutes;
            return $exercise;
        });

        return response()->json($favorites);
    }

    /**
     * Toggle favoriet (aan/uit)
     */
    public function toggle(Request $request)
    {
        $request->validate([
            'exercise_id' => 'required|exists:exercises,id',
            'for_user_id' => 'nullable|exists:users,id'
        ]);

        // Bepaal voor welke gebruiker we de favoriet togglen
        $targetUserId = $request->for_user_id ?? Auth::id();
        $currentUser = Auth::user();

        // Autorisatie check
        if ($targetUserId !== $currentUser->id) {
            // Als we namens iemand anders handelen
            // Clients kunnen niet voor anderen handelen
            if ($currentUser->role_id === 2) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            // Admins (1) en supervisors (3, 4) kunnen voor IEDEREEN favorieten toevoegen
            if (!in_array($currentUser->role_id, [1, 3, 4])) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
        }

        $exerciseId = $request->exercise_id;

        $targetUser = \App\Models\User::find($targetUserId);

        // Check of favoriet al bestaat
        $isFavorite = $targetUser->favoriteExercises()
            ->where('exercise_id', $exerciseId)
            ->exists();

        if ($isFavorite) {
            // Verwijder favoriet
            $targetUser->favoriteExercises()->detach($exerciseId);
            $isFavorite = false;
        } else {
            // Voeg favoriet toe
            $targetUser->favoriteExercises()->attach($exerciseId);
            $isFavorite = true;
        }

        return response()->json([
            'is_favorite' => $isFavorite,
            'message' => $isFavorite ? 'Toegevoegd aan favorieten' : 'Verwijderd uit favorieten'
        ]);
    }
}
