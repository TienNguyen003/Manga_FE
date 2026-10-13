/**
 * CONTENT ACCESS MODEL — data source: MOCK rules + LOCAL unlock ledger
 *
 * The backend manga/chapter payloads have NO access field, so the access model
 * is derived deterministically from chapter position. Deterministic matters:
 * the same chapter must always look the same across Comic Detail, the Reader
 * dropdown, the Library and Search — otherwise the paywall flickers.
 *
 * Rules (mock, clearly replaceable):
 *   - the newest N chapters of a serialised comic are PREMIUM (pay-per-chapter)
 *   - a rotating slice further back is EARLY_ACCESS (Premium members only)
 *   - everything else is FREE
 *
 * ⚠️ This is presentation logic. The backend must become the authority before
 * any real charging: add `accessType` + `price` to the chapter DTO and read it
 * here instead of computing it.
 *
 * DATA SOURCE SWAP (future)
 * -------------------------
 * `resolveChapterAccess()` keeps its signature; the body becomes
 * `return { type: dto.accessType ?? 'FREE', price: dto.price ?? 0 }`.
 */
import { readJson, setJson, STORAGE_KEYS } from '~/lib/storage';
import { hashString } from '~/lib/date';
import { isPremium } from '~/services/membershipService';

export const ACCESS_FREE = 'FREE';
export const ACCESS_PREMIUM = 'PREMIUM';
export const ACCESS_EARLY = 'EARLY_ACCESS';

export const ACCESS_META = {
  [ACCESS_FREE]: { label: 'FREE', shortLabel: 'Free', icon: '', tone: 'free' },
  [ACCESS_PREMIUM]: { label: 'PREMIUM', shortLabel: 'Premium', icon: '💎', tone: 'premium' },
  [ACCESS_EARLY]: { label: 'EARLY ACCESS', shortLabel: 'Sớm', icon: '⏩', tone: 'early' },
};

/** Newest chapters gated behind Premium/Coins. */
export const PREMIUM_WINDOW = 3;
/** How many chapters a coin unlock costs. */
export const CHAPTER_COIN_PRICE = 50;

const loadUnlocks = () => readJson(STORAGE_KEYS.CONTENT_ACCESS, { unlocked: [], demo: true }) || { unlocked: [], demo: true };

export const chapterKey = (mangaPath, chapterName) => `${mangaPath}::${chapterName}`;

export function getUnlockedChapters() {
  return loadUnlocks().unlocked || [];
}

export function isChapterUnlocked(mangaPath, chapterName) {
  if (isPremium()) return true;
  return getUnlockedChapters().includes(chapterKey(mangaPath, chapterName));
}

export function unlockChapter(mangaPath, chapterName) {
  const state = loadUnlocks();
  const key = chapterKey(mangaPath, chapterName);
  if ((state.unlocked || []).includes(key)) return true;
  setJson(STORAGE_KEYS.CONTENT_ACCESS, { ...state, unlocked: [...(state.unlocked || []), key] });
  return true;
}

export function lockChapter(mangaPath, chapterName) {
  const state = loadUnlocks();
  const key = chapterKey(mangaPath, chapterName);
  setJson(STORAGE_KEYS.CONTENT_ACCESS, {
    ...state,
    unlocked: (state.unlocked || []).filter((k) => k !== key),
  });
}

/**
 * @param {object} params
 * @param {string} params.mangaPath
 * @param {string} params.chapterName
 * @param {number} params.index         position in the full chapter list (0 = first published)
 * @param {number} params.totalChapters
 * @param {boolean} params.completed    comic finished -> nothing is locked
 */
export function resolveChapterAccess({ mangaPath, chapterName, index = 0, totalChapters = 0, completed = false }) {
  const premium = isPremium();
  const unlocked = Boolean(mangaPath && chapterName) && isChapterUnlocked(mangaPath, chapterName);

  if (premium || unlocked) {
    return { type: ACCESS_FREE, canRead: true, price: 0, reason: premium ? 'PREMIUM_MEMBER' : 'UNLOCKED_WITH_COINS' };
  }

  // A finished comic has nothing to sell — everything stays readable.
  if (completed) {
    return { type: ACCESS_FREE, canRead: true, price: 0, reason: 'COMIC_COMPLETED' };
  }

  const fromEnd = totalChapters - Number(index);
  if (totalChapters > 0 && fromEnd <= PREMIUM_WINDOW) {
    return {
      type: ACCESS_PREMIUM,
      canRead: false,
      price: CHAPTER_COIN_PRICE,
      reason: 'LATEST_CHAPTERS',
    };
  }

  // Rotating early-access slice, stable per comic.
  if (hashString(`${mangaPath}::early`) % 4 === 0 && fromEnd > PREMIUM_WINDOW && fromEnd % 9 === 0) {
    return { type: ACCESS_EARLY, canRead: false, price: 0, reason: 'EARLY_ACCESS' };
  }

  return { type: ACCESS_FREE, canRead: true, price: 0, reason: 'FREE' };
}

/** Comic-level roll-up for cards and detail headers. */
export function summariseComicAccess(chapters = []) {
  const total = chapters.length;
  let premiumCount = 0;
  let earlyCount = 0;

  chapters.forEach((chapter, index) => {
    const access = resolveChapterAccess({
      mangaPath: chapter.mangaPath || '',
      chapterName: chapter.chapter_name,
      index,
      totalChapters: total,
    });
    if (access.type === ACCESS_PREMIUM) premiumCount += 1;
    if (access.type === ACCESS_EARLY) earlyCount += 1;
  });

  return {
    premiumCount,
    earlyCount,
    hasPremium: premiumCount > 0 || earlyCount > 0,
    freeCount: Math.max(0, total - premiumCount - earlyCount),
  };
}

const contentAccessService = {
  ACCESS_FREE,
  ACCESS_PREMIUM,
  ACCESS_EARLY,
  ACCESS_META,
  PREMIUM_WINDOW,
  CHAPTER_COIN_PRICE,
  resolveChapterAccess,
  summariseComicAccess,
  isChapterUnlocked,
  unlockChapter,
  lockChapter,
  getUnlockedChapters,
  chapterKey,
};

export default contentAccessService;
