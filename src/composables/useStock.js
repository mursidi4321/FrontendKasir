// src/composables/useStock.js
import { ref, computed } from "vue";
import productService from "@/services/productService";

const products = ref([]); // data produk global

const fetchProducts = async () => {
  const res = await productService.getAll();
  products.value = res.data;
};

// Total stok semua produk
const totalStok = computed(() => {
  return products.value.reduce((total, item) => total + item.stock, 0);
});

// Total nilai stok (harga beli * stock)
const totalSubtotal = computed(() => {
  return products.value.reduce(
    (total, item) => total + item.stock * item.purchase_price,
    0
  );
});

export function useStock() {
  return {
    products,
    fetchProducts,
    totalStok,
    totalSubtotal,
  };
}
