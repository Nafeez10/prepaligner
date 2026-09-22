import { AxiosRequestConfig } from 'axios';
import axiosInstance from '../axios/axiosInstance';

export const swrFetcher = async (url: string, config?: AxiosRequestConfig) => {
  const response = await axiosInstance.get(url, { ...config });
  return response.data;
};
