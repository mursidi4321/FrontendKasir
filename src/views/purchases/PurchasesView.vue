<template>
  <div class="container mt-4 pt-5">
    <!-- HEADER -->
    <div
      class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2"
    >
      <div class="d-flex align-items-center gap-3 flex-wrap">
        <small class="text-muted"
          >Nota: <strong>{{ invoiceNumber }}</strong></small
        >
      </div>
      <div class="kasir-total-box text-end">
        <div class="kasir-label">TOTAL PEMBELIAN</div>
        <div class="kasir-amount">Rp {{ total.toLocaleString() }}</div>
      </div>
    </div>

    <!-- SEARCH -->
    <div class="mb-2 position-relative">
      <div class="input-group input-group-sm">
        <span class="input-group-text bg-white"
          ><i class="bi bi-search text-muted"></i
        ></span>
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
        >
          <div @click="selectSuggestion(s)">
            {{ s.name }} <small class="text-muted">({{ s.code }})</small> —
            Stok: {{ s.stock || 0 }} — Rp{{
              (s.purchase_price || 0).toLocaleString()
            }}
          </div>
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
            <th style="width: 110px">Harga Beli</th>
            <th style="width: 110px">Subtotal</th>
            <th style="width: 40px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in purchase.items" :key="item.id">
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
            <td>Rp{{ (item.buy_price || 0).toLocaleString() }}</td>
            <td class="text-end fw-semibold">
              Rp{{
                ((item.quantity || 0) * (item.buy_price || 0)).toLocaleString()
              }}
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
          <tr v-if="!purchase.items.length">
            <td colspan="5" class="text-center text-muted py-2">
              Belum ada produk
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ACTION -->
    <div
      class="mt-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
    >
      <strong class="text-success"
        >Total: Rp {{ total.toLocaleString() }}</strong
      >
      <button
        class="btn btn-sm btn-primary"
        :disabled="!canSubmit || loading"
        @click="submitPurchase"
      >
        <i class="bi bi-save"></i> Simpan Pembelian
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import productService from "@/services/productService";
import purchaseService from "@/services/purchaseService";
import { useAlert } from "@/composables/useAlert";

const { success, error } = useAlert();

const searchInput = ref("");
const products = ref([]);
const suggestions = ref([]);
const purchase = ref({ items: [] });
const invoiceNumber = ref(generateInvoiceNumber());
const loading = ref(false);
const searchInputEl = ref(null);

const total = computed(() =>
  purchase.value.items.reduce(
    (s, i) => s + (i.quantity || 0) * (i.buy_price || 0),
    0
  )
);
const canSubmit = computed(() => purchase.value.items.length > 0);

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

let debounceTimer;
function debouncedUpdateSuggestions() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(updateSuggestions, 200);
}

function updateSuggestions() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return (suggestions.value = []);
  suggestions.value = products.value
    .filter((p) =>
      p.type ==="barang" && // hanya product barang
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
  const found = products.value.find((p) =>
    [p.code, p.name, p.barcode].some((v) => v?.toLowerCase().includes(q))
  );
  found ? selectSuggestion(found) : error("Produk tidak ditemukan.");
}

function addProduct(p) {
  if(p.type !== 'barang') return; // tipe jasa abaikan

  const exist = purchase.value.items.find((i) => i.id === p.id);
  if (exist) {
    exist.quantity++;
  } else {
    purchase.value.items.push({
      ...p,
      quantity: 1,
      buy_price: p.purchase_price || 0,
    });
  }
}

function removeItem(item) {
  purchase.value.items = purchase.value.items.filter((i) => i.id !== item.id);
}

function validateQuantity(item) {
  if (item.quantity < 1) item.quantity = 1;
}

function generateInvoiceNumber() {
  const n = new Date();
  const f = (x) => x.toString().padStart(2, "0");
  return `PB-${f(n.getFullYear() % 100)}${f(n.getMonth() + 1)}${f(
    n.getDate()
  )}-${f(n.getHours())}${f(n.getMinutes())}${f(n.getSeconds())}`;
}

async function submitPurchase() {
  if (loading.value || !canSubmit.value) return;
  loading.value = true;
  try {
    const now = new Date();
    const pad = (x) => x.toString().padStart(2, "0");
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
      now.getSeconds()
    )}`;

    const payload = {
      supplier: "Toko Sumber Makmur", // bisa diganti sesuai input supplier
      date: dateStr,
      invoice_number: invoiceNumber.value,
      total: total.value,
      items: purchase.value.items.map((i) => ({
        product_id: i.id,
        name: i.name,
        type: i.type,
        qty: i.quantity,
        buy_price: i.buy_price,
      })),
    };

    // console.log(payload);
    await purchaseService.create(payload);
    success("Pembelian berhasil disimpan");

    purchase.value.items = [];
    invoiceNumber.value = generateInvoiceNumber();
    await nextTick();
    searchInputEl.value?.focus();
  } catch (err) {
    console.error(err);
    error("Terjadi kesalahan saat menyimpan pembelian");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.compact-scroll {
  max-height: 320px;
  overflow-y: auto;
}
.table-sm td,
.table-sm th {
  padding: 0.38rem;
}
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
</style>
