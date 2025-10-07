import axios from 'axios';
import { toast } from 'react-toastify';

const httpRequest = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
});

httpRequest.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const errorMessage = error.message || 'Có lỗi xảy ra. Vui lòng thử lại!';
        toast.error(errorMessage);

        return Promise.reject(error);
    },
);

export const get = async (path, options = {}) => {
    const response = await httpRequest.get(path, options);
    return response;
};

export const post = async (path, data = {}, options = {}) => {
  return await httpRequest.post(path, data, options);
};

export const put = async (path, data = {}, options = {}) => {
  return await httpRequest.put(path, data, options);
};

export const del = async (path, options = {}) => {
  return await httpRequest.delete(path, options);
};

export default httpRequest;
