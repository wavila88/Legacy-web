'use client';

import { useTranslations } from 'next-intl';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { formatTime } from '../utils/dateUtils';
import MediaPlayer from '../../view-message/MediaPlayer';

const WAVE_HEIGHTS = [6, 14, 20, 12, 18, 24, 10, 16, 22, 8, 20, 14, 18, 24, 10, 16, 12, 22, 8, 16];

function WaveBars({ color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, gap: 3 }}>
      {WAVE_HEIGHTS.map((h, i) => (
        <div key={i} style={{ width: '100%', maxWidth: 4, height: h, borderRadius: 2, backgroundColor: color, flex: 1 }} />
      ))}
    </div>
  );
}

export default function AudioRecorder({ onRecordingChange }) {
  const t = useTranslations('create');
  const { recording, audioBlob, audioURL, recSeconds, start, stop, clear } = useAudioRecorder();

  const handleStart = async () => {
    try {
      await start();
      onRecordingChange?.(null);
    } catch {
      alert(t('micError'));
    }
  };

  const handleStop = () => { stop(); };
  const handleClear = () => { clear(); onRecordingChange?.(null); };

  return (
    <div style={s.recorderBox}>
      {audioURL ? (
        <div style={s.playbackWrap}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <MediaPlayer url={audioURL} isVideo={false} />
          </div>
          <button type="button" style={s.deleteBtn} onClick={handleClear} title="Eliminar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      ) : (
        <div style={s.micRow}>
          {recording && (
            <div style={s.timerRow}>
              <span style={s.redDot} />
              <span style={s.timerText}>{formatTime(recSeconds)}</span>
            </div>
          )}
          <button
            type="button"
            style={{ ...s.micBtn, ...(recording ? s.micBtnRecording : {}) }}
            onClick={recording ? handleStop : handleStart}
          >
            {recording ? '⏹' : '🎙'}
          </button>
          <p style={s.micHint}>
            {recording ? t('recordStop') : t('recordStart')}
          </p>
          {recording && <WaveBars color="#DC2626" />}
        </div>
      )}
      {audioURL && <p style={s.savedLabel}>{t('voiceSaved')}</p>}
    </div>
  );
}

const s = {
  recorderBox: {
    marginTop: 16, border: '1px solid #D8B4FE', borderRadius: 12,
    backgroundColor: '#F5F3FF', padding: 16, display: 'flex',
    flexDirection: 'column', gap: 8,
  },
  timerRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  redDot: { width: 10, height: 10, borderRadius: '50%', backgroundColor: '#DC2626', display: 'inline-block' },
  timerText: { fontSize: 20, fontWeight: 700, color: '#DC2626', fontVariantNumeric: 'tabular-nums' },
  micRow: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  micBtn: {
    width: 72, height: 72, borderRadius: '50%', backgroundColor: '#FFFFFF',
    border: '2px solid #7C3AED', fontSize: 30, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(124,58,237,0.25)', transition: 'background 0.15s, border-color 0.15s',
  },
  micBtnRecording: { backgroundColor: '#FEE2E2', borderColor: '#DC2626' },
  micHint: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  playbackWrap: { display: 'flex', alignItems: 'center', gap: 8 },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 },
  savedLabel: { fontSize: 13, color: '#059669', fontWeight: 600, textAlign: 'center' },
};
