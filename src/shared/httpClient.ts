import axios, { AxiosInstance } from 'axios';

export const httpClient: AxiosInstance = axios.create({
  timeout: 1000,
});
