<template>
  <div class="card shadow-sm">
    <div
      class="card-header bg-success text-white d-flex justify-content-between align-items-center"
    >
      <h5 class="mb-0">{{ isEdit ? "Edit Produk" : "Tambah Produk Baru" }}</h5>
      <router-link class="btn btn-outline-light btn-sm" to="/products">
        ← Kembali
      </router-link>
    </div>

    <div class="card-body">
      <form @submit.prevent="submitForm" @keydown.enter.prevent>
        <div class="row g-3">
          <!-- KODE PRODUK -->
          <div class="col-md-3">
            <label class="form-label">Kode Produk</label>
            <input
              type="text"
              v-model="form.code"
              class="form-control"
              readonly
            />
          </div>

          <!-- TIPE -->
          <div class="col-md-3">
            <label class="form-label">Barang / Jasa</label>
            <select v-model="form.type" class="form-select">
              <option value="barang">Barang</option>
              <option value="jasa">Jasa</option>
            </select>
          </div>

          <!-- NAMA -->
          <div class="col-md-6">
            <label class="form-label">Nama Produk</label>
            <input
              v-model="form.name"
              class="form-control"
              required
              ref="nameInput"
            />
          </div>

          <!-- BARCODE -->
          <div class="col-md-6">
            <label class="form-label">Barcode</label>
            <input
              v-model="form.barcode"
              @blur="checkDuplicateBarcode"
              class="form-control"
              :class="{ 'is-invalid': barcodeError }"
            />
            <div v-if="barcodeError" class="invalid-feedback">
              Barcode sudah digunakan.
            </div>
          </div>

          <!-- HARGA JUAL -->
          <div class="col-md-3">
            <label class="form-label">Harga Jual</label>
            <input
              type="number"
              min="0"
              v-model.number="form.price"
              class="form-control"
              required
            />
          </div>

          <!-- HARGA BELI -->
          <div class="col-md-3">
            <label class="form-label">Harga Beli</label>
            <input
              type="number"
              min="0"
              v-model.number="form.purchase_price"
              class="form-control"
              required
            />
          </div>

          <!-- HARGA GROSIR -->
          <div class="col-md-3">
            <label class="form-label">Harga Grosir</label>
            <input
              type="number"
              min="0"
              v-model.number="form.wholesale_price"
              class="form-control"
            />
          </div>

          <!-- MIN QTY GROSIR -->
          <div class="col-md-3">
            <label class="form-label">Min. Qty Grosir</label>
            <input
              type="number"
              min="0"
              v-model.number="form.wholesale_min_qty"
              class="form-control"
            />
          </div>

          <!-- STOK -->
          <div class="col-md-2">
            <label class="form-label">Stok</label>
            <input
              type="number"
              min="0"
              v-model.number="form.stock"
              class="form-control"
              required
            />
          </div>

          <!-- MIN STOK -->
          <div class="col-md-2">
            <label class="form-label">Minimal Stok</label>
            <input
              type="number"
              min="0"
              v-model.number="form.min_stock"
              class="form-control"
            />
          </div>

          <!-- INPUT GAMBAR -->
          <div class="col-md-8">
            <label class="form-label">Gambar Produk</label>
            <input
              type="file"
              class="form-control"
              accept="image/*"
              @change="onFileChange"
            />
          </div>

          <!-- PREVIEW GAMBAR BARU -->
          <div class="col-md-4 text-center" v-if="previewImage">
            <label class="form-label">Preview</label>
            <img
              :src="previewImage"
              class="img-thumbnail"
              style="max-height: 100px; width: auto"
            />
          </div>

          <!-- GAMBAR LAMA -->
          <div
            class="col-md-4 text-center"
            v-if="isEdit && form.image_path && !previewImage"
          >
            <label class="form-label">Gambar Lama</label>
            <img
              :src="imageUrl(form.image_path)"
              class="img-thumbnail"
              style="max-height: 150px; width: auto"
            />
          </div>
        </div>

        <div class="mt-4 d-flex gap-2 justify-content-end">
          <button class="btn btn-success" type="submit">
            {{ isEdit ? "Update" : "Simpan" }}
          </button>
          <button class="btn btn-secondary" type="button" @click="resetForm">
            Reset
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import productService from "@/services/productService";
import uploadService from "@/services/uploadService";
import { useAlert } from "@/composables/useAlert";

const { success, error } = useAlert();
const route = useRoute();
const router = useRouter();

const SERVER = import.meta.env.VITE_API_URL;
const SERVER_BASE = SERVER.replace("/api", ""); // lokasi file statis

const isEdit = route.name === "ProductEdit";
const id = route.params.id;

const form = ref({
  name: "",
  code: "",
  barcode: "",
  purchase_price: 0,
  price: 0,
  stock: 0,
  min_stock: 0,
  type: "barang",
  wholesale_price: null,
  wholesale_min_qty: 0,
  image_path: null,
});

const nameInput = ref(null);
const barcodeError = ref(false);

const imageFile = ref(null);
const previewImage = ref(null);

function onFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  imageFile.value = file;
  previewImage.value = URL.createObjectURL(file);
}

function imageUrl(path) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${SERVER_BASE}/${path}`;
}

const checkDuplicateBarcode = async () => {
  const barcode = form.value.barcode?.trim();
  if (!barcode) return;

  try {
    const res = await productService.checkBarcode(barcode);
    barcodeError.value = res.data.exists;
  } catch {}
};

const loadProduct = async () => {
  const res = await productService.get(id);
  form.value = res.data;
};

const generateCode = async () => {
  const res = await productService.getNextCode();
  form.value.code = res.data.nextCode;
};

const uploadImageIfAny = async () => {
  if (!imageFile.value) return null;
  const res = await uploadService.uploadProductImage(imageFile.value);
  return res.data.image_path;
};

const resetForm = () => {
  imageFile.value = null;
  previewImage.value = null;

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
      wholesale_price: null,
      wholesale_min_qty: 0,
      image_path: null,
    };
    generateCode();
  }
};

const submitForm = async () => {
  if (barcodeError.value) return error("Barcode duplikat!");

  let imagePath = await uploadImageIfAny();
  if (imagePath) form.value.image_path = imagePath;

  try {
    if (isEdit) await productService.update(id, form.value);
    else await productService.create(form.value);

    success("Produk berhasil disimpan");
    router.push("/products");
  } catch (err) {
    error(err.response?.data?.message || "Gagal menyimpan produk");
  }
};

onMounted(() => {
  if (isEdit) loadProduct();
  else generateCode();

  nameInput.value?.focus();
});
</script>

<style scoped>
.img-thumbnail {
  border: 1px solid #ddd;
}
</style>
