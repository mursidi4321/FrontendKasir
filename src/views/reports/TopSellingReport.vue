<template>
  <div class="container mt-5">
    <div class="card shadow-sm p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="fw-bold text-success mb-0">
          <i class="bi bi-graph-up"></i> Barang Terlaris Bulan Ini
        </h4>
        <small class="text-muted">{{ monthYear }}</small>
      </div>

      <!-- TABEL -->
      <div class="table-responsive mb-4">
        <table class="table table-striped table-hover align-middle">
          <thead class="table-success">
            <tr>
              <th>Produk</th>
              <th class="text-center" style="width: 90px">Qty</th>
              <th class="text-center" style="width: 90px">%</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reportData" :key="item.product_code">
              <td>{{ item.name }}</td>
              <td class="text-center">{{ item.qty }}</td>
              <td class="text-center">
                <span class="badge bg-success">{{ item.percent }}%</span>
              </td>
            </tr>
            <tr v-if="reportData.length === 0">
              <td colspan="3" class="text-center text-muted py-2">
                Tidak ada data penjualan
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- GRAFIK -->
      <div class="row">
        <div class="col-md-6 mb-4 mb-md-0">
          <canvas ref="barChart"></canvas>
        </div>
        <div class="col-md-6">
          <canvas ref="pieChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import Chart from "chart.js/auto";
import { getTopSellingReport } from "@/services/reportService";

const sales = ref([]);
const barChart = ref(null);
const pieChart = ref(null);

let barInstance = null;
let pieInstance = null;

// Ambil data dari API
async function loadData() {
  const res = await getTopSellingReport();
  sales.value = Array.isArray(res?.data?.data)
    ? res.data.data
    : Array.isArray(res?.data)
    ? res.data
    : [];
}

// Hitung prosentase
const reportData = computed(() => {
  const total = sales.value.reduce((s, p) => s + Number(p.total_qty), 0);

  return sales.value.map((p) => ({
    ...p,
    qty: Number(p.total_qty),
    percent: total > 0 ? ((Number(p.total_qty) / total) * 100).toFixed(1) : 0,
  }));
});

// Format bulan & tahun
const monthYear = computed(() => {
  if (!sales.value.length) return "";
  const now = new Date();
  return now.toLocaleString("id-ID", { month: "long", year: "numeric" });
});

// Render chart
function renderCharts() {
  if (!reportData.value.length) return;

  const labels = reportData.value.map((i) => i.name);
  const qty = reportData.value.map((i) => i.qty);
  const percent = reportData.value.map((i) => i.percent);

  // Cleanup existing charts
  if (barInstance) barInstance.destroy();
  if (pieInstance) pieInstance.destroy();

  // Bar Chart
  barInstance = new Chart(barChart.value, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Qty Terjual",
          data: qty,
          backgroundColor: "#4CAF50",
          borderRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.raw} pcs (${percent[ctx.dataIndex]}%)`,
          },
        },
      },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
    },
  });

  // Pie Chart
  pieInstance = new Chart(pieChart.value, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: qty,
          backgroundColor: [
            "#4CAF50",
            "#2196F3",
            "#FFC107",
            "#FF5722",
            "#9C27B0",
            "#00BCD4",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.label}: ${ctx.raw} pcs (${percent[ctx.dataIndex]}%)`,
          },
        },
      },
    },
  });
}

onMounted(async () => {
  await loadData();
  renderCharts();
});
</script>

<style scoped>
table {
  font-size: 0.88rem;
}
.badge {
  font-size: 0.85rem;
}
.card {
  border-radius: 12px;
}
canvas {
  max-height: 300px;
}
</style>
