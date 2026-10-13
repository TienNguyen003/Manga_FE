/**
 * CHAPTER CONTENT + PAYWALL (Rule 5)
 *
 * `GET /chapter/{chapterId}` is the ONLY authority on whether a chapter can be
 * read. The frontend never derives access from its own state.
 *
 * Success shape:
 *   data.result.data.item = { chapter_name, chapter_title, chapter_image[], comic_name, chapter_path, chapter_num }
 *
 * Locked shape — a 403 `PAYWALL_LOCKED` that STILL CARRIES a payload:
 *   err.response.data.result = { accessType, price, chapterName, mangaPath }
 *
 * The paywall modal must read `accessType` / `price` from that error payload,
 * never from client state — the client has no way to know the real price.
 */
import { get, post, errorCode } from '~/lib/httpRequest';

const url = '/chapter';

/** Full chapter payload, including `chapter_api_data` used for prev/next. */
export const getChapter = (chapterId) => get(`${url}/${chapterId}`);

/** Convenience: the inner `item` the reader actually renders. */
export async function getChapterItem(chapterId) {
  const { data } = await getChapter(chapterId);
  return data?.result?.data?.item ?? null;
}

/** True when the request failed specifically because the chapter is paid. */
export const isPaywalled = (error) => errorCode(error) === 'PAYWALL_LOCKED';

/** The paywall payload the backend attached to the 403. */
export const paywallPayload = (error) => error?.response?.data?.result ?? null;

/**
 * Open a chapter by spending coins. Idempotent on the server:
 *   `true`  -> just unlocked, coins were deducted
 *   `false` -> already unlocked, nothing was charged
 *
 * NOTE: the backend currently trusts the client-supplied `price` and has not yet
 * moved to a server-side lookup, so the correct real price from the
 * PAYWALL_LOCKED payload must be sent. When that is fixed the field is ignored.
 */
export async function unlockChapter(chapterId, price) {
  const { data } = await post('/wallet/unlock-chapter', { chapterId, price });
  return Boolean(data?.result);
}

/** Number of coins a chapter costs — server-provided, never hard-coded. */
export const getWalletOverview = (limit = 10) => get('/wallet/overview', { params: { limit } });
