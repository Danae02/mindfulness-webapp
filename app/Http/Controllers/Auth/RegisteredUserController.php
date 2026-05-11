<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Validation\ValidationException;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\EmailEncryptionService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller

{public function __construct(private EmailEncryptionService $emailEncryption){}

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
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|lowercase|email|max:255',
            'password' => ['required', 'confirmed',
                \Illuminate\Validation\Rules\Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ],
        ], [
            // Nederlandse berichten
            'name.required'          => 'Naam is verplicht.',
            'email.required'         => 'E-mailadres is verplicht.',
            'email.email'            => 'Voer een geldig e-mailadres in.',
            'password.min'           => 'Wachtwoord moet minimaal 8 tekens bevatten.',
            'password.mixed'         => 'Wachtwoord moet minimaal 1 hoofdletter en 1 kleine letter bevatten.',
            'password.numbers'       => 'Wachtwoord moet minimaal 1 cijfer bevatten.',
            'password.symbols'       => 'Wachtwoord moet minimaal 1 speciaal teken bevatten (bijv. !@#$%).',
            'password.confirmed'     => 'De wachtwoorden komen niet overeen.',
        ]);

        // Unieke check via blind index
        $emailIndex = $this->emailEncryption->blindIndex($request->email);
        if (User::where('email_index', $emailIndex)->exists()) {
            throw ValidationException::withMessages([
                'email' => 'Dit e-mailadres is al in gebruik.',
            ]);
        }

        $user = User::create([
            'name'        => $request->name,
            'email'       => $request->email,
            'email_index' => $emailIndex,
            'password'    => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }

    public function RegisterBySupervisor(Request $request): RedirectResponse
    {
        try {
            // Controleer of de aanroepende gebruiker de juiste rol heeft
            if (Auth::user()->role_id !== 3) {
                return redirect()->back()->withErrors([
                    'error' => 'Unauthorized: Alleen supervisors kunnen gebruikers aanmaken.'
                ]);
            }

            // Validatie van de input
            $request->validate([
                'name' => 'required|string|max:255|unique:users,name',
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);

            $team_id = Auth::user()->team_id;
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

            // Redirect terug met succesmelding
            return redirect()->back()->with('success', 'Gebruiker succesvol aangemaakt.');
        } catch (\Exception $e) {
            // Fout afhandelen en foutmelding retourneren
            return redirect()->back()->withErrors([
                'error' => 'Er is een fout opgetreden bij het aanmaken van de gebruiker.',
            ]);
        }
    }

}
