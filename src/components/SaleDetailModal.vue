<template>
  <div class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Detail Penjualan</h5>
          <button
            type="button"
            class="btn-close"
            @click="$emit('close')"
          ></button>
        </div>
        <div class="modal-body">
          <p><strong>No. Transaksi:</strong> {{ sale.invoice_number }}</p>
          <p><strong>Tanggal:</strong> {{ formatDate(sale.date) }}</p>
          <p><strong>Total:</strong> Rp {{ formatCurrency(sale.total) }}</p>
          <p><strong>Dibayar:</strong> Rp {{ formatCurrency(sale.payment) }}</p>
          <p>
            <strong>Kembali:</strong> Rp
            {{ formatCurrency(sale.change_amount) }}
          </p>
          <p><strong>Jumlah Item:</strong> {{ sale.items }}</p>

          <div v-if="sale.details?.length">
            <hr />
            <h6>Detail Item:</h6>
            <ul>
              <li v-for="(itm, i) in sale.details" :key="i">
                {{ itm.name }} - {{ itm.qty }} x Rp{{
                  formatCurrency(itm.price)
                }}
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-footer justify-content-between flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <label class="mb-0 small">Pilih Printer:</label>
            <select
              v-model="printer"
              class="form-select form-select-sm w-auto"
              @change="$emit('update-printer', printer)"
            >
              <option value="dotmatrix">Dot Matrix</option>
              <option value="pos">POS Thermal</option>
            </select>
          </div>
          <div>
            <button class="btn btn-secondary me-2" @click="$emit('close')">
              Tutup
            </button>
            <button class="btn btn-primary" @click="printNow">
              🖨️ Cetak Ulang
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref } from "vue";
import { formatDate, formatCurrency } from "@/utils/formatter";
import { printReceipt } from "@/utils/print";
import { printDotMatrixReceipt } from "@/utils/printDotMatrix";

const props = defineProps(["sale", "selectedPrinter"]);
const printer = ref(props.selectedPrinter);

const printNow = () => {
  const payload = {
    invoice_number: props.sale.invoice_number,
    date: props.sale.date,
    items: [...(props.sale.details || props.sale.items || [])], // ✅ fallback ke items
    total: props.sale.total,
    payment: props.sale.payment,
    change: props.sale.change_amount,
  };

  printer.value === "dotmatrix"
    ? printDotMatrixReceipt(payload)
    : printReceipt(payload);
};
</script>
