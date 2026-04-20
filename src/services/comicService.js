import httpRequest from '~/lib/httpRequest';

const url = "/comics";

export const comicService = {
  createComic: async (data) => {
    return httpRequest.post(`${url}`, data); // data: { title, slug, description, cover, genre }
  },
  updateComic: async (comicId, data) => {
    return httpRequest.put(`${url}/${comicId}`, data); // data: { title, slug, description, cover, genre }
  },
  getComics: async (params) => {
    return httpRequest.get(`${url}`, { params }); // params: { page, size, genre, status }
  },
  getComic: async (comicId) => {
    return httpRequest.get(`${url}/${comicId}`);
  },
  getMyComics: async (params) => {
    return httpRequest.get(`${url}/my-comics`, { params }); // params: { userId }
  },
};
