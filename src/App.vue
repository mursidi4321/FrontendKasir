<template>
  <div class="d-flex flex-column min-vh-100">
    <!-- Navbar -->
    <AppNavbar />

    <!-- Konten utama -->
    <main class="flex-fill">
      <router-view />
    </main>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup>
import AppNavbar from "./components/AppNavbar.vue";
import AppFooter from "./components/AppFooter.vue";
</script>
