import { get } from '~/lib/httpRequest';

/** `GET /mangas/stats?mangaPath=&userId=` — views, rating and follow counts. */
export const getMangaStats = ({ mangaPath, userId } = {}) =>
  get('/mangas/stats', { params: { mangaPath, userId } });

