<template>
  <div class="container mt-5">
    <h4>📥 Laporan Pembelian</h4>

    <!-- FILTER -->
    <div class="row mt-3 mb-4">
      <div class="col-md-3">
        <label>Dari Tanggal</label>
        <input type="date" v-model="start" class="form-control" />
      </div>

      <div class="col-md-3">
        <label>Sampai Tanggal</label>
        <input type="date" v-model="end" class="form-control" />
      </div>

      <div class="col-md-3">
        <label>Supplier</label>
        <select v-model="supplier" class="form-control">
          <option value="all">Semua Supplier</option>
          <option v-for="s in supplierList" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <div class="col-md-3 d-flex align-items-end">
        <button class="btn btn-primary w-100" @click="loadData">
          Tampilkan
        </button>
      </div>
    </div>

    <!-- EXPORT -->
    <div class="mb-3">
      <button class="btn btn-success me-2" @click="exportExcel">
        Export Excel
      </button>
      <button class="btn btn-danger" @click="exportPDF">Export PDF</button>
    </div>

    <!-- TABEL -->
    <table class="table table-bordered table-sm">
      <thead class="table-light">
        <tr>
          <th>Tanggal</th>
          <th>Supplier</th>
          <th>No Faktur</th>
          <th>Produk</th>
          <th class="text-end">Qty</th>
          <th class="text-end">Harga Beli</th>
          <th class="text-end">Subtotal</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in purchases" :key="item.id">
          <td>{{ formatDate(item.date) }}</td>
          <td>{{ item.supplier }}</td>
          <td>{{ item.invoice }}</td>
          <td>{{ item.product_name }}</td>
          <td class="text-end">{{ item.quantity }}</td>
          <td class="text-end">Rp {{ formatCurrency(item.buy_price) }}</td>
          <td class="text-end">
            Rp {{ formatCurrency(item.quantity * item.buy_price) }}
          </td>
        </tr>

        <tr v-if="purchases.length === 0">
          <td colspan="7" class="text-center text-muted py-3">
            Tidak ada data pembelian
          </td>
        </tr>
      </tbody>

      <!-- TOTAL -->
      <tfoot v-if="purchases.length > 0">
        <tr class="table-info fw-bold">
          <td colspan="6" class="text-end">TOTAL PEMBELIAN</td>
          <td class="text-end">Rp {{ formatCurrency(totalPembelian) }}</td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import PurchaseService from "@/services/purchaseService";
import { formatCurrency, formatDate } from "@/utils/formatter";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const purchases = ref([]);
const supplierList = ref([]);

const today = new Date().toISOString().slice(0, 10);
const start = ref(today);
const end = ref(today);
const supplier = ref("all");

// Load data pertama kali
onMounted(async () => {
  await loadData();
});

const loadData = async () => {
  try {
    const res = await PurchaseService.getPurchaseReport();

    purchases.value = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data.data)
      ? res.data.data
      : [];

  } catch (err) {
    console.error("❌ Gagal load report:", err);
    purchases.value = [];
  }
};


// Hitung total pembelian
const totalPembelian = computed(() =>
  purchases.value.reduce((sum, i) => sum + i.quantity * i.buy_price, 0)
);

// EXPORT EXCEL
const exportExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(purchases.value);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Pembelian");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([excelBuffer]), "Laporan_Pembelian.xlsx");
};

// EXPORT PDF
const exportPDF = () => {
  const doc = new jsPDF();

  doc.text("Laporan Pembelian", 14, 10);

  autoTable(doc, {
    startY: 15,
    head: [
      ["Tanggal", "Supplier", "Invoice", "Produk", "Qty", "Harga", "Subtotal"],
    ],
    body: purchases.value.map((p) => [
      formatDate(p.date),
      p.supplier,
      p.invoice,
      p.product_name,
      p.quantity,
      formatCurrency(p.buy_price),
      formatCurrency(p.quantity * p.buy_price),
    ]),
  });

  doc.save("Laporan_Pembelian.pdf");
};
</script>

<style scoped>
.table {
  font-size: 0.9rem;
}
</style>
