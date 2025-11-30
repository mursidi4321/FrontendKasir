<template>
  <div class="container mt-5 pt-4">
    <h4 class="text-primary fw-bold mb-4">
      <i class="bi bi-truck me-2"></i>Pembelian Barang
    </h4>

    <!-- Supplier & Faktur -->
    <div class="row mb-4">
      <div class="col-md-6 mb-2">
        <label class="form-label">Supplier</label>
        <input
          v-model="purchase.supplier"
          type="text"
          class="form-control form-control-sm"
        />
      </div>
      <div class="col-md-6 mb-2">
        <label class="form-label">No. Faktur</label>
        <input
          v-model="purchase.invoice"
          type="text"
          class="form-control form-control-sm"
          readonly
        />
      </div>
    </div>

    <!-- Input Produk + Autocomplete -->
    <div class="mb-3 position-relative">
      <div class="input-group input-group-sm">
        <span class="input-group-text bg-white">
          <i class="bi bi-search text-muted"></i>
        </span>
        <input
          v-model="searchInput"
          ref="searchInputRef"
          @input="updateSuggestions"
          @keydown.enter.prevent="addProductBySearch"
          type="text"
          class="form-control"
          placeholder="Cari produk / scan barcode"
          autocomplete="off"
        />
      </div>
      <small class="text-muted"
        >Tekan Enter atau klik hasil untuk menambahkan</small
      >

      <!-- Autocomplete suggestion -->
      <ul
        v-if="suggestions.length > 0"
        class="list-group position-absolute w-100 shadow-sm z-3"
        style="max-height: 200px; overflow-y: auto"
      >
        <li
          class="list-group-item list-group-item-action py-1"
          v-for="(s, index) in suggestions"
          :key="index"
          @click="selectSuggestion(s)"
        >
          <strong>{{ s.name }}</strong>
          <small class="text-muted">({{ s.code }})</small>
        </li>
      </ul>
    </div>

    <!-- Tabel Pembelian -->
    <div class="table-responsive shadow-sm border rounded compact-scroll">
      <table class="table table-sm table-bordered align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>Produk</th>
            <th style="width: 100px">Qty</th>
            <th style="width: 130px">Harga Beli</th>
            <th class="text-end">Subtotal</th>
            <th style="width: 50px"></th>
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
              />
            </td>
            <td>
              <input
                v-model.number="item.buy_price"
                type="number"
                min="0"
                class="form-control form-control-sm text-end"
              />
            </td>
            <td class="text-end fw-semibold">
              Rp {{ (item.quantity * item.buy_price).toLocaleString() }}
            </td>
            <td class="text-center">
              <button
                class="btn btn-sm btn-outline-danger"
                @click="removeItem(item)"
              >
                <i class="bi bi-trash-fill"></i>
              </button>
            </td>
          </tr>
          <tr v-if="purchase.items.length === 0">
            <td colspan="5" class="text-center text-muted py-3">
              Belum ada produk
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Total & Simpan -->
    <div class="mt-3 d-flex justify-content-between align-items-center">
      <h5>
        Total: <span class="text-primary">Rp {{ total.toLocaleString() }}</span>
      </h5>
      <button
        class="btn btn-success"
        :disabled="!canSubmit"
        @click="submitPurchase"
      >
        <i class="bi bi-save2-fill me-1"></i>Simpan Pembelian
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import productService from "@/services/productService";
import purchaseService from "@/services/purchaseService";
import { useAlert } from "@/composables/useAlert";
const loading = ref(false);
const { confirmDelete, success, info, error } = useAlert();
const searchInputRef = ref(null);

const searchInput = ref("");
const products = ref([]);

const suggestions = ref([]);

// Default nilai awal pembelian
const purchase = ref({
  supplier: "Default Supplier",
  invoice: "",
  items: [],
});

onMounted(async () => {
  const res = await productService.getAll();
  products.value = res.data;

  generateInvoiceNumber();
  focusSearch();
});

// Generate nomor faktur otomatis
function generateInvoiceNumber() {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const random = Math.floor(Math.random() * 9000 + 1000); // 4 digit random
  purchase.value.invoice = `PB-${datePart}-${random}`;
}

function updateSuggestions() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    suggestions.value = [];
    return;
  }

  suggestions.value = products.value
    .filter((p) =>
      [p.name, p.code, p.barcode].some((val) =>
        val.toLowerCase().includes(query)
      )
    )
    .slice(0, 10); // Maksimal 5 saran
}

function selectSuggestion(product) {
  addProduct(product);
  searchInput.value = "";
  suggestions.value = [];
  focusSearch();
}

function addProductBySearch() {
  if (suggestions.value.length > 0) {
    selectSuggestion(suggestions.value[0]);
  } else {
    const query = searchInput.value.trim().toLowerCase();
    const found = products.value.find((p) =>
      [p.code, p.name, p.barcode].some((val) =>
        val.toLowerCase().includes(query)
      )
    );

    if (found) {
      addProduct(found);
      searchInput.value = "";
      suggestions.value = [];
      focusSearch();
    } else {
      alert("Produk tidak ditemukan.");
    }
  }
}

function addProduct(product) {
  const existing = purchase.value.items.find((i) => i.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    purchase.value.items.push({
      ...product,
      quantity: 1,
      buy_price: product.purchase_price ?? 0,
    });
  }
  focusSearch();
}

function removeItem(item) {
  const index = purchase.value.items.findIndex((p) => p.id === item.id);
  if (index !== -1) purchase.value.items.splice(index, 1);
}

const total = computed(() =>
  purchase.value.items.reduce((sum, i) => sum + i.quantity * i.buy_price, 0)
);

const canSubmit = computed(
  () =>
    purchase.value.supplier &&
    purchase.value.invoice &&
    purchase.value.items.length > 0
);

function focusSearch() {
  setTimeout(() => {
    searchInputRef.value?.focus();
  }, 50);
}

async function submitPurchase() {
  if (loading.value) return; // sudah ada

  try {
    const payload = {
      supplier: purchase.value.supplier,
      invoice: purchase.value.invoice,
      items: purchase.value.items.map((i) => ({
        product_id: i.id,
        quantity: i.quantity,
        buy_price: i.buy_price,
      })),
      total: total.value,
    };

    // const res = await axios.post('https://yourapi.com/api/purchase', payload)
    const res = await purchaseService.create(payload);
    // console.log(payload)
    success("Pembelian berhasil disimpan");
    // alert('Pembelian berhasil disimpan.')

    // Reset form
    purchase.value = {
      supplier: "Default Supplier",
      invoice: "",
      items: [],
    };
    generateInvoiceNumber();
  } catch (err) {
    console.error("Gagal menyimpan pembelian:", err);
    error("Terjadi kesalahan saat menyimpan");
    // alert('Terjadi kesalahan saat menyimpan.')
  }
}
</script>

<style scoped>
.compact-scroll {
  max-height: 400px;
  overflow-y: auto;
}
</style>
