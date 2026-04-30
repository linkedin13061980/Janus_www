import { defineCollection, z } from 'astro:content';

const services = defineCollection({
  type: 'data',
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

export const collections = {
  services
};
