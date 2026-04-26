'use client';

import { useTranslations } from 'next-intl';

export default function VideoUploader({ file, onFileChange }) {
  const t = useTranslations('create');

  return (
    <div style={s.uploaderBox}>
      {file ? (
        <div style={s.fileSelected}>
          <span style={{ fontSize: 28 }}>🎬</span>
          <div style={{ flex: 1 }}>
            <p style={s.fileName}>{file.name}</p>
            <p style={s.fileSize}>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
          <button type="button" style={s.removeBtn} onClick={() => onFileChange(null)}>✕</button>
        </div>
      ) : (
        <label style={s.dropZone}>
          <span style={{ fontSize: 32 }}>🎥</span>
          <span style={s.dropText}>{t('videoUpload')}</span>
          <span style={s.dropHint}>MP4, MOV, AVI</span>
          <input
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
        </label>
      )}
    </div>
  );
}

const s = {
  uploaderBox: { marginTop: 16 },
  dropZone: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    border: '2px dashed #D8B4FE', borderRadius: 12, padding: 24,
    backgroundColor: '#F5F3FF', cursor: 'pointer',
  },
  dropText: { fontSize: 15, fontWeight: 600, color: '#5B21B6' },
  dropHint: { fontSize: 13, color: '#6B7280' },
  fileSelected: {
    display: 'flex', alignItems: 'center', gap: 10,
    backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7',
    borderRadius: 12, padding: 14,
  },
  fileName: { fontSize: 15, fontWeight: 600, color: '#065F46', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  fileSize: { fontSize: 13, color: '#059669', marginTop: 2 },
  removeBtn: {
    width: 28, height: 28, borderRadius: '50%', backgroundColor: '#FEE2E2',
    border: 'none', color: '#DC2626', fontWeight: 700, fontSize: 13, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
};
