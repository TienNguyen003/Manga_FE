import httpRequest from '~/lib/httpRequest';

export const reportService = {
  async sendReport(data) {
    return httpRequest.post('/report', data);
  },
};
