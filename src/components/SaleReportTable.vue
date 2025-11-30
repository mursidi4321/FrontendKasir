<template>
  <div v-if="sales.length === 0" class="text-center p-5 text-muted">
    <h5>📭 Tidak ada data penjualan</h5>
  </div>

  <div v-else>
    <table class="table table-sm table-bordered">
      <thead class="table-light">
        <tr>
          <th>Tanggal</th>
          <th>No. Transaksi</th>
          <th class="text-end">Total</th>
          <th class="text-end">Dibayar</th>
          <th class="text-end">Kembali</th>
          <th class="text-center">Item</th>
          <th class="text-center">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in sales" :key="item.id">
          <td>{{ formatDate(item.date) }}</td>
          <td>{{ item.invoice_number }}</td>
          <td class="text-end">Rp {{ formatCurrency(item.total) }}</td>
          <td class="text-end">Rp {{ formatCurrency(item.payment) }}</td>
          <td class="text-end">Rp {{ formatCurrency(item.change_amount) }}</td>
          <td class="text-center">{{ item.items }}</td>
          <td class="text-center">
            <button
              class="btn btn-sm btn-outline-primary"
              @click="$emit('show-detail', item)"
            >
              Detail
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { formatDate, formatCurrency } from "@/utils/formatter";
defineProps(["sales"]);
</script>
