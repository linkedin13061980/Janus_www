import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const services = defineCollection({
  loader: glob({ pattern: '**/services.json', base: './src/content' }),
  schema: z.object({
    meta: z.object({
      title: z.string(),
      description: z.string()
    }),
    hero: z.object({
      label: z.string(),
      title: z.string(),
      subtitle: z.string()
    }),
    services: z.array(
      z.object({
        order: z.number(),
        slug: z.string().optional(),
        badge: z.string().optional(),
        title: z.string(),
        desc: z.string(),
        items: z.array(z.string()),
        cta: z.string(),
        href: z.string()
      })
    ),
    cta: z.object({
      title: z.string(),
      subtitle: z.string(),
      btn: z.string(),
      href: z.string()
    })
  })
});

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/casClients.json', base: './src/content' }),
  schema: z.object({
    meta: z.object({
      title: z.string(),
      description: z.string(),
      ogImage: z.string().optional()
    }),
    hero: z.object({
      eyebrow: z.string(),
      headline: z.string(),
      subheadline: z.string(),
      cta: z.object({
        label: z.string(),
        href: z.string()
      })
    }),
    cases: z.array(
      z.object({
        id: z.string(),
        tag: z.string(),
        sector: z.string(),
        badge: z.string().optional(),
        client: z.object({
          profile: z.string()
        }),
        challenge: z.object({
          headline: z.string(),
          body: z.string()
        }),
        mission: z.object({
          headline: z.string(),
          body: z.string(),
          tags: z.array(z.string())
        }),
        impact: z.object({
          headline: z.string(),
          body: z.string()
        })
      })
    ),
    cta: z.object({
      headline: z.string(),
      subheadline: z.string(),
      button: z.object({
        label: z.string(),
        href: z.string()
      })
    })
  })
});

export const collections = { services, caseStudies };
