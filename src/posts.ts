import { getCollection } from 'astro:content';

const byDateDesc = (a: { date: Date }, b: { date: Date }) =>
	b.date.valueOf() - a.date.valueOf();

export async function getRecentArticles(n = 5) {
	const items = await getCollection('article');
	return items
		.map((a) => ({
			title: a.data.title,
			description: a.data.description,
			date: a.data.pubDate,
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
			date: b.data.pubDate,
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