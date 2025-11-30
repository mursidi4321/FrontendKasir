<template>
  <div class="container mt-5 pt-2">
    <h4 class="mt-4 mb-4">📊 Laporan Penjualan</h4>

    <!-- Filter + Ringkasan dalam 1 baris -->
    <div class="d-flex align-items-end mb-2 gap-2 filter-summary-row flex-wrap">
      <!-- Dari Tanggal -->
      <div>
        <label class="form-label mb-1">Dari Tanggal</label>
        <input
          type="date"
          v-model="start"
          class="form-control form-control-sm"
        />
      </div>

      <!-- Sampai Tanggal -->
      <div>
        <label class="form-label mb-1">Sampai Tanggal</label>
        <input type="date" v-model="end" class="form-control form-control-sm" />
      </div>

      <!-- Tombol Tampilkan -->
      <div>
        <button
          @click="fetchData"
          class="btn btn-primary btn-sm"
          :disabled="!start || !end || !isDateRangeValid || loading"
        >
          🔍 Tampilkan
        </button>
      </div>

      <!-- Ringkasan Total -->
      <div class="ms-auto text-end">
        <div class="fw-bold text-success small mb-1">
          Total Penjualan: Rp {{ formatCurrency(totalIncome) }}
        </div>
        <div class="fw-bold text-primary small">
          Total Transaksi: {{ sales.length }}
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-1">
      <div class="spinner-border spinner-border-sm text-primary"></div>
    </div>

    <!-- Tabel -->
    <SaleReportTable v-if="!loading" :sales="sales" @show-detail="showDetail" />

    <!-- Modal -->
    <SaleDetailModal
      v-if="selectedSale"
      :sale="selectedSale"
      :selected-printer="selectedPrinter"
      @close="selectedSale = null"
      @update-printer="selectedPrinter = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import SaleReportTable from "@/components/SaleReportTable.vue";
import SaleDetailModal from "@/components/SaleDetailModal.vue";
import { getSalesReport, getSaleDetail } from "@/services/reportService";
import salesService from "@/services/salesService";
import { formatCurrency } from "@/utils/formatter";

// Default tanggal hari ini
const today = new Date().toISOString().split("T")[0];
const start = ref(today);
const end = ref(today);

const sales = ref([]);
const loading = ref(false);
const selectedSale = ref(null);
const selectedPrinter = ref("dotmatrix");

// Validasi tanggal
const isDateRangeValid = computed(() => {
  return new Date(start.value) <= new Date(end.value);
});

// Total pendapatan
const totalIncome = computed(() =>
  sales.value.reduce((sum, sale) => sum + Number(sale.total || 0), 0)
);

// Ambil data
const fetchData = async () => {
  if (!isDateRangeValid.value) return;
  loading.value = true;
  try {
    const result = await getSalesReport(start.value, end.value);
    sales.value = result || [];
  } catch (e) {
    console.error("Gagal mengambil laporan penjualan:", e);
  } finally {
    loading.value = false;
  }
};

// Detail modal
const showDetail = async (item) => {
  if (!item.details) {
    try {
      const result = await salesService.get(item.id);
      item.details = result.items || result.details || [];
    } catch {
      alert("Gagal memuat detail.");
    }
  }
  selectedSale.value = item;
};
</script>

<style scoped>
.filter-summary-row .form-label {
  font-size: 0.85rem;
  margin-bottom: 2px;
}

.filter-summary-row .form-control,
.filter-summary-row .btn {
  height: 30px;
  padding: 2px 6px;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .filter-summary-row {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-summary-row .ms-auto {
    text-align: left !important;
    margin-top: 4px;
  }
}

/* Tabel lebih rapat */
.compact-table table {
  font-size: 14px;
}

.compact-table th,
.compact-table td {
  padding: 6px 10px !important;
  vertical-align: middle !important;
}

/* Kartu ringkasan lebih pendek */
.summary-card .fs-5 {
  font-size: 1.1rem !important;
}

/* Filter section lebih rapat */
.filter-section .form-label {
  margin-bottom: 3px !important;
}

.filter-section .form-control {
  padding: 6px 8px !important;
  height: 34px;
}

.filter-section button {
  padding: 7px !important;
  height: 34px;
}

/* Modal ruang lebih sempit */
.modal-body table td,
.modal-body table th {
  padding: 5px !important;
}
</style>
