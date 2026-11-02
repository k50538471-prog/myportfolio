import { getCollection } from 'astro:content';

const byDateDesc = (a: { date: Date }, b: { date: Date }) =>
	b.date.valueOf() - a.date.valueOf();

export async function getRecentArticles(n = 5) {
	const items = await getCollection('article');
	return items
		.map((a) => ({
			title: a.data.title,
			description: a.data.description,
			date: a.data.date,
			topic: a.data.topic,
			url: a.data.href ?? `/article/${a.id}/`,
		}))
		.sort(byDateDesc)
		.slice(0, n);
}

export async function getRecentBlogs(n = 5) {
	const items = await getCollection('blog');
	return items
		.map((b) => ({
			title: b.data.title,
			description: b.data.description,
			date: b.data.date,
			url: `/blog/${b.id}/`,
		}))
		.sort(byDateDesc)
		.slice(0, n);
}

// ホームの「recently」用: 両方まとめて新しい順
export async function getRecentAll(n = 5) {
	const [a, b] = await Promise.all([getRecentArticles(n), getRecentBlogs(n)]);
	return [
		...a.map((x) => ({ ...x, kind: 'article' as const })),
		...b.map((x) => ({ ...x, kind: 'blog' as const })),
	]
		.sort(byDateDesc)
		.slice(0, n);
}

// n を省略すると article + blog の全件(新しい順)

export async function getArticles(n?: number) {
	const items = await getCollection('article');
	const sorted = items
		.map((a) => ({
			title: a.data.title,
			description: a.data.description,
			date: a.data.date,
			topic: a.data.topic,
			tags: a.data.tags,
			url: a.data.href ?? `/article/${a.id}/`,
		}))
		.sort(byDateDesc);
	return n ? sorted.slice(0, n) : sorted;
}

export async function getBlogs(n?: number) {
	const items = await getCollection('blog');
	const sorted = items
		.map((b) => ({
			title: b.data.title,
			description: b.data.description,
			date: b.data.date,
			url: `/blog/${b.id}/`,
		}))
		.sort(byDateDesc);
	return n ? sorted.slice(0, n) : sorted;
}

export async function getAll(n?: number) {
	const [a, b] = await Promise.all([getArticles(), getBlogs()]);
	const merged = [
		...a.map((x) => ({ ...x, kind: 'article' as const })),
		...b.map((x) => ({ ...x, kind: 'blog' as const })),
	].sort(byDateDesc);
	return n ? merged.slice(0, n) : merged;
}