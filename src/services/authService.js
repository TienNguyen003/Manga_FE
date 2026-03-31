import { get, post, del } from '~/lib/httpRequest';

const url = '/auth';

export const login = (data) => post(`${url}/token`, data);

export const checkToken = (data) => get(`${url}/introspect`, data);

export const refreshToken = (data) => get(`${url}/refresh`, data);

export const logout = (data) => get(`${url}/logout`, data);
