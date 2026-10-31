import { Audio, AVPlaybackStatus } from 'expo-av';
import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';

type AudioContextValue = {
  isPlaying: boolean;
  currentUrl?: string;
  progress: number;
  duration: number;
  position: number;
  playUrl: (url: string, onFinish?: () => void) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
};

const AudioContext = createContext<AudioContextValue | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const finishCallbackRef = useRef<(() => void) | undefined>(undefined);
  const [currentUrl, setCurrentUrl] = useState<string | undefined>();
  const [isPlaying, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setPlaying(status.isPlaying);
    setPosition(status.positionMillis ?? 0);
    setDuration(status.durationMillis || 1);

    if (status.didJustFinish) {
      const callback = finishCallbackRef.current;
      finishCallbackRef.current = undefined;
      callback?.();
    }
  };

  const unloadCurrent = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  }, []);

  const playUrl = useCallback(async (url: string, onFinish?: () => void) => {
    finishCallbackRef.current = onFinish;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    if (currentUrl === url && soundRef.current) {
      await soundRef.current.playAsync();
      return;
    }

    await unloadCurrent();
    const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true }, onPlaybackStatusUpdate);
    soundRef.current = sound;
    setCurrentUrl(url);
  }, [currentUrl, unloadCurrent]);

  const pause = useCallback(async () => {
    await soundRef.current?.pauseAsync();
  }, []);

  const resume = useCallback(async () => {
    await soundRef.current?.playAsync();
  }, []);

  const stop = useCallback(async () => {
    finishCallbackRef.current = undefined;
    await unloadCurrent();
    setPlaying(false);
    setCurrentUrl(undefined);
    setPosition(0);
  }, [unloadCurrent]);

  const value = useMemo(
    () => ({
      currentUrl,
      isPlaying,
      position,
      duration,
      progress: Math.min(position / duration, 1),
      playUrl,
      pause,
      resume,
      stop,
    }),
    [currentUrl, isPlaying, position, duration, playUrl, pause, resume, stop],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudioPlayer() {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudioPlayer must be used inside AudioProvider');
  return context;
}
