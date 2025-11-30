<template>
  <div class="container mt-5 pt-4">
    <!-- Header -->
    <div
      class="d-flex justify-content-between flex-wrap gap-2 mb-3 align-items-center bg-white sticky-top py-3"
      style="top: 56px; z-index: 1020; border-bottom: 1px solid #eee"
    >
      <h3 class="mb-0">Daftar Produk</h3>

      <div class="d-flex gap-2 align-items-center flex-wrap">
        <input
          v-model="searchQuery"
          type="text"
          ref="searchInput"
          class="form-control form-control-sm"
          placeholder="Cari kode / barcode / nama"
          style="width: 220px"
        />

        <select
          v-model="stockFilter"
          class="form-select form-select-sm"
          style="width: 180px"
        >
          <option value="all">Semua Produk</option>
          <option value="low">Stok Rendah (≤ Min)</option>
          <option value="high">Stok Tertinggi</option>
        </select>

        <router-link to="/products/create" class="btn btn-success btn-sm">
          <i class="bi bi-plus-lg"></i> Tambah
        </router-link>
      </div>
    </div>

    <!-- Tidak Ditemukan -->
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
      v-else
      :products="filteredProducts"
      @edit="editProduct"
      @delete="deleteProduct"
      @order="orderProduct"
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
const { confirmDelete, success, info } = useAlert();
const searchInput = ref(null);

// State
const products = ref([]);
const searchQuery = ref("");
const stockFilter = ref("all");
const alertShown = ref(false);

// Ambil data produk
const fetchProducts = async () => {
  const res = await productService.getAll();
  products.value = res.data;
};

// Filter produk berdasarkan stok & pencarian
const filteredProducts = computed(() => {
  let result = [...products.value];

  // Filter stok
  if (stockFilter.value === "low") {
    result = result.filter((p) => p.stock <= p.min_stock);
  } else if (stockFilter.value === "high") {
    result = result.sort((a, b) => b.stock - a.stock);
  }

  // Pencarian
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.barcode ?? "").toLowerCase().includes(q)
    );
  }

  return result;
});

// Aksi Produk
const editProduct = (product) => {
  router.push({ name: "ProductEdit", params: { id: product.id } });
  // router.push({ name: "ProductEdit" });
  // router.push('/products')
};

const deleteProduct = async (id) => {
  const confirm = await confirmDelete(
    "Produk akan dihapus dan tidak bisa dikembalikan!"
  );
  if (confirm.isConfirmed) {
    await productService.delete(id);
    await fetchProducts();
    success("Produk dihapus");
  }
};

const orderProduct = (product) => {
  alert(`Order untuk: ${product.name}`);
};

// Tawarkan tambah produk jika tidak ditemukan
const askToAddProduct = async (keyword) => {
  const confirm = await info(
    `Produk "${keyword}" tidak ditemukan. Tambahkan sekarang?`,
    "Tambah Produk?"
  );
  if (confirm.isConfirmed) {
    // router.push({ name: "ProductCreate", query: { name: keyword } });
    router.push({ name: "ProductCreate" });
    // router.push('/products')
  }
  setTimeout(() => (alertShown.value = false), 1000);
};

// Watcher pencarian
watch(searchQuery, (val) => {
  if (val.trim() && filteredProducts.value.length === 0 && !alertShown.value) {
    alertShown.value = true;
    // askToAddProduct(val); // aktifkan jika ingin fitur prompt tambah
  }
});

onMounted(async () => {
  await fetchProducts();

  setTimeout(() => {
    searchInput.value?.focus();
  }, 50);
});
</script>
