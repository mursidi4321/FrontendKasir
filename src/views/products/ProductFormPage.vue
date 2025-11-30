<template>
  <div class="content-wrapper d-flex justify-content-center align-items-center">
    <div class="container" style="max-width: 960px">
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
.content-wrapper {
  min-height: calc(100vh - 60px - 40px);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  background-color: #f8f9fa;
  overflow: hidden;
}
</style>
