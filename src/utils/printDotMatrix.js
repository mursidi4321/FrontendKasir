export function printDotMatrixReceipt(saleData) {
  const formatLine = (left, qty, price, subtotal) => {
    // Batasan kolom dengan panjang fixed agar rapi
    const leftCol = left.length > 14 ? left.slice(0, 14) : left.padEnd(14);
    const qtyCol = String(qty).padStart(4);
    const priceCol = String(price).padStart(8);
    const subCol = String(subtotal).padStart(10);
    return `${leftCol}${qtyCol}${priceCol}${subCol}`;
  };

  const printContent = `
====================================
            NOTA PENJUALAN
------------------------------------
Tanggal : ${saleData.date.split("T")[0]}
------------------------------------
Produk         Qty   Harga   Subtotal
------------------------------------
${saleData.items
  .map((i) => formatLine(i.name, i.qty, i.price, i.subtotal))
  .join("\n")}
------------------------------------
TOTAL                     ${saleData.total.toLocaleString()}
====================================
`;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(
    `<pre style="font-family: monospace; font-size: 14px;">${printContent}</pre>`
  );
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}
