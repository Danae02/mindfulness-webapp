<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\EmailEncryptionService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    public function __construct(private EmailEncryptionService $emailEncryption) {}

    /**
     * Display the password reset view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]);
    }

    /**
     * Handle an incoming new password request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token'    => 'required',
            'email'    => 'required|email',
            'password' => [
                'required',
                'confirmed',
                \Illuminate\Validation\Rules\Password::min(8)
                    ->mixedCase()->numbers()->symbols(),
            ],
        ], [
            'password.min'       => 'Wachtwoord moet minimaal 8 tekens bevatten.',
            'password.mixed'     => 'Wachtwoord moet minimaal 1 hoofdletter en 1 kleine letter bevatten.',
            'password.numbers'   => 'Wachtwoord moet minimaal 1 cijfer bevatten.',
            'password.symbols'   => 'Wachtwoord moet minimaal 1 speciaal teken bevatten (bijv. !@#$%).',
            'password.confirmed' => 'De wachtwoorden komen niet overeen.',
        ]);

        // Zoek gebruiker op via email_index (encrypted email omzeilen)
        $emailIndex = $this->emailEncryption->blindIndex($request->email);
        $user = User::where('email_index', $emailIndex)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Er is geen account gevonden met dit e-mailadres.'],
            ]);
        }

        // Valideer het reset-token handmatig
        if (!Password::broker()->tokenExists($user, $request->token)) {
            throw ValidationException::withMessages([
                'email' => ['Deze resetlink is ongeldig of verlopen. Vraag een nieuwe aan via "Wachtwoord vergeten".'],
            ]);
        }

        // Wachtwoord opslaan en token verwijderen
        $user->forceFill([
            'password' => Hash::make($request->password),
        ])->save();

        Password::broker()->deleteToken($user);

        event(new PasswordReset($user));

        return redirect()->route('login')->with('status', 'Je wachtwoord is succesvol gewijzigd. Je kunt nu weer inloggen!');
    }
}
