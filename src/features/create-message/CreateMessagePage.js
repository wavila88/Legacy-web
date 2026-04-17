'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import VideoUploader from './components/VideoUploader';
import { uploadFile } from './services/uploadService';
import { minDeliveryDate, defaultDeliveryDate } from './utils/dateUtils';

/** Converts a Blob to a base64 data URL so it can be stored and played without external storage. */
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const TIPOS_MENSAJE = [
  { etiqueta: '🎂  Cumpleaños',  valor: 'Cumpleaños' },
  { etiqueta: '💍  Boda',        valor: 'Boda' },
  { etiqueta: '🎊  Aniversario', valor: 'Aniversario' },
  { etiqueta: '💌  General',     valor: 'General' },
];

export default function CreateMessagePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    parent_name:      '',
    parent_nickname:  '',
    child_name:       '',
    nickname:         '',
    email:            '',
    phone:            '',
    delivery_date:    defaultDeliveryDate(),
    delivery_time:    '09:00',
    tipo_mensaje:     'Cumpleaños',
    message_text:     '',
  });
  const [errors, setErrors] = useState({});

  const [attachType, setAttachType] = useState(null);
  const [file,       setFile]       = useState(null);
  const [audioBlob,  setAudioBlob]  = useState(null);
  const [audioURL,   setAudioURL]   = useState(null);
  const mediaRecRef  = useRef(null);
  const chunksRef    = useRef([]);
  const timerRef     = useRef(null);
  const [recording,  setRecording]  = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);

  const [msgOpen,    setMsgOpen]    = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const switchAttachType = (type) => {
    if (attachType === type) return;
    setFile(null);
    setAudioBlob(null);
    setAudioURL(null);
    setRecording(false);
    clearInterval(timerRef.current);
    setRecSeconds(0);
    if (mediaRecRef.current) {
      try { mediaRecRef.current.stop(); } catch (_) {}
      mediaRecRef.current = null;
    }
    setAttachType(type);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
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
      alert('No se pudo acceder al micrófono. Verifica los permisos del navegador.');
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    setRecording(false);
    mediaRecRef.current?.stop();
    mediaRecRef.current = null;
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioURL(null);
    setRecSeconds(0);
  };

  const validate = () => {
    const e = {};
    if (!form.parent_name.trim()) e.parent_name = 'Tu nombre es requerido.';
    if (!form.child_name.trim())  e.child_name  = 'El nombre del destinatario es requerido.';
    if (!form.email.trim())       e.email       = 'El correo electrónico es requerido.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo electrónico inválido.';
    if (!form.delivery_date)      e.delivery_date = 'La fecha de entrega es requerida.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      let file_url = null;
      let file_type = null;

      if (file) {
        file_url = await uploadFile(file);
        file_type = 'video';
      } else if (audioBlob) {
        // Convert audio blob to base64 data URL so it plays without external storage
        file_url = await blobToDataURL(audioBlob);
        file_type = 'audio';
      }

      // Combine date and time for delivery
      const delivery_date = form.delivery_time
        ? `${form.delivery_date}T${form.delivery_time}:00`
        : form.delivery_date;

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_name:     form.parent_name,
          parent_nickname: form.parent_nickname || null,
          child_name:      form.child_name,
          nickname:        form.nickname || null,
          email:         form.email,
          phone:         form.phone || null,
          delivery_date,
          file_url,
          file_type,
          message_text:  form.message_text || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al guardar el mensaje.');

      router.push(`/success?id=${data.id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <button style={s.backBtn} onClick={() => router.push('/')}>← Volver</button>
        <span style={s.topbarTitle}>Crear Mensaje</span>
        <span style={{ width: 72 }} />
      </div>

      <form onSubmit={handleSubmit} noValidate style={s.form}>

        {/* 1. Remitente */}
        <div className="card" style={s.card}>
          <p className="card-title">👤 Quién envía</p>
          <div className="divider" />
          <Field label="Tu nombre *" error={errors.parent_name}>
            <input
              className={`field-input${errors.parent_name ? ' error' : ''}`}
              placeholder="Ej: María García"
              value={form.parent_name}
              onChange={(e) => set('parent_name', e.target.value)}
            />
          </Field>
          <Field label="¿Cómo te conocen? (opcional)" error={null}>
            <input
              className="field-input"
              placeholder="Ej: Mamá, Papá, Abuelo, Tía Lucía…"
              value={form.parent_nickname}
              onChange={(e) => set('parent_nickname', e.target.value)}
            />
          </Field>
        </div>

        {/* 2. Destinatario */}
        <div className="card" style={s.card}>
          <p className="card-title">💌 Datos del Destinatario</p>
          <div className="divider" />
          <Field label="Nombre completo *" error={errors.child_name}>
            <input
              className={`field-input${errors.child_name ? ' error' : ''}`}
              placeholder="Ej: Sofía García"
              value={form.child_name}
              onChange={(e) => set('child_name', e.target.value)}
            />
          </Field>
          <Field label="Nombre de cariño o apodo" error={null}>
            <input
              className="field-input"
              placeholder="Ej: mi amor, princesa, papá…"
              value={form.nickname}
              onChange={(e) => set('nickname', e.target.value)}
            />
          </Field>
          <Field label="Correo electrónico *" error={errors.email}>
            <input
              className={`field-input${errors.email ? ' error' : ''}`}
              type="email"
              inputMode="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              autoCapitalize="none"
            />
          </Field>
          <Field label="Celular / WhatsApp (opcional)" error={null}>
            <input
              className="field-input"
              type="tel"
              inputMode="tel"
              placeholder="Ej: +1 809 555 0000"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
          </Field>
        </div>

        {/* 3. Detalles del mensaje */}
        <div className="card" style={s.card}>
          <p className="card-title">📝 Detalles del Mensaje</p>
          <div className="divider" />

          <label className="field-label">Tipo de mensaje</label>
          <select
            className="field-input"
            style={s.select}
            value={form.tipo_mensaje}
            onChange={(e) => set('tipo_mensaje', e.target.value)}
          >
            {TIPOS_MENSAJE.map(({ etiqueta, valor }) => (
              <option key={valor} value={valor}>{etiqueta}</option>
            ))}
          </select>

          <div style={s.dateTimeRow}>
            <Field label="Fecha de entrega *" error={errors.delivery_date} style={{ flex: 1 }}>
              <input
                className={`field-input${errors.delivery_date ? ' error' : ''}`}
                type="date"
                min={minDeliveryDate()}
                value={form.delivery_date}
                onChange={(e) => set('delivery_date', e.target.value)}
              />
            </Field>
            <Field label="Hora de entrega" error={null} style={{ flex: 1 }}>
              <input
                className="field-input"
                type="time"
                value={form.delivery_time}
                onChange={(e) => set('delivery_time', e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* 4. Mensaje de texto */}
        <div className="card" style={s.card}>
          <button type="button" style={s.msgToggle} onClick={() => setMsgOpen((o) => !o)}>
            <span style={s.msgToggleLeft}>
              <span style={s.cardTitleInline}>✍️ Mensaje</span>
              <span style={s.msgToggleSub}>Opcional</span>
            </span>
            <span style={s.msgChevron}>{msgOpen ? '▲' : '▼'}</span>
          </button>

          {msgOpen && (
            <>
              <div className="divider" />
              <textarea
                className="field-input"
                style={s.textarea}
                placeholder="Escribe aquí lo que quieres decirle…"
                rows={4}
                value={form.message_text}
                onChange={(e) => set('message_text', e.target.value)}
                autoFocus
              />
            </>
          )}
        </div>

        {/* 5. Adjunto */}
        <div className="card" style={s.card}>
          <p className="card-title">📎 Adjunto</p>
          <p className="card-subtitle">Elige un tipo de adjunto (opcional)</p>
          <div className="divider" />

          <div style={s.segmented}>
            <button
              type="button"
              style={{ ...s.segment, ...(attachType === 'audio' ? s.segmentActive : {}) }}
              onClick={() => switchAttachType('audio')}
            >
              🎙 Mensaje de voz
            </button>
            <button
              type="button"
              style={{ ...s.segment, ...(attachType === 'video' ? s.segmentActive : {}) }}
              onClick={() => switchAttachType('video')}
            >
              🎥 Video
            </button>
          </div>

          {attachType === 'audio' && (
            <div style={s.recorderBox}>
              {audioURL ? (
                <div style={s.playbackRow}>
                  <audio controls src={audioURL} style={s.audioPlayer} />
                  <button type="button" style={s.deleteBtn} onClick={deleteRecording}>🗑️</button>
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
                    onClick={recording ? stopRecording : startRecording}
                  >
                    {recording ? '⏹' : '🎙'}
                  </button>
                  <p style={s.micHint}>
                    {recording ? 'Toca para detener la grabación' : 'Toca el micrófono para grabar tu voz'}
                  </p>
                  {recording && <WaveBars />}
                </div>
              )}
              {audioURL && <p style={s.savedLabel}>✓ Mensaje de voz guardado</p>}
            </div>
          )}

          {attachType === 'video' && (
            <VideoUploader file={file} onFileChange={setFile} />
          )}

          {attachType === null && (
            <p style={s.noSelection}>Toca una opción de arriba para agregar un adjunto</p>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Guardando…' : '💾  Guardar Mensaje'}
        </button>

        <div style={{ height: 48 }} />
      </form>
    </div>
  );
}

function Field({ label, error, children, style }) {
  return (
    <div style={{ marginBottom: 4, ...style }}>
      <label className="field-label">{label}</label>
      {children}
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

const WAVE_HEIGHTS = [6, 14, 20, 12, 18, 24, 10, 16, 22, 8, 20, 14, 18, 24, 10, 16, 12, 22, 8, 16];
function WaveBars() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, gap: 3 }}>
      {WAVE_HEIGHTS.map((h, i) => (
        <div key={i} style={{ width: '100%', maxWidth: 4, height: h, borderRadius: 2, backgroundColor: '#DC2626', flex: 1 }} />
      ))}
    </div>
  );
}

const s = {
  page: {
    minHeight: '100dvh',
    backgroundColor: '#F5F3FF',
    display: 'flex',
    flexDirection: 'column',
  },
  topbar: {
    backgroundColor: '#7C3AED',
    paddingTop: 52,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  backBtn: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: 500,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    width: 72,
    textAlign: 'left',
  },
  topbarTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 700,
    textAlign: 'center',
    flex: 1,
  },
  form: {
    flex: 1,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  card: { marginBottom: 0 },
  select: { marginBottom: 16, cursor: 'pointer' },
  textarea: { resize: 'vertical', minHeight: 100, lineHeight: '1.5' },

  msgToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    textAlign: 'left',
  },
  msgToggleLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  cardTitleInline: {
    fontSize: 15,
    fontWeight: 700,
    color: '#5B21B6',
  },
  msgToggleSub: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: 500,
  },
  msgChevron: {
    fontSize: 11,
    color: '#A78BFA',
    flexShrink: 0,
  },

  // Date + time side by side
  dateTimeRow: {
    display: 'flex',
    gap: 12,
  },

  // Segmented control
  segmented: {
    display: 'flex',
    border: '1px solid #D8B4FE',
    borderRadius: 12,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    padding: '12px 8px',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 600,
    color: '#6B7280',
    background: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
  },
  segmentActive: {
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
  },

  // Audio recorder
  recorderBox: {
    marginTop: 16,
    border: '1px solid #D8B4FE',
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  timerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: '#DC2626',
    display: 'inline-block',
  },
  timerText: {
    fontSize: 20,
    fontWeight: 700,
    color: '#DC2626',
    fontVariantNumeric: 'tabular-nums',
  },
  micRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  micBtn: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    border: '2px solid #7C3AED',
    fontSize: 30,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(124,58,237,0.25)',
    transition: 'background 0.15s, border-color 0.15s',
  },
  micBtnRecording: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  micHint: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  playbackRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  audioPlayer: {
    flex: 1,
    height: 40,
    accentColor: '#7C3AED',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    fontSize: 20,
    cursor: 'pointer',
    padding: 4,
  },
  savedLabel: {
    fontSize: 13,
    color: '#059669',
    fontWeight: 600,
    textAlign: 'center',
  },
  noSelection: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 13,
    marginTop: 10,
    fontStyle: 'italic',
  },
};
