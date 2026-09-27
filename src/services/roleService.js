import httpRequest from '~/lib/httpRequest';

const url = '/roles';

export const roleService = {
  getRoleList: async (params) => {
    return httpRequest.get(url, { params }); // page, size, name
  },
  getAllRole: async () => {
    return httpRequest.get(url);
  },
  getRole: async (params) => {
    return httpRequest.get(`${url}/role`, { params }); // name
  },
  createRole: async (data) => {
    return httpRequest.post(`${url}`, data); // name, description
  },
  updateRole: async (name, data) => {
    return httpRequest.put(`${url}?name=${name}`, data); // 
  },
  deleteRole: async (name) => {
    return httpRequest.delete(`${url}?name=${name}`);
  }
};
