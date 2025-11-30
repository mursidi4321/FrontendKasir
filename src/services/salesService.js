// src/services/salesService.js
import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL + "/sales";
// const SERVER = "http://localhost:5000/api";
const SERVER = import.meta.env.VITE_API_URL;
const API_URL = `${SERVER}/sales`;

export default {
  getAll() {
    return axios.get(API_URL);
  },
  get(id) {
    return axios.get(`${API_URL}/${id}`);
  },
  create(sale) {
    return axios.post(API_URL, sale);
  },
  update(id, sale) {
    return axios.put(`${API_URL}/${id}`, sale);
  },
  delete(id) {
    return axios.delete(`${API_URL}/${id}`);
  },
};
