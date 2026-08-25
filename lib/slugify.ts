// Shared by content/products.ts and content/categories.ts — kept here
// rather than duplicated in both.

const TRANSLIT: Record<string, string> = {
	а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
	и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
	с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
	щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

/**
 * Transliterates Cyrillic to ASCII kebab-case. When `unique` is given
 * (e.g. a numeric id), appends it so collisions between similarly-named
 * items are impossible.
 */
export function slugify(name: string, unique?: string | number): string {
	const translit = name
		.toLowerCase()
		.split('')
		.map(ch => TRANSLIT[ch] ?? ch)
		.join('')
	const kebab = translit.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
	return unique === undefined ? kebab : `${kebab}-${unique}`
}
