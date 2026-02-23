/**
 * Parses RSS XML into a more usable format.
 * Uses Regex for server-side compatibility if DOMParser is missing.
 */
export function parseRssXml(xml: string) {
    const items: { title: string, description: string, link: string, publishedAt: string, source: string }[] = [];

    // Extract all <item> blocks
    const itemPattern = /<item>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;

    while ((match = itemPattern.exec(xml)) !== null) {
        const block = match[1];

        try {
            const title = extractTag(block, 'title');
            const link = extractTag(block, 'link') || extractTag(block, 'guid');
            const description = extractTag(block, 'description') || '';
            const pubDate = extractTag(block, 'pubDate') || new Date().toUTCString();
            const source = extractTag(block, 'source') || '';

            if (!title || !link) continue;

            items.push({
                title: stripHtml(title),
                link,
                description: stripHtml(description),
                publishedAt: new Date(pubDate).toISOString(),
                source: stripHtml(source)
            });
        } catch (err) {
            console.warn('[RSS] Skipping malformed item:', err);
        }
    }

    return items;
}

function extractTag(block: string, tag: string): string {
    const cdataPattern = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i');
    const cdataMatch = cdataPattern.exec(block);
    if (cdataMatch) return cdataMatch[1].trim();

    const plainPattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
    const plainMatch = plainPattern.exec(block);
    if (plainMatch) return plainMatch[1].trim();

    return '';
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Fetches the RSS URL and parses items.
 */
export async function fetchAndParseRss(url: string) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'CreatorIQ-Opportunity-Engine/1.0' },
        });

        clearTimeout(timeout);

        if (!res.ok) return [];
        const xml = await res.text();
        return parseRssXml(xml);
    } catch (err) {
        console.warn(`[RSS] Failed to fetch or parse RSS from ${url}:`, err);
        return [];
    }
}
