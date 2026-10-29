import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

const article = defineCollection({
	loader: glob({ base: './src/content/article', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		topic: z.enum(['数学', 'アルゴリズム', 'コンピュータ']),
		// 数学系(LaTeXML変換HTML)など，本体が別ページにある場合だけ指定
		href: z.string().optional(),
	}),
});

export const collections = { blog, article };
