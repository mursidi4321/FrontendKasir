
import axios from "axios";

const SERVER = import.meta.env.VITE_API_URL;

// Instance axios khusus upload
const api = axios.create({
  baseURL: SERVER
});

export default {
  uploadProductImage(file) {
    const form = new FormData();
    form.append("image", file);

    return api.post("/upload/product-image", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
};
