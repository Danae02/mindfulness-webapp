<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use App\Models\Session;

class TrackSession
{
    public function handle($request, Closure $next)
    {
        if (Auth::check()) {
            $userId = Auth::id();

            // Zoek actieve sessie, start nieuwe als er geen actieve sessie is
            $activeSession = Session::where('user_id', $userId)
                ->whereNull('total_duration')
                ->first();

            if (!$activeSession) {
                Session::create([
                    'user_id' => $userId,
                    'date_time' => now(),
                ]);
            }
        }

        return $next($request);
    }

    public function terminate($request, $response)
    {
        if (Auth::check()) {
            $userId = Auth::id();

            // Zoek de actieve sessie en sluit deze af
            $activeSession = Session::where('user_id', $userId)
                ->whereNull('total_duration')
                ->first();

            if ($activeSession) {
                $start = $activeSession->date_time;
                $end = now();
                $duration = $end->diffInSeconds($start); // Totale duur in seconden

                $activeSession->update([
                    'total_duration' => $duration,
                    'updated_at' => $end,
                ]);
            }
        }
    }
}
