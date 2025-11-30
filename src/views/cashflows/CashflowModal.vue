<template>
  <div class="modal-backdrop">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          {{ form.id ? "Edit Cashflow" : "Tambah Cashflow" }}
        </h5>
        <button
          type="button"
          class="btn-close"
          @click="$emit('close')"
        ></button>
      </div>

      <div class="modal-body">
        <div class="mb-3">
          <label class="form-label">Tanggal</label>
          <input type="date" v-model="form.date" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">Deskripsi</label>
          <input type="text" v-model="form.description" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">Jenis</label>
          <input
            type="text"
            class="form-control"
            :value="form.type === 'in' ? 'Masuk' : 'Keluar'"
            readonly
          />
          <!-- hidden value to be submitted -->
          <input type="hidden" v-model="form.type" />
        </div>
        <div class="mb-3">
          <label class="form-label">Jumlah</label>
          <input
            type="number"
            v-model.number="form.amount"
            class="form-control"
            min="1"
          />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Batal</button>
        <button class="btn btn-primary" @click="save">Simpan</button>
      </div>
    </div>

    <!-- Toast Error -->
    <div v-if="toastMessage" class="toast-error">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import cashflowService from "@/services/cashflowService";
import { useAlert } from "@/composables/useAlert";

const props = defineProps({
  cashflow: Object,
});
const emit = defineEmits(["close", "saved"]);

const { success } = useAlert();

const form = reactive({
  id: null,
  date: "",
  description: "",
  type: "in",
  amount: 0,
});

const toastMessage = ref("");

watch(
  () => props.cashflow,
  (val) => {
    if (val) {
      Object.assign(form, val);
    } else {
      form.id = null;
      form.date = new Date().toISOString().slice(0, 10);
      form.description = "";
      form.type = "in";
      form.amount = 0;
    }
  },
  { immediate: true }
);

const showError = (msg) => {
  toastMessage.value = msg;
  setTimeout(() => (toastMessage.value = ""), 3000);
};

const save = async () => {
  if (!form.date || !form.description || !form.amount) {
    showError("⚠️ Harap lengkapi semua field.");
    return;
  }

  try {
    if (form.id) {
      await cashflowService.update(form.id, form);
    } else {
      await cashflowService.create(form);
    }
    success("✅ Data berhasil disimpan.");
    emit("saved");
  } catch (err) {
    showError("❌ Gagal menyimpan data.");
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.modal-header,
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-weight: bold;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.2rem;
}

.toast-error {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #dc3545;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  font-size: 0.95rem;
  z-index: 10000;
}
</style>
