<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\FindUserByEmailService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    public function __construct(private FindUserByEmailService $findUserByEmail) {}

    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = $this->findUserByEmail->find($request->email);

        if (!$user) {
            return back()->withErrors(['email' => 'Er is geen account gevonden met dit e-mailadres.']);
        }

        $token = Password::broker()->createToken($user);
        $user->sendPasswordResetNotification($token);

        return back()->with('status', 'Als dit e-mailadres bij ons bekend is, ontvang je zo een e-mail met een resetlink.');
    }
}
