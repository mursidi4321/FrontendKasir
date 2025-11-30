<template>
  <div class="container mt-4 pt-5">
    <!-- Header + Display Total Kasir -->
    <!-- HEADER SATU BARIS HEMAT SPACE -->
    <div
      class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2"
    >
      <!-- Nota + Dropdown -->
      <div class="d-flex align-items-center gap-3 flex-wrap">
        <small class="text-muted">
          Nota: <strong>{{ invoiceNumber }}</strong>
        </small>

        <select
          v-model="selectedType"
          class="form-select form-select-sm w-auto"
        >
          <option value="barang">Barang</option>
          <option value="jasa">Jasa</option>
        </select>
      </div>

      <!-- DISPLAY TOTAL BESAR -->
      <div class="kasir-total-box text-end">
        <div class="kasir-label">TOTAL BELANJA</div>
        <div class="kasir-amount">Rp {{ total.toLocaleString() }}</div>
      </div>
    </div>

    <!-- Search Produk -->
    <div class="mb-2 position-relative">
      <div class="input-group input-group-sm">
        <span class="input-group-text bg-white">
          <i class="bi bi-search text-muted"></i>
        </span>

        <input
          ref="searchInputEl"
          v-model="searchInput"
          @input="debouncedUpdateSuggestions"
          @keydown.enter.prevent="addProductBySearch"
          type="text"
          class="form-control"
          placeholder="Cari produk / scan barcode"
          autocomplete="off"
        />
      </div>

      <!-- SUGGESTION LIST -->
      <ul
        v-if="suggestions.length"
        class="list-group position-absolute w-100 shadow-sm z-3 mt-1"
        style="max-height: 180px; overflow-y: auto"
      >
        <li
          v-for="s in suggestions"
          :key="s.id"
          class="list-group-item list-group-item-action py-1"
          @click="selectSuggestion(s)"
        >
          {{ s.name }} <small class="text-muted">({{ s.code }})</small> —
          {{ s.type === "barang" ? "Stok: " + s.stock : "Jasa" }} — Rp{{
            s.price
          }}
        </li>
      </ul>
    </div>

    <!-- TABLE -->
    <div class="table-responsive border rounded compact-scroll">
      <table class="table table-sm table-bordered align-middle mb-0">
        <thead class="table-light text-center">
          <tr>
            <th>Produk</th>
            <th style="width: 70px">Qty</th>
            <th style="width: 100px">Harga</th>
            <th style="width: 110px">Subtotal</th>
            <th style="width: 40px"></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in sale.items" :key="item.code">
            <td>{{ item.name }}</td>

            <td>
              <input
                v-model.number="item.quantity"
                type="number"
                min="1"
                class="form-control form-control-sm text-center"
                @change="validateQuantity(item)"
              />
            </td>

            <td>
              <input
                v-model.number="item.price"
                type="number"
                min="0"
                class="form-control form-control-sm text-end"
                @change="validatePrice(item)"
              />
            </td>

            <td class="text-end fw-semibold">
              Rp{{ (item.quantity * item.price).toLocaleString() }}
            </td>

            <td class="text-center">
              <button
                class="btn btn-sm btn-outline-danger py-0 px-1"
                @click="removeItem(item)"
              >
                <i class="bi bi-x"></i>
              </button>
            </td>
          </tr>

          <tr v-if="!sale.items.length">
            <td colspan="5" class="text-center text-muted py-2">
              Belum ada produk
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Payment -->
    <div class="row g-2 mt-3 small">
      <div class="col-6 col-md-4">
        <label class="form-label mb-1">Bayar</label>
        <input
          v-model.number="payment"
          type="number"
          class="form-control form-control-sm"
          min="0"
        />
      </div>

      <div class="col-6 col-md-4">
        <label class="form-label mb-1">Kembali</label>
        <input
          :value="changeFormatted"
          class="form-control form-control-sm"
          disabled
        />
      </div>
    </div>

    <!-- ACTION -->
    <div
      class="mt-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
    >
      <strong class="text-success">
        Total: Rp {{ total.toLocaleString() }}
      </strong>

      <div class="d-flex align-items-center gap-2">
        <div class="form-check">
          <input
            id="printNota"
            type="checkbox"
            v-model="printNota"
            class="form-check-input"
          />
          <label for="printNota" class="form-check-label">Cetak</label>
        </div>

        <select
          v-if="printNota"
          v-model="selectedPrinter"
          class="form-select form-select-sm"
        >
          <option value="dotmatrix">Dot Matrix</option>
          <option value="pos">POS</option>
        </select>

        <button
          class="btn btn-sm btn-primary"
          :disabled="!canSubmit || loading"
          @click="submitSale"
        >
          <i class="bi bi-save"></i> Simpan
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import productService from "@/services/productService";
import salesService from "@/services/salesService";
import { useAlert } from "@/composables/useAlert";
import { printReceipt } from "@/utils/print";
import { printDotMatrixReceipt } from "@/utils/printDotMatrix";

const { success, error } = useAlert();

const searchInput = ref("");
const selectedType = ref("barang");
const products = ref([]);
const suggestions = ref([]);
const sale = ref({ items: [] });
const printNota = ref(false);
const selectedPrinter = ref("dotmatrix");
const loading = ref(false);
const invoiceNumber = ref(generateInvoiceNumber());
const payment = ref(0);
const searchInputEl = ref(null);

/* ===== COMPUTED ===== */
const total = computed(() =>
  sale.value.items.reduce((s, i) => s + i.quantity * i.price, 0)
);

const change = computed(() => payment.value - total.value);

const changeFormatted = computed(
  () => `Rp ${Math.max(change.value, 0).toLocaleString()}`
);

const canSubmit = computed(
  () => sale.value.items.length > 0 && payment.value >= total.value
);

/* ===== LOAD PRODUCT ===== */
onMounted(async () => {
  try {
    const res = await productService.getAll();
    products.value = res.data;
    await nextTick();
    searchInputEl.value?.focus();
  } catch {
    error("Gagal memuat data produk");
  }
});

/* ===== SEARCH & SUGGEST ===== */
let debounceTimer;
function debouncedUpdateSuggestions() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(updateSuggestions, 200);
}

function updateSuggestions() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return (suggestions.value = []);

  suggestions.value = products.value
    .filter((p) => p.type === selectedType.value)
    .filter((p) =>
      [p.name, p.code, p.barcode].some((v) => v?.toLowerCase().includes(q))
    )
    .slice(0, 20);
}

function selectSuggestion(p) {
  addProduct(p);
  searchInput.value = "";
  suggestions.value = [];
}

function addProductBySearch() {
  if (suggestions.value.length) return selectSuggestion(suggestions.value[0]);

  const q = searchInput.value.trim().toLowerCase();
  const found = products.value.find(
    (p) =>
      p.type === selectedType.value &&
      [p.code, p.name, p.barcode].some((v) => v?.toLowerCase().includes(q))
  );

  found ? selectSuggestion(found) : error("Produk tidak ditemukan.");
}

/* ===== CART ACTIONS ===== */
function addProduct(p) {
  if (p.type === "barang" && p.stock <= 0)
    return error(`Stok habis untuk ${p.name}`);

  const exist = sale.value.items.find((i) => i.id === p.id);

  if (exist && p.type === "barang" && exist.quantity + 1 > p.stock)
    return error(`Stok tidak cukup untuk ${p.name}`);

  exist
    ? exist.quantity++
    : sale.value.items.push({ ...p, quantity: 1, price: p.price ?? 0 });
}

function removeItem(item) {
  sale.value.items = sale.value.items.filter((i) => i.id !== item.id);
}

function validateQuantity(item) {
  if (item.quantity < 1) item.quantity = 1;

  if (item.type === "barang" && item.quantity > item.stock) {
    item.quantity = item.stock;
    error(`Maksimal stok untuk ${item.name} adalah ${item.stock}`);
  }
}

function validatePrice(item) {
  if (item.price < 0) {
    item.price = 0;
    error("Harga tidak boleh negatif");
  }
}

/* ===== SUBMIT SALE ===== */
function generateInvoiceNumber() {
  const n = new Date();
  const f = (x) => x.toString().padStart(2, "0");
  return `INV-${n.getFullYear().toString().slice(-2)}${f(n.getMonth() + 1)}${f(
    n.getDate()
  )}-${f(n.getHours())}${f(n.getMinutes())}${f(n.getSeconds())}`;
}

async function submitSale() {
  if (loading.value || !canSubmit.value) return;

  loading.value = true;

  try {
    const payload = {
      invoice_number: invoiceNumber.value,
      date: new Date().toISOString().split("T")[0],
      items: sale.value.items.map((i) => ({
        product_code: i.code,
        name: i.name,
        qty: i.quantity,
        price: i.price,
        subtotal: i.quantity * i.price,
        type: i.type,
      })),
      total: total.value,
      payment: payment.value,
      change: change.value,
    };

    await salesService.create(payload);

    success("Penjualan berhasil disimpan");

    if (printNota.value) {
      selectedPrinter.value === "dotmatrix"
        ? printDotMatrixReceipt(payload)
        : printReceipt(payload);
    }

    sale.value = { items: [] };
    payment.value = 0;
    invoiceNumber.value = generateInvoiceNumber();
    await nextTick();
    searchInputEl.value?.focus();
  } catch (err) {
    console.error(err);
    error("Terjadi kesalahan saat menyimpan");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* TABEL */
.compact-scroll {
  max-height: 320px;
  overflow-y: auto;
}

.table-sm td,
.table-sm th {
  padding: 0.38rem;
}

/* ===== TOTAL KASIR ALA INDOMARET ===== */
.kasir-total-box {
  background: #000;
  padding: 10px 18px;
  border-radius: 6px;
  min-width: 220px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.35);
  border: 2px solid #333;
}

.kasir-label {
  color: #f8f9fa;
  font-size: 0.78rem;
  font-weight: 500;
  opacity: 0.8;
}

.kasir-amount {
  font-size: 2.4rem;
  font-weight: 700;
  color: #00ff55;
  margin-top: -3px;
  font-family: "Seven Segment", monospace, sans-serif;
  text-shadow: 0 0 8px #00ff55;
}

@media (max-width: 768px) {
  .kasir-total-box {
    min-width: 160px;
    padding: 8px 12px;
  }
  .kasir-amount {
    font-size: 1.7rem;
  }
}

/* 7-SEGMENT FONT */
@font-face {
  font-family: "Seven Segment";
  src: url("https://fonts.cdnfonts.com/s/16305/DS-DIGI.TTF") format("truetype");
}
</style>
