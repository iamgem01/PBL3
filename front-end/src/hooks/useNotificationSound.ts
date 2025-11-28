import { useEffect, useRef, useCallback } from "react";

export const useNotificationSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext
    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  /**
   * Play notification sound using Web Audio API
   * Creates a pleasant notification tone
   */
  const playNotificationSound = useCallback(() => {
    if (!audioContextRef.current) return;

    const context = audioContextRef.current;
    const now = context.currentTime;

    // Create oscillators for a pleasant two-tone notification
    const oscillator1 = context.createOscillator();
    const oscillator2 = context.createOscillator();
    const gainNode = context.createGain();

    // First tone: 800Hz
    oscillator1.type = "sine";
    oscillator1.frequency.setValueAtTime(800, now);

    // Second tone: 1000Hz (harmonious interval)
    oscillator2.type = "sine";
    oscillator2.frequency.setValueAtTime(1000, now);

    // Connect oscillators to gain node
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(context.destination);

    // Envelope for smooth sound
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    // Play tones
    oscillator1.start(now);
    oscillator1.stop(now + 0.4);

    oscillator2.start(now + 0.1);
    oscillator2.stop(now + 0.5);
  }, []);

  /**
   * Play urgent notification sound (for high priority)
   */
  const playUrgentSound = useCallback(() => {
    if (!audioContextRef.current) return;

    const context = audioContextRef.current;
    const now = context.currentTime;

    // Create three beeps for urgent notification
    for (let i = 0; i < 3; i++) {
      const startTime = now + i * 0.25;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(900, startTime);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    }
  }, []);

  return {
    playNotificationSound,
    playUrgentSound,
  };
};
