import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const CONTACT_EMAIL = import.meta.env.CONTACT_EMAIL ?? 'contact@agence-janus.fr';

export const server = {
  sendContact: defineAction({
    accept: 'form',
    input: z.object({
      firstname: z.string().min(2, 'Prénom requis'),
      lastname: z.string().min(2, 'Nom requis'),
      email: z.string().email('Email invalide'),
      phone: z.string().optional(),
      company: z.string().min(1, 'Entreprise requise'),
      service: z.enum(['formation', 'interpretation', 'accompagnement', 'traduction']),
      langue: z.enum(['anglais', 'polonais', 'fle', 'allemand', 'espagnol', 'italien']),
      message: z.string().min(10, 'Message trop court'),
      rgpd: z.literal('on', { error: 'Consentement RGPD requis' }),
      // Honeypot anti-spam — doit rester vide
      website: z.string().max(0).optional(),
    }),

    handler: async (input) => {
      // Honeypot check
      if (input.website) {
        return { success: true };
      }

      const serviceLabels: Record<string, string> = {
        formation: 'Formation professionnelle',
        interpretation: 'Interprétariat',
        accompagnement: 'Accompagnement terrain',
        traduction: 'Traduction',
      };

      const langueLabels: Record<string, string> = {
        anglais: 'Anglais',
        polonais: 'Polonais',
        fle: 'Français FLE',
        allemand: 'Allemand',
        espagnol: 'Espagnol',
        italien: 'Italien',
      };

      // Email à l'agence
      await resend.emails.send({
        from: 'JANUS Formulaire <noreply@agence-janus.fr>',
        to: CONTACT_EMAIL,
        subject: `Nouvelle demande — ${serviceLabels[input.service]} (${langueLabels[input.langue]})`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #1e2124; color: #f5f5f0; padding: 32px;">
            <h1 style="color: #c9a84c; font-size: 24px; margin-bottom: 24px; border-bottom: 1px solid #c9a84c33; padding-bottom: 16px;">
              Nouvelle demande de contact
            </h1>

            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; width: 140px;">Nom</td>
                <td style="padding: 8px 0; color: #f5f5f0;">${input.firstname} ${input.lastname}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Email</td>
                <td style="padding: 8px 0;"><a href="mailto:${input.email}" style="color: #c9a84c;">${input.email}</a></td>
              </tr>
              ${input.phone ? `
              <tr>
                <td style="padding: 8px 0; color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Téléphone</td>
                <td style="padding: 8px 0; color: #f5f5f0;">${input.phone}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 8px 0; color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Entreprise</td>
                <td style="padding: 8px 0; color: #f5f5f0;">${input.company}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Service</td>
                <td style="padding: 8px 0; color: #f5f5f0;">${serviceLabels[input.service]}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Langue</td>
                <td style="padding: 8px 0; color: #f5f5f0;">${langueLabels[input.langue]}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding: 20px; background: #2d3238; border-left: 3px solid #c9a84c;">
              <p style="color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 12px;">Message</p>
              <p style="color: #f5f5f0; line-height: 1.6; margin: 0; white-space: pre-wrap;">${input.message}</p>
            </div>

            <p style="margin-top: 32px; font-size: 11px; color: #ffffff40; text-align: center;">
              JANUS Agence Linguistique — contact@agence-janus.fr
            </p>
          </div>
        `,
      });

      // Email de confirmation à l'expéditeur
      await resend.emails.send({
        from: 'JANUS Agence Linguistique <contact@agence-janus.fr>',
        to: input.email,
        subject: 'Votre demande a bien été reçue — JANUS Agence Linguistique',
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #1e2124; color: #f5f5f0; padding: 32px;">
            <h1 style="color: #c9a84c; font-size: 24px; margin-bottom: 8px;">Bonjour ${input.firstname},</h1>
            <p style="color: #f5f5f0; line-height: 1.6; font-size: 16px;">
              Nous avons bien reçu votre demande concernant <strong style="color: #c9a84c;">${serviceLabels[input.service]}</strong>.
            </p>
            <p style="color: #f5f5f0a0; line-height: 1.6;">
              Notre équipe vous répondra dans les meilleurs délais, généralement sous 24h ouvrées.
            </p>
            <div style="margin: 32px 0; padding: 20px; background: #2d3238; border-left: 3px solid #c9a84c;">
              <p style="color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px;">Récapitulatif</p>
              <p style="color: #f5f5f0a0; font-size: 14px; margin: 0;">
                Service : ${serviceLabels[input.service]}<br/>
                Langue : ${langueLabels[input.langue]}<br/>
                Entreprise : ${input.company}
              </p>
            </div>
            <p style="color: #f5f5f0a0; font-size: 14px;">
              Pour toute question urgente, contactez-nous directement au<br/>
              <a href="tel:+33967056831" style="color: #c9a84c;">+33 9 67 05 68 31</a>
            </p>
            <hr style="border: none; border-top: 1px solid #c9a84c22; margin: 32px 0;" />
            <p style="color: #ffffff30; font-size: 11px; text-align: center; margin: 0;">
              JANUS Agence Linguistique · 20 ter rue Julien, 69003 Lyon<br/>
              SIRET 90335843000010
            </p>
          </div>
        `,
      });

      return { success: true };
    },
  }),
};
