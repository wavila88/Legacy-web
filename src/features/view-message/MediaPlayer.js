'use client';

export default function MediaPlayer({ url, isVideo }) {
  if (isVideo) {
    return (
      <video
        controls
        playsInline
        style={{ width: '100%', borderRadius: 12, backgroundColor: '#000', maxHeight: 340 }}
        src={url}
      />
    );
  }

  return (
    <audio
      controls
      style={{ width: '100%', accentColor: '#7C3AED', marginTop: 4 }}
      src={url}
    />
  );
}
