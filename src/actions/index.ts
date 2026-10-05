import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { Resend } from 'resend';
import { t, type Locale } from '../i18n/utils';

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const CONTACT_EMAIL = import.meta.env.CONTACT_EMAIL ?? 'contact@agence-janus.fr';

const BESOINS = ['accompagnement', 'negociation', 'coordination', 'coaching', 'interpretation', 'traduction', 'interculturel', 'formation', 'autre'] as const;
const LANGUES = ['francais', 'anglais', 'polonais', 'allemand', 'espagnol', 'italien', 'plusieurs'] as const;
const SERVICES = ['accompagnement', 'interpretation', 'traduction', 'negociation', 'equipes', 'coaching', 'formation', 'autre'] as const;
const LANGUE_CLASSIQUE = ['francais', 'anglais', 'polonais', 'fle', 'allemand', 'espagnol', 'italien'] as const;
// Langue de la page d'où part le formulaire : messages affichés et e-mail de confirmation dans cette langue.
const LOCALES = ['fr', 'en', 'pl'] as const;

// Échappement HTML des saisies du formulaire avant insertion dans les e-mails.
const esc = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const server = {
  sendContact: defineAction({
    accept: 'form',
    // Deux variantes du formulaire partagent cette action :
    // - « projet » (FR) : type de besoin, pays, langues facultatives, objectif ;
    // - « classique » (EN/PL, en attente d'harmonisation) : service, langue, message.
    input: z
      .object({
        firstname: z.string().min(2, 'Prénom requis'),
        lastname: z.string().min(2, 'Nom requis'),
        email: z.string().email('Email invalide'),
        phone: z.string().optional(),
        company: z.string().min(1, 'Entreprise requise'),
        locale: z.enum(LOCALES).optional(),
        // Variante « projet »
        variante: z.enum(['projet']).optional(),
        besoin: z.enum(BESOINS, { error: 'Merci de choisir un type de besoin' }).optional(),
        pays: z.string().max(300).optional(),
        langues: z.array(z.enum(LANGUES)).optional(),
        objectif: z.string().max(5000).optional(),
        // Variante « classique »
        service: z.enum(SERVICES).optional(),
        langue: z.enum(LANGUE_CLASSIQUE).optional(),
        message: z.string().max(5000).optional(),
        rgpd: z.literal('on', { error: 'Consentement RGPD requis' }),
        // Honeypot anti-spam — doit rester vide
        website: z.string().max(0).optional(),
        // « 1 » si la mesure d'audience était acceptée au moment de l'envoi (formulaire FR) : conditionne la conversion.
        mesure: z.literal('1').optional(),
      })
      .superRefine((d, ctx) => {
        if (d.variante === 'projet') {
          if (!d.besoin) {
            ctx.addIssue({ code: 'custom', path: ['besoin'], message: 'Merci de choisir un type de besoin' });
          }
          if (!d.objectif || d.objectif.trim().length < 10) {
            ctx.addIssue({ code: 'custom', path: ['objectif'], message: 'Merci de décrire votre besoin (10 caractères minimum)' });
          }
        } else {
          if (!d.service) ctx.addIssue({ code: 'custom', path: ['service'], message: 'Service requis' });
          if (!d.langue) ctx.addIssue({ code: 'custom', path: ['langue'], message: 'Langue requise' });
          if (!d.message || d.message.trim().length < 10) ctx.addIssue({ code: 'custom', path: ['message'], message: 'Message trop court' });
        }
      }),

    handler: async (input) => {
      // Honeypot check
      if (input.website) {
        return { success: true };
      }

      const besoinLabels: Record<string, string> = {
        coordination: 'Projet international : plusieurs besoins linguistiques et interculturels',
        accompagnement: "Accompagnement terrain, en France ou à l'étranger",
        negociation: 'Négociation / réunion stratégique',
        coaching: 'Coaching en prise de parole (contexte international)',
        interpretation: 'Interprétation',
        traduction: 'Traduction',
        interculturel: 'Communication interculturelle',
        formation: 'Formation professionnelle',
        autre: 'Autre / à définir',
      };
      const serviceLabels: Record<string, string> = {
        accompagnement: 'Accompagnement terrain',
        interpretation: 'Interprétation',
        traduction: 'Traduction',
        negociation: 'Préparation de réunions et négociations',
        equipes: 'Préparation linguistique et interculturelle des équipes',
        coaching: 'Coaching de prise de parole',
        formation: 'Formation en langues',
        autre: 'Autre besoin',
      };
      const langueLabels: Record<string, string> = {
        francais: 'Français',
        anglais: 'Anglais',
        polonais: 'Polonais',
        fle: 'Français FLE',
        allemand: 'Allemand',
        espagnol: 'Espagnol',
        italien: 'Italien',
        plusieurs: 'Plusieurs / à définir',
      };

      const locale: Locale = input.locale ?? 'fr';

      // Toutes les valeurs saisies sont échappées avant d'être insérées dans les e-mails HTML.
      const nature = input.besoin ? besoinLabels[input.besoin] : serviceLabels[input.service!];
      const langues = input.besoin
        ? (input.langues ?? []).map((l) => langueLabels[l]).join(', ') || 'Non précisé'
        : langueLabels[input.langue!];
      const pays = input.pays?.trim() || 'Non précisé';
      const texte = (input.besoin ? input.objectif : input.message) ?? '';
      const complement = input.besoin ? input.message?.trim() : '';
      const e = {
        prenom: esc(input.firstname),
        nom: esc(input.lastname),
        email: esc(input.email),
        tel: esc(input.phone ?? ''),
        entreprise: esc(input.company),
        nature: esc(nature),
        langues: esc(langues),
        pays: esc(pays),
        texte: esc(texte),
        complement: esc(complement ?? ''),
      };
      const ligne = (label: string, valeur: string) => `
              <tr>
                <td style="padding: 8px 0; color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; width: 140px;">${label}</td>
                <td style="padding: 8px 0; color: #f5f5f0;">${valeur}</td>
              </tr>`;

      // Email à l'agence — en cas d'échec, le visiteur voit un message d'erreur au lieu d'une fausse confirmation.
      const envoiAgence = await resend.emails.send({
        from: 'JANUS Formulaire <noreply@agence-janus.fr>',
        to: CONTACT_EMAIL,
        replyTo: input.email,
        subject: `Nouvelle demande — ${nature} (${input.besoin ? pays : langues})`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #1e2124; color: #f5f5f0; padding: 32px;">
            <h1 style="color: #c9a84c; font-size: 24px; margin-bottom: 24px; border-bottom: 1px solid #c9a84c33; padding-bottom: 16px;">
              Nouvelle demande de contact
            </h1>
            <table style="width: 100%; border-collapse: collapse;">
              ${ligne('Nom', `${e.prenom} ${e.nom}`)}
              ${ligne('Email', `<a href="mailto:${e.email}" style="color: #c9a84c;">${e.email}</a>`)}
              ${e.tel ? ligne('Téléphone', e.tel) : ''}
              ${ligne('Entreprise', e.entreprise)}
              ${ligne(input.besoin ? 'Type de besoin' : 'Service', e.nature)}
              ${input.besoin ? ligne('Pays concernés', e.pays) : ''}
              ${ligne(input.besoin ? 'Langue(s)' : 'Langue', e.langues)}
              ${ligne('Langue du formulaire', locale.toUpperCase())}
            </table>
            <div style="margin-top: 24px; padding: 20px; background: #2d3238; border-left: 3px solid #c9a84c;">
              <p style="color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 12px;">${input.besoin ? 'Besoin / objectif' : 'Message'}</p>
              <p style="color: #f5f5f0; line-height: 1.6; margin: 0; white-space: pre-wrap;">${e.texte}</p>
            </div>
            ${e.complement ? `
            <div style="margin-top: 16px; padding: 20px; background: #2d3238; border-left: 3px solid #c9a84c55;">
              <p style="color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 12px;">Informations complémentaires</p>
              <p style="color: #f5f5f0; line-height: 1.6; margin: 0; white-space: pre-wrap;">${e.complement}</p>
            </div>` : ''}
            <p style="margin-top: 32px; font-size: 11px; color: #ffffff40; text-align: center;">
              JANUS — contact@agence-janus.fr
            </p>
          </div>
        `,
      });

      if (envoiAgence.error) {
        console.error('Resend — échec de l\'e-mail à l\'agence :', envoiAgence.error);
        throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'Envoi impossible' });
      }

      // Email de confirmation à l'expéditeur : EN/PL dans la langue du formulaire, FR inchangé.
      if (locale !== 'fr' && !input.besoin) {
        const c = (k: string) => t(locale, `contact.confirmation.${k}`);
        const natureLoc = esc(t(locale, `contact.service_options.${input.service}`));
        const langueLoc = esc(t(locale, `contact.langue_options.${input.langue}`));
        const suffixe = t(locale, 'contact.confirmation.phoneSuffix');
        await resend.emails.send({
          from: 'JANUS <contact@agence-janus.fr>',
          to: input.email,
          subject: c('subject'),
          html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #1e2124; color: #f5f5f0; padding: 32px;">
            <h1 style="color: #c9a84c; font-size: 24px; margin-bottom: 8px;">${c('greeting').replace('{prenom}', e.prenom)}</h1>
            <p style="color: #f5f5f0; line-height: 1.6; font-size: 16px;">
              ${c('received')} <strong style="color: #c9a84c;">${natureLoc}</strong>.
            </p>
            <p style="color: #f5f5f0a0; line-height: 1.6;">
              ${c('reply')}
            </p>
            <div style="margin: 32px 0; padding: 20px; background: #2d3238; border-left: 3px solid #c9a84c;">
              <p style="color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px;">${c('summary')}</p>
              <p style="color: #f5f5f0a0; font-size: 14px; margin: 0;">
                ${c('service')}: ${natureLoc}<br/>
                ${c('langue')}: ${langueLoc}<br/>
                ${c('company')}: ${e.entreprise}
              </p>
            </div>
            <p style="color: #f5f5f0a0; font-size: 14px;">
              ${c('phone')}<br/>
              <a href="tel:+33967056831" style="color: #c9a84c;">+33 9 67 05 68 31</a>${suffixe.startsWith('contact.') ? '' : suffixe}
            </p>
            <hr style="border: none; border-top: 1px solid #c9a84c22; margin: 32px 0;" />
            <p style="color: #ffffff30; font-size: 11px; text-align: center; margin: 0;">
              ${c('address')}<br/>
              SIRET 90335843000010
            </p>
          </div>
        `,
        });
        return { success: true, mesure: input.mesure === '1' };
      }

      // Email de confirmation à l'expéditeur
      await resend.emails.send({
        from: 'JANUS <contact@agence-janus.fr>',
        to: input.email,
        subject: 'Votre demande a bien été reçue — JANUS',
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #1e2124; color: #f5f5f0; padding: 32px;">
            <h1 style="color: #c9a84c; font-size: 24px; margin-bottom: 8px;">Bonjour ${e.prenom},</h1>
            <p style="color: #f5f5f0; line-height: 1.6; font-size: 16px;">
              Nous avons bien reçu votre demande concernant <strong style="color: #c9a84c;">${e.nature}</strong>.
            </p>
            <p style="color: #f5f5f0a0; line-height: 1.6;">
              Nous reviendrons vers vous dans les meilleurs délais.
            </p>
            <div style="margin: 32px 0; padding: 20px; background: #2d3238; border-left: 3px solid #c9a84c;">
              <p style="color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px;">Récapitulatif</p>
              <p style="color: #f5f5f0a0; font-size: 14px; margin: 0;">
                ${input.besoin ? 'Type de besoin' : 'Service'} : ${e.nature}<br/>
                ${input.besoin ? `Pays concernés : ${e.pays}<br/>` : ''}
                Langue${input.besoin ? '(s)' : ''} : ${e.langues}<br/>
                Entreprise : ${e.entreprise}
              </p>
            </div>
            <p style="color: #f5f5f0a0; font-size: 14px;">
              Vous pouvez aussi nous joindre directement au<br/>
              <a href="tel:+33967056831" style="color: #c9a84c;">+33 9 67 05 68 31</a>
            </p>
            <hr style="border: none; border-top: 1px solid #c9a84c22; margin: 32px 0;" />
            <p style="color: #ffffff30; font-size: 11px; text-align: center; margin: 0;">
              JANUS · 20 ter rue Julien, 69003 Lyon<br/>
              SIRET 90335843000010
            </p>
          </div>
        `,
      });

      return { success: true, mesure: input.mesure === '1' };
    },
  }),
};
