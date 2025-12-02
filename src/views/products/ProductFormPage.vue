<!-- ProductEditWrapper.vue -->
<template>
  <div class="content-wrapper">
    <div class="container form-container">
      <ProductForm :product="product" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import ProductForm from "@/components/ProductForm.vue";
import productService from "@/services/productService";

const route = useRoute();
const product = ref(null);

onMounted(async () => {
  if (route.params.id) {
    const res = await productService.get(route.params.id);
    product.value = res.data;
  }
});
</script>

<style scoped>
/* Wrapper fleksibel di tengah layar */
.content-wrapper {
  min-height: calc(100vh - 60px); /* sesuaikan header jika ada */
  display: flex;
  justify-content: center;
  align-items: flex-start; /* top align agar scroll muncul */
  padding-top: 70px;
  background-color: #f8f9fa;
}

/* Container form */
.form-container {
  max-width: 960px;
  width: 100%;
}

/* Gambar preview kecil */
.img-thumbnail {
  max-height: 100px; /* kecil agar tidak scroll horizontal */
  width: auto;
  border: 1px solid #ddd;
}
</style>
