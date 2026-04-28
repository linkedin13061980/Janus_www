# CLAUDE.md — JANUS Agence Linguistique

## Mission

Site web multilingue haut de gamme (FR/EN/PL).

Objectif : design premium, cohérence parfaite, structure évolutive, performance.

---

## Répertoire de travail (OBLIGATOIRE)

~/Projects/janus-site

---

## Structure du projet (STRICTE)

/src/pages/fr/
/src/pages/en/
/src/pages/pl/

/src/components/ui/
/src/components/layout/

/src/content/fr/
/src/content/en/
/src/content/pl/

/public

---

## Contenu (CRITIQUE)

* Aucun texte dans les composants
* Tout le contenu dans /src/content
* Format JSON ou Markdown
* Chaque langue a ses fichiers séparés

---

## Gestion des pages (SCALABLE)

Création d’une page :

1. Créer /pages/fr/nom-page.astro
2. Dupliquer en /en/ et /pl/
3. Créer contenu dans /content/{lang}/
4. Lier au menu si nécessaire
5. Vérifier responsive
6. Tester build

Règles :

* Toute page existe en FR/EN/PL
* FR = référence principale
* Structure identique entre langues

---

## Gestion des langues

Langues actives :

* fr
* en
* pl

Ajout langue :

1. Créer /pages/{lang}
2. Créer /content/{lang}
3. Dupliquer structure FR
4. Traduire contenu
5. Ajouter au routing
6. Tester build

---

## Menu (CRITIQUE)

* Le menu est géré uniquement via /src/content/menu.json
* Aucun menu codé en dur dans les composants
* Toute modification du menu passe par ce fichier

Structure exemple :

{
"label": "Services",
"url": "/fr/services",
"children": []
}

---

## Composants critiques

* Header
* Footer
* Navigation

❌ Ne jamais modifier sans validation

---

## Stack & Contraintes

* Astro SSR + Vercel
* Tailwind CSS v4
* Mobile-first

Interdits :

* @apply dans styles scopés
* nouvelles dépendances sans validation

---

## Design System (STRICT)

Couleurs :
#f7f5f2
#b5936b
#1a1a1a
#0d0d0d
#c9a84c

Typographie :

* Landing : Cormorant + DM Sans
* Global : Libre Baskerville + Raleway

---

## Sécurité (ANTI-CASSE)

* Ne jamais supprimer une section sans validation
* Ne jamais modifier structure globale
* Ne modifier que ce qui est demandé
* Toujours proposer un plan avant modification
* Toujours tester build

---

## Gestion des erreurs

* Si build échoue → corriger immédiatement
* Ne jamais enchaîner modifications sans test

---

## Validation visuelle (OBLIGATOIRE)

* Vérifier chaque modification dans le navigateur
* Vérifier mobile + desktop
* Vérifier navigation entre pages

---

## Workflow obligatoire

1. Lire CLAUDE.md
2. Comprendre la tâche
3. Proposer un plan
4. Attendre validation
5. Modifier code
6. npm run build
7. Vérification visuelle
8. Résumer changements

---

## Règles Claude

* Répondre en français
* Être précis et minimaliste
* Respect strict du système
* Ne jamais sortir du projet

---

## Commandes

npm run dev
npm run build
npm run preview

---

## Repo

https://github.com/linkedin13061980/Janus_www

---

## État du projet — 26 avril 2026

### ✅ Fait

**Pages FR complètes :**
- `/fr/index.astro` — Homepage v4 : tuiles pays (6 drapeaux), ticker langues, compteurs animés, scroll fade-in, palette crème/bronze
- `/fr/janus-negociation.astro` — Landing page Deal Sprint 800€/jour (Cormorant + DM Sans)
- `/fr/services.astro` — 5 services (formation, interprétariat, terrain, traduction, chef de projet)
- `/fr/services/chef-de-projet-terrain.astro` — Page service dédiée
- `/fr/a-propos.astro`, `/fr/contact.astro`, `/fr/langues.astro`, `/fr/financement.astro`, `/fr/pologne-investir.astro`
- `/fr/marches/` — 5 pages pays (Pologne, Royaume-Uni, Allemagne, Espagne, Italie)
- `/fr/cas-pratiques/` — 3 études de cas (industrie, tech, back-office)
- Pages légales : `mentions-legales`, `cgv`, `rgpd`, `cookies`

**Pages EN et PL :**
- Services, langues, financement, a-propos, contact, pologne-investir, mentions-legales, cgv, rgpd, cookies

**Infrastructure :**
- `Layout.astro` — SSR, hreflang, OG, GA4 conditionnel
- `Header.astro`, `Footer.astro`, `CookieBanner.astro`, `ContactForm.astro`
- `sitemap.xml.ts` — dynamique, toutes pages × 3 langues
- `vercel.json` — redirections 301 + headers sécurité
- Déploiement GitHub → Vercel actif (auto sur push main)
- `CLAUDE.md` — initialisé et structuré

### 🔄 En cours

- Refonte architecture contenu : `/src/content/{lang}/` à créer (textes encore dans les `.astro`)
- Page modèle `services` FR/EN/PL selon nouvelle architecture (plan validé, pas encore codé)

### ⏸ Arrêté ici (26 avril 2026)

Plan de la page modèle `services` proposé et en attente de validation pour démarrer le code :
- Créer `src/content/fr|en|pl/services.json`
- Créer `src/components/ui/ServiceCard.astro`
- Créer `src/components/layout/PageHero.astro`
- Refactoriser `src/pages/fr|en|pl/services.astro`

