/**
 * READER SHARE - data source: LOCAL (canvas render + Web Share API)
 *
 * Goal: organic growth. A reader shares the exact page they are on, with a
 * generated card so the link previews with the cover instead of a grey box.
 *
 * No backend needed. The card is drawn on a <canvas> and exported as a data
 * URL; on mobile we prefer `navigator.share` (so the OS sheet is used) and
 * fall back to clipboard.
 */

const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || '';
const CDN_BASE_URL = 'https://sv1.otruyencdn.com/';

const absoluteImageUrl = (thumb) => {
  if (!thumb) return '';
  if (/^https?:\/\//i.test(thumb)) return thumb;
  if (thumb.startsWith('uploads/comics/')) return `${IMG_BASE_URL}${thumb}`;
  return `${CDN_BASE_URL}${thumb}`;
};

const loadImage = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const wrapText = (ctx, text, maxWidth) => {
  const words = String(text || '').split(' ');
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
};
/**
 * Renders an OG-style share card.
 * @returns {Promise<string|null>} PNG data URL
 */
export async function buildShareCard({ title, chapterName, cover, chapterTitle, accent = '#b4232d' }) {
  if (typeof document === 'undefined') return null;

  const width = 1200;
  const height = 630;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#141018');
  bg.addColorStop(1, '#2a1f24');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Cover on the right third
  const coverWidth = 420;
  const coverX = width - coverWidth;
  const image = await loadImage(absoluteImageUrl(cover));
  if (image) {
    const ratio = coverWidth / image.width;
    const drawHeight = Math.min(height, image.height * ratio);
    ctx.drawImage(image, coverX, (height - drawHeight) / 2, coverWidth, drawHeight);
  } else {
    ctx.fillStyle = accent;
    ctx.fillRect(coverX, 0, coverWidth, height);
  }

  // Left-side scrim so text always reads
  const scrim = ctx.createLinearGradient(0, 0, coverX, 0);
  scrim.addColorStop(0, 'rgba(20,16,24,1)');
  scrim.addColorStop(1, 'rgba(20,16,24,0.75)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, coverX, height);

  ctx.fillStyle = '#b4232d';
  ctx.fillRect(80, 132, 76, 10);

  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  ctx.font = '600 30px "Be Vietnam Pro", sans-serif';
  ctx.fillText('DANG DOC TREN COMICS', 80, 108);

  ctx.fillStyle = '#fffaf3';
  ctx.font = '800 62px "Be Vietnam Pro", sans-serif';
  const titleLines = wrapText(ctx, title, coverX - 200).slice(0, 3);
  titleLines.forEach((line, i) => ctx.fillText(line, 80, 236 + i * 72));

  const chapterY = 236 + titleLines.length * 72 + 20;
  ctx.fillStyle = '#ffca7a';
  ctx.font = '700 40px "Be Vietnam Pro", sans-serif';
  ctx.fillText(chapterName ? `Chapter ${chapterName}` : 'Bat dau doc', 80, chapterY);

  if (chapterTitle) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '500 28px "Be Vietnam Pro", sans-serif';
    wrapText(ctx, chapterTitle, coverX - 200)
      .slice(0, 1)
      .forEach((line, i) => ctx.fillText(line, 80, chapterY + 50 + i * 36));
  }

  ctx.fillStyle = '#fff';
  ctx.font = '700 32px "Be Vietnam Pro", sans-serif';
  ctx.fillText('Doc ngay ->', 80, height - 72);

  try {
    return canvas.toDataURL('image/png');
  } catch {
    // Tainted canvas (cross-origin cover without CORS headers).
    return null;
  }
}

export function buildChapterShareUrl({ slug, chapterApiData }) {
  if (typeof window === 'undefined') return '';
  const base = `${window.location.origin}/manga/chapter?slug=${encodeURIComponent(slug || '')}`;
  if (!chapterApiData) return base;
  return `${base}&id=${encodeURIComponent(encodeChapterApiData(chapterApiData))}`;
}

/** Must match the reader's decoder exactly. */
export function encodeChapterApiData(text) {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    return '';
  }
}

export const decodeChapterApiData = (encoded) => {
  try {
    return decodeURIComponent(escape(atob(encoded)));
  } catch {
    return null;
  }
};

export async function copyToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through to the legacy path */
    }
  }
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/** Prefers the OS share sheet, then clipboard. Returns how it was delivered. */
export async function shareChapter(payload) {
  const url = buildChapterShareUrl(payload);
  const text = `${payload.title}${payload.chapterName ? ` - Chapter ${payload.chapterName}` : ''}`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: payload.title, text, url });
      return { ok: true, via: 'native' };
    } catch (err) {
      if (err?.name === 'AbortError') return { ok: false, via: 'cancelled' };
    }
  }

  const copied = await copyToClipboard(url);
  return { ok: copied, via: 'clipboard', url };
}

const shareService = {
  buildShareCard,
  buildChapterShareUrl,
  shareChapter,
  copyToClipboard,
  encodeChapterApiData,
  decodeChapterApiData,
};

export default shareService;
