// src/services/cashflowService.js
import axios from "axios";

const SERVER = import.meta.env.VITE_API_URL;
// const SERVER = "http://localhost:5000/api";
const API_URL = `${SERVER}/cashflows`;

export default {
  getAll(start, end) {
    return axios.get(`${API_URL}?start=${start}&end=${end}`);
  },
  get(id) {
    return axios.get(`${API_URL}/${id}`);
  },
  create(data) {
    return axios.post(API_URL, data);
  },
  update(id, data) {
    return axios.put(`${API_URL}/${id}`, data);
  },
  delete(id) {
    return axios.delete(`${API_URL}/${id}`);
  },
};
