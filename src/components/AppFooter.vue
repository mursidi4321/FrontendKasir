<template>
  <footer class="bg-light text-muted py-2 border-top small text-center">
    <div>
      &copy; {{ year }} <strong>POS Sescom Kasir</strong> • Dibuat oleh
      <a href="https://yourdomain.com" target="_blank">Mursidi</a>
    </div>
    <div>
      <span class="text-secondary">Versi {{ version }}</span>
    </div>
  </footer>
</template>
<script setup>
const year = new Date().getFullYear();
const version = "1.0.0";
</script>
<style scoped>
footer {
  position: relative;
  bottom: 0;
  width: 100%;
}
</style>
