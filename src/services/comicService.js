import httpRequest from '~/lib/httpRequest';

export const comicService = {
  async uploadComic(data) {
    return httpRequest.post('/comic/upload', data);
  },
  async getMyComics() {
    return httpRequest.get('/comic/my');
  },
  async getRecommendations() {
    return httpRequest.get('/recommendation');
  },
};
