import { get } from '~/lib/httpRequest';

export const getMangaStats = ({ mangaPath, userId }) => get('/mangas/stats', { params: { mangaPath, userId } });
