import { get } from '~/lib/httpRequest';

const url = '/mangas/recommendations';

export const getRecommendations = ({ userId, limit = 12 }) => get(url, { params: { userId, limit } });
