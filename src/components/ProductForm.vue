<template>
  <div class="card shadow-sm">
    <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
      <h5 class="mb-0">{{ isEdit ? "Edit Produk" : "Tambah Produk Baru" }}</h5>
      <router-link class="btn btn-outline-light btn-sm" to="/products">← Kembali ke Daftar Produk</router-link>
    </div>
    <div class="card-body">
      <form @submit.prevent="submitForm" @keydown.enter.prevent>
        <div class="row g-3">
          <!-- KODE PRODUK -->
          <div class="col-md-3">
            <label class="form-label">Kode Produk</label>
            <input type="text" v-model="form.code" class="form-control" readonly />
          </div>

          <!-- BARANG/JASA -->
          <div class="col-md-3">
            <label class="form-label">Barang/Jasa</label>
            <select v-model="form.type" class="form-select">
              <option value="barang">Barang</option>
              <option value="jasa">Jasa</option>
            </select>
          </div>

          <!-- NAMA PRODUK -->
          <div class="col-md-6">
            <label class="form-label">Nama</label>
            <input v-model="form.name" class="form-control" required ref="nameInput" />
          </div>

          <!-- BARCODE -->
          <div class="col-md-6">
            <label class="form-label">Barcode</label>
            <input v-model="form.barcode" @blur="checkDuplicateBarcode" class="form-control" :class="{ 'is-invalid': barcodeError }" />
            <div v-if="barcodeError" class="invalid-feedback">Barcode sudah digunakan, silakan ganti.</div>
          </div>

          <!-- HARGA JUAL -->
          <div class="col-md-3">
            <label class="form-label">Harga Jual</label>
            <input type="number" v-model.number="form.price" class="form-control" required min="0" />
          </div>

          <!-- HARGA BELI -->
          <div class="col-md-3">
            <label class="form-label">Harga Beli</label>
            <input type="number" v-model.number="form.purchase_price" class="form-control" required min="0" />
          </div>

          <!-- STOK -->
          <div class="col-md-2">
            <label class="form-label">Stok</label>
            <input type="number" v-model.number="form.stock" class="form-control" required min="0" />
          </div>

          <!-- MIN STOK -->
          <div class="col-md-2">
            <label class="form-label">Min. Stok</label>
            <input type="number" v-model.number="form.min_stock" class="form-control" min="0" />
          </div>

          <!-- SATUAN -->
          <div class="col-md-2">
            <label class="form-label">Satuan</label>
            <select v-model="form.satuan" class="form-select">
              <option value="pcs">PCS</option>
              <option value="pack">Pack</option>
              <option value="box">Box</option>
              <option value="kg">Kg</option>
              <option value="gram">Gram</option>
              <option value="liter">Liter</option>
              <option value="meter">Meter</option>
            </select>
          </div>

          <!-- SATUAN DASAR -->
          <div class="col-md-2">
            <label class="form-label">Satuan Dasar</label>
            <input v-model="form.satuan_dasar" class="form-control" required />
          </div>

          <!-- KONVERSI -->
          <div class="col-md-4">
            <label class="form-label">Konversi (JSON)</label>
            <input v-model="konversiText" class="form-control" placeholder='{"box":12,"pack":6}' />
          </div>
        </div>

        <div class="mt-4 d-flex gap-2 justify-content-end">
          <button class="btn btn-success" type="submit">{{ isEdit ? "Update" : "Simpan" }}</button>
          <button class="btn btn-secondary" type="button" @click="resetForm"><i class="bi bi-x-circle"></i> Reset</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import productService from "@/services/productService";
import { useAlert } from "@/composables/useAlert";

const { success, error } = useAlert();
const route = useRoute();
const router = useRouter();

const form = ref({
  name: "",
  code: "",
  barcode: "",
  purchase_price: 0,
  price: 0,
  stock: 0,
  min_stock: 0,
  type: "barang",
  satuan: "pcs",
  satuan_dasar: "pcs",
  konversi: {},
});

const konversiText = ref(JSON.stringify(form.value.konversi));
watch(konversiText, val => {
  try {
    form.value.konversi = JSON.parse(val || "{}");
  } catch {
    // invalid JSON
  }
});

const nameInput = ref(null);
const isEdit = route.name === "ProductEdit";
const id = route.params.id;

const barcodeError = ref(false);
const submitting = ref(false);

const checkDuplicateBarcode = async () => {
  try {
    barcodeError.value = false;
    const barcode = form.value.barcode?.trim();
    if (!barcode) return;

    const res = await productService.checkBarcode(barcode);
    if (res.data.exists) {
      barcodeError.value = true;
      error("Barcode sudah digunakan, silakan ganti.");
    }
  } catch (err) {
    console.error("Gagal cek barcode:", err);
  }
};

const loadProduct = async () => {
  try {
    const res = await productService.get(id);
    form.value = res.data;
    konversiText.value = JSON.stringify(form.value.konversi || {});
    if (!form.value.satuan) form.value.satuan = "pcs";
    if (!form.value.satuan_dasar) form.value.satuan_dasar = "pcs";
  } catch (err) {
    console.error(err);
    error("Gagal memuat data produk");
  }
};

const submitForm = async () => {
  if (submitting.value) return;
  submitting.value = true;

  try {
    if (!form.value.name || form.value.name.length < 2) {
      error("Nama produk minimal 2 karakter");
      return;
    }
    if (barcodeError.value) {
      error("Barcode duplikat, tidak bisa disimpan.");
      return;
    }

    if (isEdit) {
      await productService.update(id, form.value);
      success("Produk berhasil diperbarui");
    } else {
      await productService.create(form.value);
      success("Produk berhasil ditambahkan");
    }

    router.push({ name: "ProductList" });
  } catch (err) {
    console.error(err);
    error("Gagal menyimpan produk", err.response?.data?.message || err.message);
  } finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  if (isEdit) loadProduct();
  else {
    form.value = {
      name: "",
      code: "",
      barcode: "",
      purchase_price: 0,
      price: 0,
      stock: 0,
      min_stock: 0,
      type: "barang",
      satuan: "pcs",
      satuan_dasar: "pcs",
      konversi: {},
    };
    konversiText.value = "{}";
    generateCode();
  }
};

const generateCode = async () => {
  try {
    const res = await productService.getNextCode();
    form.value.code = res.data.nextCode;
  } catch (err) {
    console.error(err);
  }
};

onMounted(async () => {
  if (isEdit) await loadProduct();
  else await generateCode();
  nameInput.value?.focus();
});
</script>
