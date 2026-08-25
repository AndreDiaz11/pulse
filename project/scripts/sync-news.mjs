import crypto from 'node:crypto';
import Parser from 'rss-parser';
import { supabase } from './supabase-admin.mjs';

const parser = new Parser();

const FEEDS = [
  { url: 'https://store.steampowered.com/feeds/news/app/570/?cc=us&l=english', source: 'Dota 2 (oficial)' },
  { url: 'https://esportsinsider.com/tag/dota-2/feed', source: 'Esports Insider' },
];

const MAX_ITEMS_KEPT = 60;

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractImage(html) {
  if (!html) return null;
  const match = html.match(/<img[^>]+src="([^"]+)"/i);
  return match ? match[1] : null;
}

function idFor(link) {
  return crypto.createHash('sha1').update(link).digest('hex');
}

async function fetchFeed(feed) {
  const parsed = await parser.parseURL(feed.url);
  return parsed.items
    .filter(item => item.link)
    .map(item => {
      const rawHtml = item['content:encoded'] || item.content || item.contentSnippet || item.summary || '';
      const summary = stripHtml(rawHtml).slice(0, 220);
      const imageUrl = extractImage(rawHtml) || item.enclosure?.url || null;
      const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date();

      return {
        id: idFor(item.link),
        title: item.title ?? 'Sin título',
        link: item.link,
        source: feed.source,
        summary,
        image_url: imageUrl,
        published_at: publishedAt.toISOString(),
      };
    });
}

async function main() {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  const items = [];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      items.push(...result.value);
    } else {
      console.warn(`No se pudo leer el feed de ${FEEDS[i].source}: ${result.reason}`);
    }
  });

  if (items.length === 0) {
    console.warn('No se obtuvo ninguna noticia de ningún feed — no se toca Supabase.');
    return;
  }

  const { error: upsertError } = await supabase.from('news').upsert(items);
  if (upsertError) throw upsertError;

  const { data: allNews, error: selectError } = await supabase
    .from('news')
    .select('id')
    .order('published_at', { ascending: false });
  if (selectError) throw selectError;

  const toDelete = (allNews ?? []).slice(MAX_ITEMS_KEPT).map(n => n.id);
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase.from('news').delete().in('id', toDelete);
    if (deleteError) throw deleteError;
  }

  console.log(`Sincronizadas ${items.length} noticias nuevas/actualizadas.`);
}

await main();
