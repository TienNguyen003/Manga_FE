import axios from 'axios';
import httpRequest from '~/lib/httpRequest';

const BASE_URL = process.env.REACT_APP_SUB_URL;

const url = '/mangas';

export const getLatestMangas = async () => {
  try {
    const res = await httpRequest.get(`${url}/latest`);
    return res;
  } catch (error) {
    console.error('Error fetching manga detail:', error);
  }
};

export const getCategories = async () => {
  try {
    const res = await httpRequest.get(`${url}/categories`);
    return res;
  } catch (error) {
    console.error('Error fetching manga detail:', error);
  }
};

export const getMangasByCategory = async (param) => {
  try {
    const res = await httpRequest.get(`${url}/category`, { params: param });
    return res;
  } catch (error) {
    console.error('Error fetching manga detail:', error);
  }
};

export const getMangasByList = async (param) => {
  try {
    const res = await httpRequest.get(`${url}/list`, { params: param });
    return res;
  } catch (error) {
    console.error('Error fetching manga detail:', error);
  }
};

export const getMangaDetail = async (param) => {
  try {
    const res = await httpRequest.get(`${url}/detail`, { params: param });
    return res;
  } catch (error) {
    console.error('Error fetching manga detail:', error);
  }
};

export const searchMangas = async (param) => {
  try {
    const res = await httpRequest.get(`${url}/search`, { params: param });
    return res;
  } catch (error) {
    console.error('Error fetching manga detail:', error);
  }
};

export const getChappterManga = async (param) => {
  try {
    const res = await axios.get(`${BASE_URL}chapter/${param}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching manga chapter:', error);
    throw error;
  }
};
