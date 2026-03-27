import { get } from '~/lib/httpRequest';

const url = '/recommendations';

const getRecommendationsMangas = ({ userId, limit = 12 }) => get(`${url}/mangas`, { params: { userId, limit } });

const getRecommendationPosts = ({ userId, limit = 12 }) => get(`${url}/posts`, { params: { userId, limit } });

export { getRecommendationsMangas, getRecommendationPosts };
