<template>
  <div class="container mt-5 pt-4">
    <!-- Header -->
    <div
      class="d-flex justify-content-between flex-wrap gap-2 mb-3 align-items-center bg-white sticky-top py-3"
      style="top: 56px; z-index: 1020; border-bottom: 1px solid #eee"
    >
      <h3 class="mb-0">Daftar Produk</h3>

      <div class="d-flex gap-2 align-items-center flex-wrap">
        <!-- Pencarian -->
        <input
          v-model="searchQuery"
          type="text"
          ref="searchInput"
          class="form-control form-control-sm"
          placeholder="Cari kode / barcode / nama"
          style="width: 220px"
        />

        <!-- Filter stok -->
        <select
          v-model="stockFilter"
          class="form-select form-select-sm"
          style="width: 180px"
        >
          <option value="all">Semua Produk</option>
          <option value="low">Stok Rendah (≤ Min Stok)</option>
          <option value="high">Stok Tertinggi</option>
        </select>

        <!-- Tambah -->
        <router-link to="/products/create" class="btn btn-success btn-sm">
          <i class="bi bi-plus-lg"></i> Tambah
        </router-link>
      </div>
    </div>

    <!-- Jika hasil pencarian kosong -->
    <div
      v-if="filteredProducts.length === 0 && searchQuery"
      class="alert alert-warning d-flex justify-content-between align-items-center"
    >
      <div>
        Tidak ditemukan produk untuk pencarian: "<strong>{{
          searchQuery
        }}</strong
        >"
      </div>

      <router-link to="/products/create" class="btn btn-sm btn-outline-primary">
        ➕ Tambah Produk Baru
      </router-link>
    </div>

    <!-- Tabel Produk -->
    <ProductTable
      :products="filteredProducts"
      @view="viewProduct"
      @edit="editProduct"
      @delete="deleteProduct"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import ProductTable from "@/components/ProductTable.vue";
import productService from "@/services/productService";
import { useAlert } from "@/composables/useAlert";

const router = useRouter();
const { confirmDelete, success } = useAlert();

// State
const products = ref([]);
const searchQuery = ref("");
const stockFilter = ref("all");
const searchInput = ref(null);

// Ambil produk dari API
const fetchProducts = async () => {
  const res = await productService.getAll();
  products.value = res.data;
};

// Filter produk
const filteredProducts = computed(() => {
  let list = [...products.value];

  // Filter stok
  if (stockFilter.value === "low") {
    list = list.filter((p) => p.stock <= p.min_stock);
  } else if (stockFilter.value === "high") {
    list = list.sort((a, b) => b.stock - a.stock);
  }

  // Filter pencarian
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.barcode ?? "").toLowerCase().includes(q)
    );
  }

  return list;
});

// Aksi
const editProduct = (product) => {
  router.push({ name: "ProductEdit", params: { id: product.id } });
};

const deleteProduct = async (id) => {
  const confirm = await confirmDelete(
    "Produk akan dihapus dan tidak dapat dikembalikan!"
  );
  if (confirm.isConfirmed) {
    await productService.delete(id);
    await fetchProducts();
    success("Produk berhasil dihapus");
  }
};

const viewProduct = (product) => {
  router.push({ name: "ProductDetail", params: { id: product.id } });
};

// Mounted
onMounted(async () => {
  await fetchProducts();

  setTimeout(() => {
    searchInput.value?.focus();
  }, 100);
});
</script>
