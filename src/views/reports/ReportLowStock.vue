<template>
  <div class="container mt-4 pt-5">
    <!-- Sticky Header Judul -->
    <div
      class="d-flex justify-content-between align-items-center sticky-header mb-2"
    >
      <h4 class="mb-0">📦 Laporan Stok Minimum</h4>
      <button @click="exportToExcel" class="btn btn-success btn-sm">
        <i class="bi bi-file-earmark-excel-fill me-1"></i> Export Excel
      </button>
    </div>

    <!-- Tabel Stok -->
    <div class="table-responsive shadow-sm border rounded">
      <table
        class="table table-sm table-hover table-bordered align-middle mb-0"
      >
        <thead class="table-light text-center">
          <tr>
            <th>Kode</th>
            <th>Nama Produk</th>
            <th>Stok</th>
            <th>Min Stok</th>
            <th>Order</th>
            <th class="text-end">Subtotal</th>
            <th>Status</th>
            <th style="width: 80px">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in products"
            :key="item.id"
            :class="{ 'table-danger': item.stock < item.min_stock }"
          >
            <td class="text-center">{{ item.code }}</td>
            <td>{{ item.name }}</td>
            <td class="text-center">{{ item.stock }}</td>
            <td class="text-center">{{ item.min_stock }}</td>
            <td>
              <input
                v-model.number="item.order"
                type="number"
                min="0"
                class="form-control form-control-sm text-center"
              />
            </td>
            <td class="text-end">
              {{ formatRupiah((item.order || 0) * item.purchase_price) }}
            </td>
            <td class="text-center">
              <span
                :class="[
                  'badge',
                  item.stock < item.min_stock ? 'bg-danger' : 'bg-success',
                ]"
              >
                {{ item.stock < item.min_stock ? "Kurang" : "Cukup" }}
              </span>
            </td>
            <td class="text-center">
              <button
                class="btn btn-sm btn-danger"
                @click="removeItem(index)"
                title="Hapus"
              >
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-if="products.length === 0">
            <td colspan="8" class="text-center text-muted py-3">
              Tidak ada produk.
            </td>
          </tr>
          <tr v-else class="table-light fw-bold">
            <td colspan="5" class="text-end">Total Nilai Order</td>
            <td class="text-end">
              {{ formatRupiah(totalSubtotal) }}
            </td>
            <td colspan="2"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getLowStockProducts } from "@/services/productService";
import * as XLSX from "xlsx";

const products = ref([]);

onMounted(async () => {
  const data = await getLowStockProducts();

  // FIX UTAMA → convert purchase_price ke number & set order default
  products.value = data
    .map((item) => ({
      ...item,
      purchase_price: Number(item.purchase_price) || 0,
      order: 0,
    }))
    .sort((a, b) => a.stock - b.stock);
});

// Hapus item
function removeItem(index) {
  products.value.splice(index, 1);
}

// Perhitungan total subtotal (aman dari NaN)
const totalSubtotal = computed(() =>
  products.value.reduce(
    (t, item) =>
      t + (Number(item.order) || 0) * (Number(item.purchase_price) || 0),
    0
  )
);

// Format rupiah
function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);
}

// Export Excel
function exportToExcel() {
  const exportData = products.value.map((item) => ({
    Kode: item.code,
    Nama: item.name,
    Stok: item.stock,
    "Min Stok": item.min_stock,
    "Harga Beli": item.purchase_price,
    Order: item.order || 0,
    Subtotal: (Number(item.order) || 0) * (Number(item.purchase_price) || 0),
    Status: item.stock < item.min_stock ? "Kurang" : "Cukup",
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Stok Minimum");

  XLSX.writeFile(
    workbook,
    `Laporan_Stok_Minimum_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}
</script>

<style scoped>
.sticky-header {
  position: sticky;
  top: 56px; /* tinggi navbar */
  z-index: 1020;
  background-color: white;
  padding: 12px 0;
}

.sticky-thead th {
  position: sticky;
  top: 96px; /* 56 (navbar) + 40 (header judul) */
  background-color: #f8f9fa !important;
  z-index: 1010;
  box-shadow: inset 0 -1px 0 #dee2e6;
}
</style>
