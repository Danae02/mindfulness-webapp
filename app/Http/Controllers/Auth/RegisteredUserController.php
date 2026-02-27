<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }

    public function RegisterBySupervisor(Request $request): JsonResponse
    {
        try {
            // Controleer of de aanroepende gebruiker de juiste rol heeft
            if (Auth::user()->role_id !== 3) {

                return response()->json([
                    'error' => 'Unauthorized: Alleen supervisors kunnen gebruikers aanmaken.'
                ], 403);
            }

            // Validatie van de input
            $request->validate([
                'name' => 'required|string|max:255|unique:users,name',
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);

            $team_id = Auth::user()->team_id;

//            dd($team_id);

            $email = $request->email ?? 'no-email@example.com'; // Voeg een placeholder toe

            // Gebruiker aanmaken
            $user = User::create([
                'name' => $request->name,
                'email' => $email,
                'password' => Hash::make($request->password),
                'team_id' => $team_id
            ]);

            // Event triggeren
            event(new Registered($user));

            // Succesvolle JSON-response
            return response()->json([
                'message' => 'Gebruiker succesvol aangemaakt.',
                'user' => $user,
            ], 201);
        } catch (\Exception $e) {
            // Fout afhandelen en foutmelding retourneren
            return response()->json([
                'error' => 'Er is een fout opgetreden bij het aanmaken van de gebruiker.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

}
