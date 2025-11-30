<template>
  <div class="container mt-5 pt-5">
    <h4>📋 Manajemen Cashflow</h4>

    <!-- FILTER TANGGAL -->
    <div class="row mb-3">
      <div class="col-md-3">
        <label>Dari Tanggal</label>
        <input type="date" v-model="start" class="form-control" />
      </div>
      <div class="col-md-3">
        <label>Sampai Tanggal</label>
        <input type="date" v-model="end" class="form-control" />
      </div>
      <div class="col-md-3 d-flex align-items-end gap-2">
        <button @click="openForm('in')" class="btn btn-success w-100">
          + Masuk
        </button>
        <button @click="openForm('out')" class="btn btn-danger w-100">
          – Keluar
        </button>
      </div>
      <div class="col-md-2 d-flex align-items-end">
        <button @click="fetchData" class="btn btn-primary w-100">
          Tampilkan
        </button>
      </div>
    </div>

    <!-- RINGKASAN -->
    <div v-if="data" class="alert alert-light">
      <strong>Ringkasan:</strong><br />
      Saldo Awal: <strong>{{ formatCurrency(data.saldo_awal) }}</strong> |
      Total Masuk: <strong>{{ formatCurrency(data.total_in) }}</strong> |
      Total Keluar: <strong>{{ formatCurrency(data.total_out) }}</strong> |
      Saldo Akhir: <strong>{{ formatCurrency(data.saldo_akhir) }}</strong>
    </div>

    <!-- TABEL -->
    <table v-if="data" class="table table-bordered table-sm">
      <thead class="table-light">
        <tr>
          <th>Tanggal</th>
          <th>Deskripsi</th>
          <th class="text-end">Masuk</th>
          <th class="text-end">Keluar</th>
          <th class="text-end">Saldo</th> <!-- Kolom baru -->
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="data.items.length === 0">
          <td colspan="6" class="text-center">Tidak ada data cashflow</td>
        </tr>

        <tr v-for="item in data.items" :key="item.id">
          <td>{{ formatDateIndo(item.date) }}</td>
          <td>{{ item.description }}</td>

          <td class="text-end">
            <span v-if="item.type === 'in'">{{ formatCurrency(item.amount) }}</span>
          </td>

          <td class="text-end">
            <span v-if="item.type === 'out'">{{ formatCurrency(item.amount) }}</span>
          </td>

          <td class="text-end">
            {{ formatCurrency(item.saldo) }}
          </td>

          <td>
            <button class="btn btn-sm btn-primary me-1" @click="openForm(null, item)">
              Edit
            </button>
            <button class="btn btn-sm btn-danger" @click="remove(item.id)">
              Hapus
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- MODAL -->
    <CashflowModal
      v-if="showModal"
      :cashflow="selected"
      @close="showModal = false"
      @saved="onSaved"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import cashflowService from "@/services/cashflowService";
import CashflowModal from "./CashflowModal.vue";
import { useAlert } from "@/composables/useAlert";

const { success, error, confirmDelete } = useAlert();

const today = new Date();
const getFirstDay = () => new Date(today.getFullYear(), today.getMonth(), 1);
const getLastDay = () => new Date(today.getFullYear(), today.getMonth() + 1, 0);

const formatInputDate = (date) => date.toISOString().slice(0, 10);

const start = ref(formatInputDate(getFirstDay()));
const end = ref(formatInputDate(getLastDay()));
const data = ref(null);
const showModal = ref(false);
const selected = ref(null);

const formatDateIndo = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatCurrency = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(val || 0);

const fetchData = async () => {
  if (new Date(start.value) > new Date(end.value)) {
    error("Tanggal mulai tidak boleh lebih dari tanggal akhir.");
    return;
  }

  try {
    const res = await cashflowService.getAll(start.value, end.value);
    const items = res.data.items || [];

    const saldo_awal = Number(res.data.saldo_awal) || 0;

    // Hitung running balance (saldo per baris)
    let runningSaldo = saldo_awal;
    const itemsWithSaldo = items.map((i) => {
      runningSaldo =
        i.type === "in"
          ? runningSaldo + Number(i.amount)
          : runningSaldo - Number(i.amount);

      return {
        ...i,
        saldo: runningSaldo,
      };
    });

    const total_in = itemsWithSaldo
      .filter((i) => i.type === "in")
      .reduce((sum, i) => sum + Number(i.amount), 0);

    const total_out = itemsWithSaldo
      .filter((i) => i.type === "out")
      .reduce((sum, i) => sum + Number(i.amount), 0);

    const saldo_akhir = saldo_awal + total_in - total_out;

    data.value = {
      ...res.data,
      total_in,
      total_out,
      saldo_awal,
      saldo_akhir,
      items: itemsWithSaldo,
    };
  } catch (err) {
    error("❌ Gagal memuat data cashflow.");
  }
};

// Buka form untuk tambah/edit
const openForm = (type = null, item = null) => {
  if (item) {
    selected.value = item;
  } else {
    selected.value = { type, date: formatInputDate(new Date()) };
  }
  showModal.value = true;
};

const onSaved = () => {
  showModal.value = false;
  fetchData();
};

const remove = async (id) => {
  try {
    const confirmed = await confirmDelete("Yakin ingin menghapus data ini?");
    if (confirmed) {
      await cashflowService.delete(id);
      success("✅ Data berhasil dihapus.");
      fetchData();
    }
  } catch {
    error("❌ Gagal menghapus data.");
  }
};

fetchData();
</script>

<style scoped>
.container {
  font-family: "Segoe UI", sans-serif;
}
.table {
  font-size: 0.9rem;
}
</style>
