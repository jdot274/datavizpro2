import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  errorCount: number;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  
  // Error handling
  reportError: (message: string) => void;
  resetErrorCount: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: true, // Start muted by default
  errorCount: 0,
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    // Just update the muted state
    set({ isMuted: newMutedState });
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted, errorCount } = get();
    
    // If we've had too many errors, don't attempt to play sounds
    if (errorCount > 5) return;
    
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      try {
        // Clone the sound to allow overlapping playback
        const soundClone = hitSound.cloneNode() as HTMLAudioElement;
        soundClone.volume = 0.3;
        soundClone.play().catch(error => {
          console.log("Hit sound play prevented:", error);
        });
      } catch (error) {
        // Ignore errors silently to prevent console spam
      }
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted, errorCount } = get();
    
    // If we've had too many errors, don't attempt to play sounds
    if (errorCount > 5) return;
    
    if (successSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }
      
      try {
        successSound.currentTime = 0;
        successSound.play().catch(error => {
          console.log("Success sound play prevented:", error);
        });
      } catch (error) {
        // Ignore errors silently to prevent console spam
      }
    }
  },
  
  reportError: (message: string) => {
    const { errorCount } = get();
    set({ errorCount: errorCount + 1 });
    
    // Only log the first few errors to avoid spamming the console
    if (errorCount < 5) {
      console.error(`Audio error: ${message}`);
    }
  },
  
  resetErrorCount: () => set({ errorCount: 0 })
}));
