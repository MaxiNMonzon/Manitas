import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// El nombre lo escribe la persona: se escapan los < > & " para que no pueda meter HTML en el mail
const sinHtml = (texto: string) =>
  texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Manda los mails de la app con Brevo (por su API web: Render, en el plan gratis, no deja usar SMTP).
// Necesita BREVO_API_KEY y CORREO_REMITENTE (un correo verificado en Brevo) en el .env.
// Si no estan (por ejemplo en la compu de cada uno), no manda nada y muestra el link en la terminal del back
@Injectable()
export class CorreoService {
  private readonly logger = new Logger('Correo');

  constructor(private readonly configService: ConfigService) {}

  async enviarRecuperacion(para: string, nombre: string, link: string) {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    const remitente = this.configService.get<string>('CORREO_REMITENTE');
    if (!apiKey || !remitente) {
      this.logger.warn(`Sin BREVO_API_KEY: no se mando el mail. Link para cambiar la contraseña de ${para}: ${link}`);
      return;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; color: #1f2937">
        <h2 style="color: #1B2845">Hola, ${sinHtml(nombre)}</h2>
        <p>Pediste cambiar tu contraseña de <b>Manitas</b>. Tocá el botón para elegir una nueva:</p>
        <p style="margin: 24px 0">
          <a href="${link}" style="background: #F28C28; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: bold">
            Crear contraseña nueva
          </a>
        </p>
        <p style="color: #5f6b7a; font-size: 14px">El link sirve una sola vez y vence en 30 minutos.
        Si no fuiste vos, ignorá este mail: tu contraseña no cambia.</p>
      </div>`;

    const respuesta = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Manitas', email: remitente },
        to: [{ email: para, name: nombre }],
        subject: 'Cambiá tu contraseña de Manitas',
        htmlContent: html,
      }),
    }).catch(() => null);

    if (!respuesta || !respuesta.ok) {
      this.logger.error(`Brevo no mando el mail a ${para}: ${respuesta ? respuesta.status + ' ' + (await respuesta.text()) : 'sin conexion'}`);
      throw new ServiceUnavailableException('No pudimos mandar el mail. Probá de nuevo en unos minutos');
    }
  }
}
