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
    return httpRequest.get(`${url}`, { params }); // params: { page, limit, genre, status }
  },
  getComic: async (comicId) => {
    return httpRequest.get(`${url}/${comicId}`);
  },
  getMyComics: async (params) => {
    return httpRequest.get(`${url}/my-comics`, { params }); // params: { userId }
  },
  deleteComic: async (comicId) => {
    return httpRequest.delete(`${url}/${comicId}`);
  },

  createChapter: async (comicId, data) => {
    return httpRequest.post(`${url}/${comicId}/chapters`, data); // data: { title, chapterNumber, content, published }
  },
  updateChapter: async (comicId, chapterId, data) => {
    return httpRequest.put(`${url}/${comicId}/chapters/${chapterId}`, data); // data: { title, chapterNumber, content, published }
  },
  getChapters: async (comicId, params) => {
    return httpRequest.get(`${url}/${comicId}/chapters`, { params }); // params: { page, limit }
  },
  getChapter: async (comicId, chapterId) => {
    return httpRequest.get(`${url}/${comicId}/chapters/${chapterId}`);
  },
  deleteChapter: async (comicId, chapterId) => {
    return httpRequest.delete(`${url}/${comicId}/chapters/${chapterId}`);
  }
};
