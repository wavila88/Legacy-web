'use client';

import { useState, useRef } from 'react';

export function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [recSeconds, setRecSeconds] = useState(0);
  const mediaRecRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecRef.current = mr;
      setRecording(true);
      setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } catch {
      throw new Error('mic_permission_denied');
    }
  };

  const stop = () => {
    clearInterval(timerRef.current);
    setRecording(false);
    mediaRecRef.current?.stop();
    mediaRecRef.current = null;
  };

  const clear = () => {
    setAudioBlob(null);
    setAudioURL(null);
    setRecSeconds(0);
  };

  const reset = () => {
    clear();
    setRecording(false);
    clearInterval(timerRef.current);
    if (mediaRecRef.current) {
      try { mediaRecRef.current.stop(); } catch (_) {}
      mediaRecRef.current = null;
    }
  };

  return { recording, audioBlob, audioURL, recSeconds, start, stop, clear, reset };
}
