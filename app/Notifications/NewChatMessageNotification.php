<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;

class NewChatMessageNotification extends Notification
{
    use Queueable, SerializesModels;

    protected string $senderName;

    protected string $messagePreview;

    protected string $url;

    public function __construct(string $senderName, string $messagePreview, string $url)
    {
        $this->senderName = $senderName;
        $this->messagePreview = $messagePreview;
        $this->url = $url;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(?User $notifiable = null): array
    {
        // Kung sakaling null, mag-fallback tayo sa isang safe na channel id
        $userId = $notifiable ? $notifiable->id : 'unknown';

        return [
            new PrivateChannel('App.Models.User.'.$userId),
        ];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'sender_name' => $this->senderName,
            'message_preview' => $this->messagePreview,
            'url' => $this->url,
            'created_at' => now(),
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'sender_name' => $this->senderName,
            'message_preview' => $this->messagePreview,
            'url' => $this->url,
        ]);
    }
}
