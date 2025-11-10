import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize AudioContext only in browser environment
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Play a notification sound using Web Audio API
   * Creates a pleasant two-tone notification sound
   */
  playNotificationSound(): void {
    if (!this.audioContext) {
      console.warn('AudioContext not available - sound will not play');
      return;
    }

    try {
      // Resume audio context if it's suspended (browsers often suspend it by default)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const currentTime = this.audioContext.currentTime;

      // Create oscillator for the first tone (higher pitch)
      const oscillator1 = this.audioContext.createOscillator();
      const gainNode1 = this.audioContext.createGain();

      oscillator1.connect(gainNode1);
      gainNode1.connect(this.audioContext.destination);

      oscillator1.frequency.value = 800; // 800 Hz
      oscillator1.type = 'sine';

      // Envelope for first tone
      gainNode1.gain.setValueAtTime(0, currentTime);
      gainNode1.gain.linearRampToValueAtTime(0.3, currentTime + 0.01);
      gainNode1.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);

      oscillator1.start(currentTime);
      oscillator1.stop(currentTime + 0.15);

      // Create oscillator for the second tone (lower pitch)
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode2 = this.audioContext.createGain();

      oscillator2.connect(gainNode2);
      gainNode2.connect(this.audioContext.destination);

      oscillator2.frequency.value = 600; // 600 Hz
      oscillator2.type = 'sine';

      // Envelope for second tone (starts after first tone)
      gainNode2.gain.setValueAtTime(0, currentTime + 0.1);
      gainNode2.gain.linearRampToValueAtTime(0.3, currentTime + 0.11);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);

      oscillator2.start(currentTime + 0.1);
      oscillator2.stop(currentTime + 0.3);

    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  /**
   * Alternative: Play notification sound from audio file
   * Useful if you want to use a custom sound file
   * @param audioPath Path to the audio file (e.g., '/sounds/notification.mp3')
   */
  playNotificationFromFile(audioPath: string): void {
    try {
      const audio = new Audio(audioPath);
      audio.volume = 0.5; // Set volume to 50%
      audio.play().catch(error => {
        console.error('Error playing notification audio file:', error);
      });
    } catch (error) {
      console.error('Error creating audio element:', error);
    }
  }

  /**
   * Request notification permission (for future browser notifications)
   * This is optional but useful for desktop notifications
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Show browser notification (requires permission)
   * @param title Notification title
   * @param body Notification body text
   * @param icon Optional icon URL
   */
  showBrowserNotification(title: string, body: string, icon?: string): void {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: icon || '/Pasta & Pastries Icon.png',
        tag: 'pasta-haus-order'
      });

      // Auto-close notification after 5 seconds
      setTimeout(() => notification.close(), 5000);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }
}
