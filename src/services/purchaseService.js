import axios from 'axios'

// const SERVER = "http://localhost:5000/api";
const SERVER = import.meta.env.VITE_API_URL;
const API_URL = `${SERVER}/purchases`;

export default {
  getAllPurchases() {
    return axios.get(API_URL);
  },
  get(id) {
    return axios.get(`${API_URL}/${id}`);
  },
  create(purchase) {
    return axios.post(API_URL, purchase);
  },
  update(id, purchase) {
    return axios.put(`${API_URL}/${id}`, purchase);
  },
  delete(id) {
    return axios.delete(`${API_URL}/${id}`);
  },
  getPurchaseReport(start, end, supplier = 'a'){
     return axios.get(`${API_URL}/report`, {
      params: {start, end, supplier}
     });

  }
};