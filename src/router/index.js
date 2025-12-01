import { createRouter, createWebHistory } from "vue-router";

import PosPage from "@/views/sales/PosPage.vue";
import ProductList from "@/views/products/ProductList.vue";
import ProductFormPage from "@/views/products/ProductFormPage.vue";
import ProductDetail from "@/views/products/ProductDetail.vue";
import PurchasesView from "@/views/purchases/PurchasesView.vue";
import CashflowPage from "@/views/cashflows/CashflowPage.vue";
import ReportPage from "@/views/reports/DashboarReportPage.vue";
import ProfitLossPage from "@/views/reports/ProfitLossPage.vue";
// import ReportStock from "@/views/reports/ReportStock.vue";
import ReportStockDetai from "@/views/reports/ReportStockDetai.vue";
import ReportLowStock from "@/views/reports/ReportLowStock.vue";
import SalesReportPage from "@/views/reports/SalesReportPage.vue";
import ReportPurchasePage from "@/views/reports/ReportPurchasePage.vue";
import TopSellingReport from "@/views/reports/TopSellingReport.vue";

const routes = [
  // Products
  { path: "/", name: "PosPage", component: PosPage },
  { path: "/products", name: "ProductList", component: ProductList },
  {
    path: "/products/create",
    name: "ProductCreate",
    component: ProductFormPage,
  },
  {
    path: "/products/edit/:id",
    name: "ProductEdit",
    component: ProductFormPage,
    props: true,
  },
  {
    path: "/products/:id",
    name: "ProductDetail",
    component: ProductDetail,
    props: true,
  },

  // Pembelian
  { path: "/purchases", name: "PurchaseView", component: PurchasesView },

  // Cashflow
  { path: "/cashflows", name: "Cashfows", component: CashflowPage },

  // Report / laporan
  { path: "/reports", name: "ReportView", component: ReportPage },
  { path: "/reports/sales", name: "SalesReport", component: SalesReportPage },
  {
    path: "/reports/purchases",
    name: "ReportPurchasePage",
    component: ReportPurchasePage,
  },
  {
    path: "/reports/profit-loss",
    name: "ProfitLoss",
    component: ProfitLossPage,
  },
  {
    path: "/reports/stocks",
    name: "ReportStockDetail",
    component: ReportStockDetai,
  },
  {
    path: "/reports/low-stock",
    name: "ReportLowStock",
    component: ReportLowStock,
  },
  {
    path: "/reports/top-seller",
    name: "TopSellingReport",
    component: TopSellingReport,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
