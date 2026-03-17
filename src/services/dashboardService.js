import { get } from '~/lib/httpRequest';

export const getDashboard = ({ userId }) => get('/mangas/dashboard', { params: { userId } });
