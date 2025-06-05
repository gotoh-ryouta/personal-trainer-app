import { useCallback } from 'react';

export const useSound = () => {
  const playSound = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration / 1000);
  }, []);

  const playSuccess = useCallback(() => {
    // 成功音：ド→ミ→ソの和音
    playSound(523.25, 100); // C5
    setTimeout(() => playSound(659.25, 100), 50); // E5
    setTimeout(() => playSound(783.99, 200), 100); // G5
  }, [playSound]);

  const playLevelUp = useCallback(() => {
    // レベルアップ音：上昇するアルペジオ
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4 to G5
    notes.forEach((freq, index) => {
      setTimeout(() => playSound(freq, 100, 'square'), index * 50);
    });
  }, [playSound]);

  const playClick = useCallback(() => {
    // クリック音
    playSound(1000, 30, 'square');
  }, [playSound]);

  const playError = useCallback(() => {
    // エラー音
    playSound(200, 200, 'sawtooth');
  }, [playSound]);

  return {
    playSuccess,
    playLevelUp,
    playClick,
    playError
  };
};