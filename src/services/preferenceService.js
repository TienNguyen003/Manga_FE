import { get, put } from '~/lib/httpRequest';

const url = '/mangas/preferences';

export const getPreferences = ({ userId }) => get(url, { params: { userId } });

export const updatePreferences = (data) => put(url, data);
