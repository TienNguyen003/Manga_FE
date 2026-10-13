/**
 * MANGA CATALOG
 *
 * ⚠️ `page` is 0-BASED for every endpoint here (Rule 2). `result` is a plain
 * array unless noted.
 *
 *   GET /mangas/latest?limit=
 *   GET /mangas/home?userId=      -> ONE call for the home page:
 *                                     trending + latest + top rated
 *   GET /mangas/categories        -> data.result = Category[]
 *   GET /mangas/category?path=&page=
 *        `path` accepts a category slug OR one of the pseudo-categories
 *        `tat-ca` / `latest` / `trending` / `manhwa` / `adult` /
 *        `completed`
 *   GET /mangas/list?page=&size=&sort=
 *   GET /mangas/search?keyword=&page=&limit=&category=&status=
 *   GET /mangas/detail?path=      ⚠️ chapters are NESTED:
 *        data.result.chapters[0].server_data  <- the array the UI needs
 *
 * Errors are NOT swallowed here. Every caller renders an empty state or an
 * error message, and a silent `undefined` makes those two states
 * indistinguishable.
 */
import { get, unwrapList } from '~/lib/httpRequest';

const url = '/mangas';

/** Newest manga. */
export const getLatestMangas = ({ limit = 20 } = {}) => get(`${url}/latest`, { params: { limit } });

/** Everything the home page needs in a single request. */
export const getHomeFeed = ({ userId } = {}) => get(`${url}/home`, { params: { userId } });

/** Category chips for the nav. `page` is 0-based. */
export const getCategories = () => get(`${url}/categories`);

/** `path` may be a category slug or a pseudo-category (see header). */
export const getMangasByCategory = ({ path, page = 0, ...rest } = {}) =>
  get(`${url}/category`, { params: { path, page, ...rest } });

/** Full catalogue listing. NOTE: this endpoint uses `size`, not `limit`. */
export const getMangasByList = ({ page = 0, size = 20, sort } = {}) =>
  get(`${url}/list`, { params: { page, size, sort } });

export const searchMangas = ({ keyword, page = 0, limit = 20, category, status } = {}) =>
  get(`${url}/search`, { params: { keyword, page, limit, category, status } });

/** Accepts either `path` or `slug` — both are supported server-side. */
export const getMangaDetail = ({ path, slug } = {}) => get(`${url}/detail`, { params: { path: path ?? slug } });

/* ------------------------------------------------------------------ *
 * Shape helpers — the nested `server_data` is the #1 source of bugs
 * ------------------------------------------------------------------ */

/**
 * The chapter array the UI actually renders.
 * `detail.chapters` is `[{ server_data: Chapter[] }]` — one level of nesting
 * that is easy to forget and produces `undefined.map(...)` when missed.
 */
export function extractChapters(detail) {
  const chapters = detail?.chapters;
  if (!Array.isArray(chapters)) return [];
  return chapters[0]?.server_data ?? [];
}

/** Detail + flattened chapters in one call. */
export async function fetchMangaDetail(params) {
  const { data } = await getMangaDetail(params);
  const detail = data?.result ?? null;
  return { ...detail, chapterList: extractChapters(detail) };
}

/** Convenience: just the list, safe against a null `result`. */
export async function fetchCategories() {
  const { data } = await getCategories();
  return unwrapList({ data });
}

