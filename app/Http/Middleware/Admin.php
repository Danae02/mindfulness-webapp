<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// controleert of de ingelogde gebruiker een admin is (role_id = 1) voor backup-routes
class Admin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check() || auth()->user()->role_id !== 1) {
            abort(403, 'Geen toegang.');
        }

        return $next($request);
    }
}
