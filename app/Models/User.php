<?php

namespace App\Models;

use App\Services\EmailEncryptionService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'email_index',
        'password',
        'role_id',
        'is_reviewed',
        'research_group_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'email_index'
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_reviewed' => 'boolean',
        ];
    }

    // automatisch encrypten bij opslaan
    public function setEmailAttribute(string $email): void
    {
        $svc = app(EmailEncryptionService::class);
        $this->attributes['email'] = $svc->encrypt($email);
        $this->attributes['email_index'] = $svc->blindIndex($email);
    }

    // Automatisch decrypten bij ophalen
    public function getEmailAttribute(string $value): string
    {
        return app(EmailEncryptionService::class)->decrypt($value);
    }


//    public function sendPasswordResetNotification($token)
//    {
//        $this->notify(new ResetPassword($token));
//    }
//
//    public function sendEmailVerificationNotification()
//    {
//        $this->notify(new VerifyEmail);
//    }


    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    protected static function booted()
    {
        static::creating(function ($user) {
            // Als role_id niet is ingesteld, standaard instellen op 'viewer' (role_id = 2)
            if (is_null($user->role_id)) {
                $user->role_id = 2; // Default to 'viewer' aka client
            }
        });
    }

    public function sessions()
    {
        return $this->hasMany(Session::class);
    }


    /**
     * Haal alle favorieten van de gebruiker op (via de favorites tabel)
     */
    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    /**
     * Haal alle oefeningen die de gebruiker als favoriet heeft gemarkeerd
     * Dit is een many-to-many relatie via de favorites tabel
     */
    public function favoriteExercises()
    {
        return $this->belongsToMany(Exercise::class, 'favorites');
    }

    /**
     * De onderzoeksgroep van deze gebruiker (nullable)
     */
    public function researchGroup()
    {
        return $this->belongsTo(ResearchGroup::class, 'research_group_id');
    }

}
//
//
//namespace App\Models;
//
//use App\Services\EmailEncryptionService;
//use Illuminate\Database\Eloquent\Factories\HasFactory;
//use Illuminate\Foundation\Auth\User as Authenticatable;
//use Illuminate\Notifications\Notifiable;
//
//class User extends Authenticatable
//{
//    /** @use HasFactory<\Database\Factories\UserFactory> */
//    use HasFactory, Notifiable;
//
//    /**
//     * The attributes that are mass assignable.
//     *
//     * @var array<int, string>
//     */
//    protected $fillable = [
//        'name',
//        'email',
//        'email_index',
//        'password',
//        'role_id',
//        'is_reviewed',
//        'research_group_id',
//    ];
//
//    /**
//     * The attributes that should be hidden for serialization.
//     *
//     * @var array<int, string>
//     */
//    protected $hidden = [
//        'password',
//        'remember_token',
//        'email_index'
//    ];
//
//    /**
//     * Get the attributes that should be cast.
//     *
//     * @return array<string, string>
//     */
//    protected function casts(): array
//    {
//        return [
//            'email_verified_at' => 'datetime',
//            'password' => 'hashed',
//            'is_reviewed' => 'boolean',
//        ];
//    }
//
//    /**
//     * Automatically encrypt email when setting.
//     */
//    public function setEmailAttribute(string $email): void
//    {
//        $svc = app(EmailEncryptionService::class);
//        $this->attributes['email'] = $svc->encrypt($email);
//        $this->attributes['email_index'] = $svc->blindIndex($email);
//    }
//
//    /**
//     * Automatically decrypt email when retrieving.
//     */
//    public function getEmailAttribute(string $value): string
//    {
//        return app(EmailEncryptionService::class)->decrypt($value);
//    }
//
//    /**
//     * Set default role to 'viewer' (role_id = 2) on creation.
//     */
//    protected static function booted()
//    {
//        static::creating(function ($user) {
//            if (is_null($user->role_id)) {
//                $user->role_id = 2; // Default to 'viewer'
//            }
//        });
//    }
//
//    /**
//     * Get the role associated with this user.
//     */
//    public function role()
//    {
//        return $this->belongsTo(Role::class);
//    }
//
//    /**
//     * Get all sessions for this user.
//     */
//    public function sessions()
//    {
//        return $this->hasMany(Session::class);
//    }
//
//    /**
//     * Get all exercise logs for this user.
//     */
//    public function logs()
//    {
//        return $this->hasMany(UserExerciseLog::class);
//    }
//
//    /**
//     * Get all favorites for this user.
//     */
//    public function favorites()
//    {
//        return $this->hasMany(Favorite::class);
//    }
//
//    /**
//     * Get all exercises marked as favorite by this user.
//     * Many-to-many relation via favorites table.
//     */
//    public function favoriteExercises()
//    {
//        return $this->belongsToMany(Exercise::class, 'favorites');
//    }
//
//    /**
//     * Get the research group this user belongs to (nullable).
//     */
//    public function researchGroup()
//    {
//        return $this->belongsTo(ResearchGroup::class, 'research_group_id');
//    }
//}
