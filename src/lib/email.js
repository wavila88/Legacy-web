import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendMagicLink({ to, magicLink }) {
  return getResend().emails.send({
    from: 'Legado Mensajes <onboarding@resend.dev>',
    to,
    subject: '💌 Tu acceso a Legado Mensajes',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px 24px;background:#F5F3FF;border-radius:16px;">
        <h2 style="color:#5B21B6;margin-bottom:8px;">Legado Mensajes</h2>
        <p style="color:#374151;font-size:16px;line-height:1.6;">
          Haz clic en el botón para ver los mensajes que has guardado para tus seres queridos.
        </p>
        <a href="${magicLink}"
           style="display:inline-block;margin:24px 0;padding:14px 32px;background:#7C3AED;color:#fff;
                  font-weight:700;font-size:16px;border-radius:12px;text-decoration:none;">
          Ver mis mensajes →
        </a>
        <p style="color:#9CA3AF;font-size:13px;">
          Este link expira en 1 hora. Si no solicitaste esto, ignora este correo.
        </p>
      </div>
    `,
  });
}

export async function sendMessageNotification({ to, recipientName, senderName, messageLink }) {
  return getResend().emails.send({
    from: 'Legado Mensajes <onboarding@resend.dev>',
    to,
    subject: `💌 Tienes un mensaje especial de ${senderName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px 24px;background:#F5F3FF;border-radius:16px;">
        <h2 style="color:#5B21B6;margin-bottom:8px;">Un mensaje para ti, ${recipientName}</h2>
        <p style="color:#374151;font-size:16px;line-height:1.6;">
          <strong>${senderName}</strong> te dejó un mensaje especial con mucho amor.
        </p>
        <a href="${messageLink}"
           style="display:inline-block;margin:24px 0;padding:14px 32px;background:#7C3AED;color:#fff;
                  font-weight:700;font-size:16px;border-radius:12px;text-decoration:none;">
          Abrir mensaje →
        </a>
        <p style="color:#9CA3AF;font-size:13px;">
          Este mensaje fue guardado con amor en Legado Mensajes.
        </p>
      </div>
    `,
  });
}
