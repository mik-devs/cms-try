<?php

use App\Http\Controllers\Api\ChatbotController;
use Illuminate\Support\Facades\Route;

Route::post('/chat', [ChatbotController::class, 'chat'])
    ->name('api.chat')
    ->middleware('throttle:chatbot');
