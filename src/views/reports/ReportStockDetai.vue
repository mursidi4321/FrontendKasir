<template>
  <div>
    <!-- Total Nilai Stok Floating -->
    <div class="fixed-total text-end fw-bold">
      <div class="bg-white px-3 py-2 shadow-sm rounded border">
        Total Nilai Stok: <span>{{ formatNumber(totalSubtotal) }}</span>
      </div>
    </div>

    <div class="container mt-5 pt-4">
      <div class="card shadow-sm">
        <div
          class="card-header bg-primary text-white d-flex justify-content-between align-items-center"
        >
          <h5 class="mb-0">Laporan Stok Barang</h5>
          <button class="btn btn-success btn-sm" @click="exportToExcel">
            📤 Export ke Excel
          </button>
        </div>

        <div class="table-responsive">
          <table class="table table-hover table-striped table-sm mb-0">
            <thead class="table-light">
              <tr>
                <th>No.</th>
                <th>Kode</th>
                <th>Nama</th>
                <th>Barcode</th>
                <th class="text-end">Harga Beli</th>
                <th class="text-end">Harga Jual</th>
                <th class="text-end">Stok</th>
                <th class="text-end">Sub Total</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(product, index) in paginatedProducts"
                :key="product.id"
              >
                <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td>{{ product.code }}</td>
                <td>{{ product.name }}</td>
                <td>{{ product.barcode }}</td>
                <td class="text-end">
                  {{ formatNumber(product.purchase_price) }}
                </td>
                <td class="text-end">{{ formatNumber(product.price) }}</td>
                <td class="text-end">
                  <span
                    :class="{
                      'text-danger fw-bold': product.stock <= product.min_stock,
                    }"
                  >
                    {{ product.stock }}
                  </span>
                  <small
                    v-if="product.stock <= product.min_stock"
                    class="text-danger ms-1"
                    title="Stok minimal tercapai"
                  >
                    &#9888;
                  </small>
                </td>
                <td class="text-end">
                  {{ formatNumber(product.stock * product.purchase_price) }}
                </td>
              </tr>

              <tr v-if="paginatedProducts.length === 0">
                <td colspan="8" class="text-center text-muted">
                  Tidak ada data produk
                </td>
              </tr>

              <tr v-else class="table-light fw-bold">
                <td colspan="7" class="text-end">Total Nilai Stok</td>
                <td class="text-end">{{ formatNumber(totalSubtotal) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center p-2">
          <small>Halaman {{ currentPage }} dari {{ totalPages }}</small>
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage = 1">«</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage--">‹</button>
              </li>
              <li
                v-for="page in totalPages"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <button class="page-link" @click="currentPage = page">
                  {{ page }}
                </button>
              </li>
              <li
                class="page-item"
                :class="{ disabled: currentPage === totalPages }"
              >
                <button class="page-link" @click="currentPage++">›</button>
              </li>
              <li
                class="page-item"
                :class="{ disabled: currentPage === totalPages }"
              >
                <button class="page-link" @click="currentPage = totalPages">
                  »
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import productService from "@/services/productService";
import * as XLSX from "xlsx";

const products = ref([]);

const currentPage = ref(1);
const itemsPerPage = 9;

const totalPages = computed(() => {
  return Math.ceil(products.value.length / itemsPerPage);
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return products.value.slice(start, start + itemsPerPage);
});

const fetchProducts = async () => {
  const res = await productService.getAll();
  products.value = res.data;
};

// Format angka tanpa simbol "Rp"
const formatNumber = (val) => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
  }).format(val);
};

const totalSubtotal = computed(() => {
  return products.value.reduce((total, item) => {
    return total + item.stock * item.purchase_price;
  }, 0);
});

const exportToExcel = () => {
  const data = products.value.map((item, index) => ({
    No: index + 1,
    Kode: item.code,
    Nama: item.name,
    Barcode: item.barcode,
    "Harga Beli": item.purchase_price,
    "Harga Jual": item.price,
    Stok: item.stock,
    "Sub Total": item.stock * item.purchase_price,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Stok Barang");

  XLSX.writeFile(workbook, "laporan-stok-barang.xlsx");
};

onMounted(fetchProducts);
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}

.fixed-total {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1100;
}

.fixed-total > div {
  background-color: white;
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

@media (max-width: 768px) {
  .fixed-total {
    top: 100px;
    right: 10px;
  }

  .fixed-total > div {
    font-size: 13px;
    padding: 6px 10px;
  }
}

.pagination .page-link {
  cursor: pointer;
}
</style>
