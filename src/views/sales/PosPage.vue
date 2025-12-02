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
        <select
          v-model="selectedType"
          class="form-select form-select-sm w-auto"
        >
          <option value="barang">Barang</option>
          <option value="jasa">Jasa</option>
        </select>
      </div>
      <div class="kasir-total-box text-end">
        <div class="kasir-label">TOTAL BELANJA</div>
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
          <div class="d-flex justify-content-between align-items-center">
            <div @click="selectSuggestion(s, s.satuan)">
              {{ s.name }} <small class="text-muted">({{ s.code }})</small> —
              {{
                s.type === "barang"
                  ? "Stok: " + s.stock + (s.satuan ? " " + s.satuan : "")
                  : "Jasa"
              }}
              — Rp{{ s.price.toLocaleString() }}
            </div>

            <!-- UNIT BUTTONS -->
            <div v-if="s.type === 'barang' && s.konversi" class="d-flex gap-1">
              <button
                v-for="(val, key) in JSON.parse(s.konversi)"
                :key="key"
                class="btn btn-sm btn-outline-secondary py-0 px-1"
                @click="selectSuggestion(s, key)"
              >
                {{ key }}
              </button>
            </div>
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
            <th style="width: 190px">Harga</th>
            <th style="width: 110px">Subtotal</th>
            <th style="width: 40px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in sale.items" :key="item.id + '-' + item.unit">
            <td>
              {{ item.name }}
              <small v-if="item.unit && item.unit !== item.satuan">{{
                item.unit
              }}</small>
            </td>

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
              <template v-if="item.type === 'barang'">
                <select
                  v-model="item.priceType"
                  @change="updateItemPrice(item)"
                  class="form-select form-select-sm"
                >
                  <option value="eceran">
                    Eceran (Rp{{
                      (
                        item.price_retail || item.original_price
                      ).toLocaleString()
                    }})
                  </option>

                  <option v-if="item.wholesale_price" value="grosir">
                    Grosir (Rp{{ item.wholesale_price.toLocaleString() }})
                  </option>
                </select>
              </template>

              <template v-else> Rp{{ item.price.toLocaleString() }} </template>
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

    <!-- PAYMENT -->
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
      <strong class="text-success"
        >Total: Rp {{ total.toLocaleString() }}</strong
      >

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

/* -------------------------
    SUGGESTION & SEARCH
-------------------------- */
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

function selectSuggestion(p, unit = null) {
  addProduct(p, unit);
  searchInput.value = "";
  suggestions.value = [];
}

function addProductBySearch() {
  if (suggestions.value.length)
    return selectSuggestion(suggestions.value[0], suggestions.value[0].satuan);

  const q = searchInput.value.trim().toLowerCase();
  const found = products.value.find(
    (p) =>
      p.type === selectedType.value &&
      [p.code, p.name, p.barcode].some((v) => v?.toLowerCase().includes(q))
  );

  found
    ? selectSuggestion(found, found.satuan)
    : error("Produk tidak ditemukan.");
}

/* -------------------------
      ADD ITEM
-------------------------- */
function addProduct(p, unit) {
  const conv = JSON.parse(p.konversi || "{}");
  const multiplier = unit && unit !== p.satuan ? conv[unit] : 1;
  const baseQty = 1 * multiplier;

  if (p.type === "barang" && baseQty > p.stock)
    return error(`Stok tidak cukup untuk ${p.name}`);

  const exist = sale.value.items.find(
    (i) => i.id === p.id && i.unit === (unit || p.satuan)
  );

  if (exist) {
    exist.quantity++;
  } else {
    sale.value.items.push({
      ...p,
      quantity: 1,
      priceType: "eceran",

      // ✔ harga asli yang tidak pernah berubah
      original_price: p.price,

      // ✔ harga yang dipakai di transaksi
      price: p.price,

      unit: unit || p.satuan,
      multiplier,
    });
  }
}

function removeItem(item) {
  sale.value.items = sale.value.items.filter(
    (i) => i.id !== item.id || i.unit !== item.unit
  );
}

function validateQuantity(item) {
  if (item.quantity < 1) item.quantity = 1;

  if (item.type === "barang") {
    const stockAvailable = item.stock / item.multiplier;

    if (item.quantity > stockAvailable) {
      item.quantity = stockAvailable;
      error(
        `Maksimal stok untuk ${item.name} adalah ${stockAvailable} ${item.unit}`
      );
    }
  }
}

/* -------------------------
      UPDATE PRICE FIX
-------------------------- */
function updateItemPrice(item) {
  if (item.priceType === "grosir") {
    item.price = item.wholesale_price;
  } else {
    // ✔ kembali ke harga eceran asli (bukan harga yang sudah berubah)
    item.price = item.price_retail || item.original_price;
  }
}

/* -------------------------
      INVOICE
-------------------------- */
function generateInvoiceNumber() {
  const n = new Date();
  const f = (x) => x.toString().padStart(2, "0");
  return `INV-${n.getFullYear().toString().slice(-2)}${f(n.getMonth() + 1)}${f(
    n.getDate()
  )}-${f(n.getHours())}${f(n.getMinutes())}${f(n.getSeconds())}`;
}

/* -------------------------
      SUBMIT SALE
-------------------------- */
async function submitSale() {
  if (loading.value || !canSubmit.value) return;

  loading.value = true;

  try {
    const payload = {
      invoice_number: invoiceNumber.value,
      date: new Date().toISOString().split("T")[0],
      total: total.value,
      payment: payment.value,
      change: change.value,

      // ✔ sesuai backend baru
      items: sale.value.items.map((i) => ({
        product_id: i.id,
        quantity: i.quantity * i.multiplier,
        price: i.price,
        subtotal: i.quantity * i.price,
      })),
    };

    await salesService.create(payload);
    success("Penjualan berhasil disimpan");

    // RESET FORM
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
@font-face {
  font-family: "Seven Segment";
  src: url("https://fonts.cdnfonts.com/s/16305/DS-DIGI.TTF") format("truetype");
}
</style>
