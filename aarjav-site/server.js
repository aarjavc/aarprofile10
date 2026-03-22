/* global process */
import express from 'express';

const app = express();
const port = process.env.PORT || 5174;

const TRACK_URLS = [
  'https://soundcloud.com/aarjavchauhan/uphill',
  'https://soundcloud.com/aarjavchauhan/im-just-too-without-you',
  'https://soundcloud.com/aarjavchauhan/away',
  'https://soundcloud.com/aarjavchauhan/balance',
  'https://soundcloud.com/aarjavchauhan/nearly-there',
  'https://soundcloud.com/aarjavchauhan/bittersweet-memories',
];

app.get('/api/img', async (req, res) => {
  const url = req.query.url;
  if (!url || typeof url !== 'string') {
    return res.status(400).send('Missing url query param');
  }

  // In some environments, server-side image proxying fails (network restrictions).
  // For <img> tags, CORS isn't required, so we can safely redirect the browser
  // directly to the SoundCloud CDN.
  try {
    const parsed = new URL(url);
    const isSoundCloudCdn = parsed.hostname.endsWith('sndcdn.com');
    if (!isSoundCloudCdn) {
      return res.status(400).send('Unapproved image host');
    }

    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.redirect(302, url);
  } catch {
    return res.status(400).send('Invalid image url');
  }
});

app.get('/api/sc-artworks', async (_req, res) => {
  try {
    const results = await Promise.all(
      TRACK_URLS.map(async (trackUrl) => {
        try {
          const oembedUrl = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(trackUrl)}`;
          const resp = await fetch(oembedUrl, {
            headers: {
              'User-Agent': 'aarjav-site-local',
            },
          });

          if (!resp.ok) {
            throw new Error('oEmbed request failed');
          }

          const data = await resp.json();

          const title = typeof data?.title === 'string' ? data.title : trackUrl;
          const thumb = typeof data?.thumbnail_url === 'string' ? data.thumbnail_url : null;
          const upgradedThumb = thumb ? thumb.replace(/-(t\d+x\d+)\./, '-original.') : null;

          // Some oEmbed payloads don't include `thumbnail_url`. As a fallback,
          // try extracting a media image URL from the `html` field.
          const html = typeof data?.html === 'string' ? data.html : '';
          const imgMatch = html.match(
            /https?:\/\/[^"'\\s>]+\.(?:jpg|jpeg|png|webp)(?:\\?[^"'\\s>]*)?/i
          );

          // Prefer the provided thumbnail_url (it should exist reliably).
          // Only use the upgraded thumbnail URL if thumbnail_url is missing.
          const rawArtworkUrl = thumb || upgradedThumb || imgMatch?.[0] || null;
          const artworkUrl = rawArtworkUrl
            ? `/api/img?url=${encodeURIComponent(rawArtworkUrl)}`
            : '';

          return { title, artworkUrl, trackUrl };
        } catch {
          return { title: trackUrl, artworkUrl: '', trackUrl };
        }
      })
    );

    return res.json(results);
  } catch {
    return res.json([]);
  }
});

app.get('/api/sc-oembed', async (req, res) => {
  try {
    const trackUrl = req.query.url;
    if (!trackUrl || typeof trackUrl !== 'string') {
      return res.status(400).json({ error: 'Missing url query param' });
    }

    const oembedUrl = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(trackUrl)}`;
    const resp = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'aarjav-site-local',
      },
    });

    if (!resp.ok) {
      return res.status(502).json({ error: `SoundCloud oEmbed failed: ${resp.status}` });
    }

    const data = await resp.json();

    const thumb = typeof data?.thumbnail_url === 'string' ? data.thumbnail_url : null;
    const upgradedThumb = thumb ? thumb.replace(/-(t\d+x\d+)\./, '-original.') : null;

    const html = data?.html || '';
    const imgMatch = html.match(/https?:\/\/[^"'\s>]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s>]*)?/i);
    // Prefer the provided thumbnail_url (it should exist reliably).
    // Only use the upgraded thumbnail URL if thumbnail_url is missing.
    const artworkUrl = thumb || upgradedThumb || imgMatch?.[0] || null;

    return res.json({ artworkUrl, oembed: data });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
