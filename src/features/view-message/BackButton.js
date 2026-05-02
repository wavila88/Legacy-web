'use client';
import { useRouter } from 'next/navigation';

export default function BackButton({ label }) {
  const router = useRouter();
  return (
    <button style={s.btn} onClick={() => router.back()}>{label}</button>
  );
}

const s = {
  btn: {
    position: 'absolute', top: 20, left: 20,
    background: 'none', border: 'none',
    color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', padding: 0,
  },
};
