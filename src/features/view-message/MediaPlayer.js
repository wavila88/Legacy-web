'use client';

import { useRef, useState, useEffect, useMemo } from 'react';

const BAR_COUNT = 40;

function seedBars(seed) {
  const bars = [];
  let n = seed;
  for (let i = 0; i < BAR_COUNT; i++) {
    n = (n * 1664525 + 1013904223) & 0xffffffff;
    bars.push(0.25 + ((n >>> 0) / 0xffffffff) * 0.75);
  }
  return bars;
}

export default function MediaPlayer({ url, isVideo }) {
  const ref      = useRef(null);
  const [playing,  setPlaying]  = useState(false);
  const [current,  setCurrent]  = useState(0);
  const [duration, setDuration] = useState(0);

  const bars = useMemo(() => seedBars(url?.length ?? 42), [url]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onTime = () => setCurrent(el.currentTime);
    const onMeta = () => setDuration(el.duration);
    const onEnd  = () => setPlaying(false);
    el.addEventListener('timeupdate',  onTime);
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('ended',       onEnd);
    return () => {
      el.removeEventListener('timeupdate',  onTime);
      el.removeEventListener('loadedmetadata', onMeta);
      el.removeEventListener('ended',       onEnd);
    };
  }, []);

  const togglePlay = () => {
    const el = ref.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else         { el.play(); setPlaying(true); }
  };

  const seek = (e) => {
    const el = ref.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    el.currentTime = ratio * duration;
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = String(Math.floor(s % 60)).padStart(2, '0');
    return `${m}:${sec}`;
  };

  const progress = duration > 0 ? current / duration : 0;

  if (isVideo) {
    return (
      <video
        ref={ref}
        controls
        playsInline
        style={{ width: '100%', borderRadius: 12, backgroundColor: '#000', maxHeight: 340 }}
        src={url}
      />
    );
  }

  return (
    <div style={s.wrap}>
      <audio ref={ref} src={url} preload="metadata" />

      {/* Play / Pause button */}
      <button style={s.playBtn} onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
        {playing
          ? <div style={s.pauseIcon}><div style={s.pauseBar} /><div style={s.pauseBar} /></div>
          : <span style={s.playIcon} />}
      </button>

      {/* Waveform + time */}
      <div style={s.right}>
        <div style={s.waveWrap} onClick={seek} role="slider" aria-valuenow={progress}>
          {bars.map((h, i) => {
            const barProgress = i / BAR_COUNT;
            const active = barProgress <= progress;
            return (
              <div
                key={i}
                style={{
                  ...s.bar,
                  height: `${h * 100}%`,
                  backgroundColor: active ? '#7C3AED' : '#DDD6FE',
                }}
              />
            );
          })}
        </div>
        <div style={s.timeRow}>
          <span style={s.time}>{fmt(current)}</span>
          <span style={s.time}>{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}

const s = {
  wrap:     { display: 'flex', alignItems: 'center', gap: 14, padding: '10px 4px' },
  playBtn:  {
    width: 52, height: 52, borderRadius: '50%',
    backgroundColor: '#7C3AED', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, boxShadow: '0 4px 14px rgba(124,58,237,0.4)',
  },
  playIcon: {
    display: 'inline-block',
    width: 0, height: 0,
    borderStyle: 'solid',
    borderWidth: '8px 0 8px 16px',
    borderColor: 'transparent transparent transparent #FFFFFF',
    marginLeft: 3,
  },
  pauseIcon: { display: 'inline-flex', gap: 4, alignItems: 'center' },
  pauseBar:  { width: 4, height: 18, backgroundColor: '#FFFFFF', borderRadius: 2 },
  right:    { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  waveWrap: {
    display: 'flex', alignItems: 'center', gap: 2,
    height: 44, cursor: 'pointer', userSelect: 'none',
  },
  bar:      { flex: 1, borderRadius: 3, minHeight: 4, transition: 'background-color 0.1s' },
  timeRow:  { display: 'flex', justifyContent: 'space-between' },
  time:     { fontSize: 11, color: '#9CA3AF', fontVariantNumeric: 'tabular-nums' },
};
