<template>
  <div class="container mt-5 pt-4">
    <h4 class="mb-4">📊 Dashboard Laporan</h4>

    <div class="row g-3 d-flex justify-content-center align-items-center">
      <!-- Total Penjualan -->
      <div class="col-md-3 col-6">
        <div class="card border-0 shadow-sm bg-light h-100">
          <div class="card-body text-center">
            <div class="fs-3 mb-2">🛒</div>
            <div class="fw-bold">Total Penjualan</div>
            <h5 class="mt-2 text-primary">
              Rp {{ formatCurrency(data.sales) }}
            </h5>
          </div>
          <div class="card-footer text-center bg-white border-top mt-auto">
            <router-link to="/reports/sales" class="text-decoration-none small">
              📈 Detail Laporan Penjualan
            </router-link>
          </div>
        </div>
      </div>

      <!-- Total Pembelian -->
      <div class="col-md-3 col-6">
        <div class="card border-0 shadow-sm bg-light h-100 d-flex flex-column">
          <div class="card-body text-center">
            <div class="fs-3 mb-2">📥</div>
            <div class="fw-bold">Total Pembelian</div>
            <h5 class="mt-2 text-warning">
              Rp {{ formatCurrency(data.purchases) }}
            </h5>
          </div>
          <div class="card-footer text-center bg-white border-top mt-auto">
            <router-link
              to="/reports/purchases"
              class="text-decoration-none small"
            >
              ➕ Lihat Detail
            </router-link>
          </div>
        </div>
      </div>

      <!-- Laba Bersih -->
      <div class="col-md-3 col-6">
        <div class="card border-0 shadow-sm bg-light h-100 d-flex flex-column">
          <div class="card-body text-center">
            <div class="fs-3 mb-2">💵</div>
            <div class="fw-bold">Laba Bersih</div>
            <h5 class="mt-2 text-success">
              Rp {{ formatCurrency(data.profit) }}
            </h5>
          </div>
          <div class="card-footer text-center bg-white border-top mt-auto">
            <router-link
              to="/reports/profit-loss"
              class="text-decoration-none small"
            >
              📈 Detail Laporan
            </router-link>
          </div>
        </div>
      </div>

      <!-- Stok Menipis -->
      <div class="col-md-3 col-6">
        <div class="card border-0 shadow-sm bg-light h-100">
          <div class="card-body text-center">
            <div class="fs-3 mb-2">⚠️</div>
            <div class="fw-bold">Stok Menipis</div>
            <h5 class="mt-2 text-danger">{{ data.lowStock }} Produk</h5>
          </div>
          <div class="card-footer text-center bg-white border-top mt-auto">
            <router-link
              to="/reports/low-stock"
              class="text-decoration-none small"
            >
              📈 Detail Stock Menipis
            </router-link>
          </div>
        </div>
      </div>

      <!-- Total Nilai Stok -->
      <div class="col-md-3 col-6">
        <div class="card border-0 shadow-sm bg-light h-100">
          <div class="card-body text-center">
            <div class="fs-3 mb-2">📦</div>
            <div class="fw-bold">Total Nilai Stok</div>
            <h5 class="mt-2 text-danger">
              Rp {{ formatCurrency(totalSubtotal) }}
            </h5>
          </div>
          <div class="card-footer text-center bg-white border-top mt-auto">
            <router-link
              to="/reports/stocks"
              class="text-decoration-none small"
            >
              📈 Laporan Stock
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-3 col-6">
        <div class="card border-0 shadow-sm bg-light h-100">
          <div class="card-body text-center">
            <div class="fs-3 mb-2">📦</div>
            <div class="fw-bold">Products Terlaris</div>
            <h5 class="mt-2 text-danger">0</h5>
          </div>
          <div class="card-footer text-center bg-white border-top mt-auto">
            <router-link
              to="/reports/top-seller"
              class="text-decoration-none small"
            >
              📈 Detail Products Terlarisaris
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getDashboardReport } from "@/services/reportService";
import { formatCurrency } from "@/utils/formatter";
import { useStock } from "@/composables/useStock";

const { fetchProducts, totalStok, totalSubtotal } = useStock();

const data = ref({
  sales: 0,
  purchases: 0,
  profit: 0,
  lowStock: 0,
});

onMounted(async () => {
  await fetchProducts(); // pastikan produk dimuat dulu
  data.value = await getDashboardReport();
});
</script>
