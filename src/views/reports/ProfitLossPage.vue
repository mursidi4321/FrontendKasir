<template>
  <div class="container mt-4">
    <h4 class="mb-4">📊 Laporan Laba Rugi</h4>

    <!-- Filter Periode -->
    <div class="row mb-4">
      <div class="col-md-3">
        <label class="form-label">Dari Tanggal</label>
        <input type="date" v-model="startDate" class="form-control" />
      </div>
      <div class="col-md-3">
        <label class="form-label">Sampai Tanggal</label>
        <input type="date" v-model="endDate" class="form-control" />
      </div>
      <div class="col-md-2 d-flex align-items-end">
        <button class="btn btn-primary w-100" @click="fetchReport">
          <i class="bi bi-search me-1"></i>Tampilkan
        </button>
      </div>
    </div>

    <!-- Ringkasan -->
    <div v-if="report" class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card text-bg-success">
          <div class="card-body">
            <h6 class="card-title">Total Penjualan</h6>
            <h5>{{ formatCurrency(report.total_sales) }}</h5>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-bg-warning">
          <div class="card-body">
            <h6 class="card-title">Total Modal</h6>
            <h5>{{ formatCurrency(report.total_cost) }}</h5>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card text-bg-info">
          <div class="card-body">
            <h6 class="card-title">Total Laba</h6>
            <h5>{{ formatCurrency(report.profit) }}</h5>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabel Detail -->
    <div v-if="report" class="table-responsive shadow-sm border rounded">
      <table class="table table-sm table-bordered align-middle mb-0">
        <thead class="table-light sticky-top">
          <tr>
            <th>#</th>
            <th>Produk</th>
            <th>Qty Terjual</th>
            <th>Harga Jual</th>
            <th>Harga Beli</th>
            <th>Total Jual</th>
            <th>Total Modal</th>
            <th>Laba</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in report.details" :key="i">
            <td>{{ i + 1 }}</td>
            <td>{{ item.name }}</td>
            <td class="text-center">{{ item.qty }}</td>
            <td class="text-end">{{ formatCurrency(item.price) }}</td>
            <td class="text-end">{{ formatCurrency(item.purchase_price) }}</td>
            <td class="text-end">{{ formatCurrency(item.total_sales) }}</td>
            <td class="text-end">{{ formatCurrency(item.total_cost) }}</td>
            <td class="text-end text-success">
              {{ formatCurrency(item.profit) }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="table-light fw-bold">
            <td colspan="5" class="text-end">TOTAL</td>
            <td class="text-end">{{ formatCurrency(report.total_sales) }}</td>
            <td class="text-end">{{ formatCurrency(report.total_cost) }}</td>
            <td class="text-end text-success">
              {{ formatCurrency(report.profit) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Loading & Error -->
    <div v-if="loading" class="mt-3 alert alert-info">
      Memuat data laporan...
    </div>
    <div v-if="error" class="mt-3 alert alert-danger">
      Terjadi kesalahan: {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { getProfitLossReport } from "@/services/reportService.js";

const report = ref(null);
const loading = ref(false);
const error = ref(null);
const operationalCost = ref(0); // 👈 biaya operasional manual

const today = new Date().toISOString().slice(0, 10);
// const startDate = ref(
//   new Date(new Date().getFullYear(), new Date().getMonth(), 1)
//     .toISOString()
//     .slice(0, 10)
// );
const startDate = ref(today);

const endDate = ref(today);

const fetchReport = async () => {
  loading.value = true;
  error.value = null;
  try {
    report.value = await getProfitLossReport(startDate.value, endDate.value);
  } catch (err) {
    error.value = "Gagal memuat data laporan.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchReport);

const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

// 👇 Komputasi laba bersih
const netProfit = computed(() => {
  if (!report.value) return 0;
  return (report.value.profit || 0) - (parseFloat(operationalCost.value) || 0);
});
</script>
