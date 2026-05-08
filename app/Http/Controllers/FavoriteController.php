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

        // Voeg de duration (in minuten) toe aan elke oefening
        $favorites = $favorites->map(function($exercise) {
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
            'exercise_id' => 'required|exists:exercises,id'
        ]);

        $userId = Auth::id();
        $exerciseId = $request->exercise_id;

        $favorite = Favorite::where('user_id', $userId)
            ->where('exercise_id', $exerciseId)
            ->first();

        if ($favorite) {
            $favorite->delete();
            $isFavorite = false;
        } else {
            Favorite::create([
                'user_id' => $userId,
                'exercise_id' => $exerciseId
            ]);
            $isFavorite = true;
        }

        return response()->json([
            'is_favorite' => $isFavorite,
            'message' => $isFavorite ? 'Toegevoegd aan favorieten' : 'Verwijderd uit favorieten'
        ]);
    }
}
