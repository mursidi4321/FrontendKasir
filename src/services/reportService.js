import axios from "axios";

// Ganti dengan .env jika perlu
// const SERVER = "http://localhost:5000/api";
const SERVER = import.meta.env.VITE_API_URL;
const API_URL = `${SERVER}/reports`;

const handleError = (label, error, fallback = null) => {
  console.error(`❌ ${label}:`, error?.response?.data || error.message);
  return fallback;
};

// Dashboard
export const getDashboardReport = async () => {
  try {
    const res = await axios.get(`${API_URL}/dashboard`);
    return res.data;
  } catch (error) {
    return handleError("Dashboard report", error, {});
  }
};

// Report penjualan
export const getSalesReport = async (start, end) => {
  try {
    const res = await axios.get(`${API_URL}/sales`, { params: { start, end } });
    return res.data;
  } catch (error) {
    return handleError("Sales report", error, []);
  }
};

// Laba rugi
export const getProfitLossReport = async (start, end) => {
  try {
    const res = await axios.get(`${API_URL}/profit-loss`, {
      params: { start, end },
    });
    return res.data;
  } catch (error) {
    return handleError("Profit-loss report", error, {});
  }
};

// Total stok
export const getTotalStockReport = async () => {
  try {
    const res = await axios.get(`${API_URL}/total-stock`);
    return res.data;
  } catch (error) {
    return handleError("Total stock report", error, 0);
  }
};

/* ---------------------------------------------
   🔥 Fix utama: Top Selling Report
   Backend endpoint = /api/reports/top-selling
----------------------------------------------*/
export const getTopSellingReport = async (month, year) => {
  try {
    const res = await axios.get(`${API_URL}/top-selling`, {
      params: { month, year }
    });

    return res.data; // { month, year, data: [...] }
  } catch (error) {
    return {
      month,
      year,
      data: []   // fallback wajib array
    };
  }
};



// --- Get Sale Detail ---
export async function getSaleDetail(id) {
  const res = await fetch(`/api/sales/${id}`);
  if (!res.ok) throw new Error("Gagal mengambil detail penjualan");
  return await res.json(); 
}
