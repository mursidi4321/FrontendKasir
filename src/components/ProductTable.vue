<template>
    <div class="card shadow-sm">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Daftar Produk</h5>
        </div>

        <div class="table-responsive">
            <table class="table table-striped table-hover mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Kode</th>
                        <th>Nama</th>
                        <th>Barcode</th>
                        <th>Harga Beli</th>
                        <th>Harga Jual</th>
                        <th>Stok</th>
                        <th>Min. Stok</th>
                        <th class="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="product in products" :key="product.id">
                        <td>{{ product.code }}</td>
                        <td>{{ product.name }}</td>
                        <td>{{ product.barcode }}</td>
                        <td>{{ formatCurrency(product.purchase_price) }}</td>
                        <td>{{ formatCurrency(product.price) }}</td>
                        <td>
                            <span :class="{ 'text-danger fw-bold': product.stock <= product.min_stock }">
                                {{ product.stock }}
                            </span>
                            <small v-if="product.stock <= product.min_stock" class="text-danger ms-1"
                                title="Stok minimal tercapai">
                                &#9888;
                            </small>
                        </td>
                        <td>{{ product.min_stock }}</td>
                        <td class="text-center">
                            <!-- Order -->
                            <button class="btn btn-sm btn-outline-primary me-1" @click="$emit('order', product)">
                                <i class="bi bi-cart-plus"></i>
                            </button>

                            <!-- Edit -->
                            <button class="btn btn-sm btn-outline-warning me-1" @click="$emit('edit', product)">
                                <i class="bi bi-pencil"></i>
                            </button>

                            <!-- Delete -->
                            <button class="btn btn-sm btn-outline-danger" @click="$emit('delete', product.id)">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                    <tr v-if="products.length === 0">
                        <td colspan="8" class="text-center text-muted">Tidak ada data produk</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
defineProps(['products'])
defineEmits(['edit', 'delete', 'order'])

const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(val)
}


</script>


<style scoped>
.table td,
.table th {
    vertical-align: middle;
}
</style>
