import axios from "axios";

// Base URL dari .env
const SERVER = import.meta.env.VITE_API_URL;
const API_URL = `${SERVER}/products`;

export default {
  // Ambil semua produk
  getAll() {
    return axios.get(API_URL);
  },

  // Ambil produk by ID
  get(id) {
    return axios.get(`${API_URL}/${id}`);
  },

  // Tambah produk
  create(product) {
    console.log("Payload dikirim:", product);
    return axios.post(API_URL, product);
  },

  // Update produk
  update(id, product) {
    return axios.put(`${API_URL}/${id}`, product);
  },

  // Soft delete
  delete(id) {
    return axios.delete(`${API_URL}/${id}`);
  },

  // Pencarian produk
  search(query) {
    return axios.get(`${API_URL}/search?q=${query}`);
  },

  // Ambil kode produk otomatis
  getNextCode() {
    return axios.get(`${API_URL}/next-code`);
  },

  // Cek duplikat barcode
  checkBarcode(barcode) {
    return axios.get(`${API_URL}/check-barcode/${barcode}`);
  },

  // Ambil harga sesuai quantity (eceran/grosir otomatis)
  getPrice(id, qty) {
    return axios.get(`${API_URL}/${id}/price?qty=${qty}`);
  }
};

// Produk stok rendah
export const getLowStockProducts = async () => {
  const res = await axios.get(`${API_URL}/low-stock`);
  return res.data;
};
