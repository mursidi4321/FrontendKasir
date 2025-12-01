<template>
  <div class="container mt-5 pt-4">
    <div class="card shadow-sm">
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Detail Produk</h5>
        <router-link :to="{ name: 'ProductList' }" class="btn btn-outline-light btn-sm">
          ← Kembali
        </router-link>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          Memuat data...
        </div>

        <div v-else class="row">
          <!-- Informasi Produk -->
          <div class="col-md-8" v-if="product">
            <div class="row g-2 mb-2" v-for="(value, label) in productFields" :key="label">
              <div class="col-5 text-end fw-bold">{{ label }}</div>
              <div class="col-7">{{ value }}</div>
            </div>
          </div>

          <!-- Gambar Produk -->
          <div class="col-md-4 d-flex justify-content-center align-items-center">
            <img
              :src="product?.id ? `https://picsum.photos/seed/${product.id}/300/300` : 'https://picsum.photos/300/300?grayscale'"
              alt="Gambar Produk"
              class="img-fluid rounded border"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import productService from "@/services/productService";
import { useAlert } from "@/composables/useAlert";

const route = useRoute();
const router = useRouter();
const { error } = useAlert();

const product = ref(null);
const loading = ref(true);

const fetchProduct = async () => {
  try {
    const res = await productService.get(route.params.id);
    product.value = res.data;
  } catch (err) {
    console.error(err);
    error("Gagal memuat data produk");
    router.push({ name: "ProductList" });
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (val) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(val || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
};

// Computed fields aman untuk product null
const productFields = computed(() => {
  if (!product.value) return {};
  return {
    "Kode": product.value.code || "-",
    "Nama": product.value.name || "-",
    "Barcode": product.value.barcode || "-",
    "Tipe": product.value.type === "jasa" ? "Jasa" : "Barang",
    "Harga Beli": formatCurrency(product.value.purchase_price),
    "Harga Jual": formatCurrency(product.value.price),
    "Harga Grosir": formatCurrency(product.value.wholesale_price),
    "Qty Minimum Grosir": product.value.wholesale_min_qty || "-",
    "Stok": product.value.stock != null
      ? `${product.value.stock}${product.value.stock <= product.value.min_stock ? " ⚠" : ""}`
      : "-",
    "Min. Stok": product.value.min_stock ?? "-",
    "Dibuat Pada": formatDate(product.value.created_at),
    ...(product.value.deleted_at ? { "Dihapus Pada": formatDate(product.value.deleted_at) } : {}),
  };
});

onMounted(() => fetchProduct());
</script>

<style scoped>
.row {
  align-items: center;
}
.col-5 {
  white-space: nowrap;
}
img {
  max-height: 300px;
  object-fit: cover;
}
</style>
