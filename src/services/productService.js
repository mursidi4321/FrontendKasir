import axios from "axios";


// const SERVER = "http://localhost:5000/api";
const SERVER = import.meta.env.VITE_API_URL;
const API_URL = `${SERVER}/products`;

export default {
  getAll() {
    return axios.get(API_URL);
  },
  get(id) {
    return axios.get(`${API_URL}/${id}`);
  },
  create(product) {
    console.log("Payload yang dikirim:", product);
    return axios.post(API_URL, product);
  },
  update(id, product) {
    return axios.put(`${API_URL}/${id}`, product);
  },
  delete(id) {
    return axios.delete(`${API_URL}/${id}`);
  },
  search(query) {
    return axios.get(`${API_URL}/search?q=${query}`);
  },
  getNextCode() {
    return axios.get(`${API_URL}/next-code`);
  },
  checkBarcode(barcode) {
    return axios.get(`${API_URL}/check-barcode/${barcode}`);
  },
};

export const getLowStockProducts = async () => {
  const res = await axios.get(`${API_URL}/low-stock`);
  return res.data;
};