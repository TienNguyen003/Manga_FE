import { get } from '~/lib/httpRequest';

export const getHomeFeed = ({ userId }) => get('/mangas/home', { params: { userId } });
