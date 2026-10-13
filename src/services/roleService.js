import { get, post, put, del } from '~/lib/httpRequest';

const url = '/roles';

export const roleService = {
  /** `GET /roles?name=` — `size`, not `limit`. */
  getRoleList: ({ page = 0, size = 20, name } = {}) => get(url, { params: { page, size, name } }),

  /** `GET /roles/all` — every role, unpaginated. */
  getAllRole: () => get(`${url}/all`),

  /** `GET /roles/role?name=` */
  getRole: ({ name } = {}) => get(`${url}/role`, { params: { name } }),

  createRole: (data) => post(url, data),

  updateRole: (name, data) => put(url, data, { params: { name } }),

  deleteRole: (name) => del(url, { params: { name } }),
};

export default roleService;

