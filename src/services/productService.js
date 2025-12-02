import axios from "axios";

// Base URL
const SERVER = import.meta.env.VITE_API_URL;
const API_URL = `${SERVER}/products`;
const UPLOAD_URL = `${SERVER}/upload/product-image`;

export default {
  // Ambil semua produk
  getAll() {
    return axios.get(API_URL);
  },

  // Ambil 1 produk by ID
  get(id) {
    return axios.get(`${API_URL}/${id}`);
  },

  // Tambah produk
  create(product) {
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

  // Cari produk
  search(query) {
    return axios.get(`${API_URL}/search?q=${query}`);
  },

  // Kode otomatis
  getNextCode() {
    return axios.get(`${API_URL}/next-code`);
  },

  // Cek barcode
  checkBarcode(barcode) {
    return axios.get(`${API_URL}/check-barcode/${barcode}`);
  },

  // Ambil harga berdasarkan qty (ecer/grosir)
  getPrice(id, qty) {
    return axios.get(`${API_URL}/${id}/price?qty=${qty}`);
  },

  // Upload gambar produk → menerima file
  uploadImage(file) {
    const form = new FormData();
    form.append("image", file);

    return axios.post(UPLOAD_URL, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
};

// Produk stok rendah
export const getLowStockProducts = async () => {
  const res = await axios.get(`${API_URL}/low-stock`);
  return res.data;
};
