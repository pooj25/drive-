<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GalleryApiTest extends TestCase
{
    public function test_can_fetch_plans(): void
    {
        $response = $this->getJson('/api/subscriptions/plans');

        $response->assertStatus(200)
                 ->assertJsonStructure(['plans']);
    }

    public function test_user_can_login_with_demo_credentials(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'demo@gallery.local',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'token',
                     'user' => ['id', 'name', 'email', 'plan', 'storage']
                 ]);
    }

    public function test_google_auth_endpoint(): void
    {
        $response = $this->postJson('/api/auth/google', [
            'email' => 'alex.google@gmail.com',
            'name' => 'Alex Google',
            'google_id' => '1234567890123456789',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'token',
                     'user' => ['id', 'email', 'google_id']
                 ]);
    }
}
