<template>
  <nav class="navbar navbar-expand-lg navbar-custom fixed-top shadow-sm">
    <div class="container">
      <router-link to="/" class="navbar-brand d-flex align-items-center">
        <i class="fas fa-cash-register me-2"></i>
        SESCOM KASIR
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link
              to="/"
              class="nav-link"
              exact-active-class="active"
            >
              <i class="fas fa-store me-1"></i> Kasir
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              to="/products"
              class="nav-link"
              exact-active-class="active"
            >
              <i class="fas fa-box-open me-1"></i> Produk
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              to="/purchases"
              class="nav-link"
              exact-active-class="active"
            >
              <i class="fas fa-shopping-cart me-1"></i> Pembelian
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              to="/cashflows"
              class="nav-link"
              exact-active-class="active"
            >
              <i class="fas fa-money-bill-wave me-1"></i> Cashflow
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              to="/reports"
              class="nav-link"
              exact-active-class="active"
            >
              <i class="fas fa-file-invoice-dollar me-1"></i> Laporan
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap");

.navbar-custom {
  background-color: #181122;
  font-family: "Poppins", sans-serif;
}

.navbar-brand {
  font-weight: 600;
  font-size: 1.6rem;
  color: #fff;
}

.navbar-brand i {
  font-size: 1.5rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  transition: color 0.3s ease, transform 0.2s ease;
}

.nav-link i {
  font-size: 1.1rem;
}

/* Hover efek: sedikit lebih terang */
.nav-link:hover {
  color: #b8f5d6;
  transform: translateY(-1px);
}

/* Aktif: warna paling terang (putih penuh / hijau neon) */
.nav-link.active {
  color: #00ffae !important;
  font-weight: 600;
  border-bottom: 2px solid #00ffae; /* garis bawah aktif opsional */
  transform: translateY(-1px);
}

/* Navbar toggler style */
.navbar-toggler {
  border-color: rgba(255, 255, 255, 0.7);
}

.navbar-toggler-icon {
  filter: invert(1);
}

/* Spacing item terakhir */
.navbar-nav .nav-item:last-child {
  margin-right: 10px;
}

/* Responsif */
@media (max-width: 576px) {
  .navbar-brand {
    font-size: 1.2rem;
  }
  .nav-link {
    font-size: 0.9rem;
  }
}
</style>
