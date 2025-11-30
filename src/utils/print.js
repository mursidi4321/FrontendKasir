export function printReceipt(saleData) {
  const printWindow = window.open("", "_blank", "width=400,height=600");
  if (!printWindow) return;

  const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    });

  const itemsHtml = saleData.items
    .map(
      (item) => `
        <tr>
          <td colspan="2">${item.name}</td>
          <td class="text-end">${item.qty} x ${formatRupiah(item.price)}</td>
        </tr>
        <tr>
          <td colspan="3" class="text-end subtotal">Subtotal: ${formatRupiah(
            item.subtotal
          )}</td>
        </tr>
      `
    )
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>Struk Penjualan</title>
        <style>
          body {
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
            width: 280px;
            margin: auto;
            color: #000;
          }
          .text-end { text-align: right; }
          .text-center { text-align: center; }
          .line {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          td {
            padding: 2px 0;
            vertical-align: top;
          }
          .subtotal {
            font-size: 11px;
            color: #444;
          }
          .total {
            font-weight: bold;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="text-center">
          <strong>SESCOM Stationary</strong><br/>
          Jl. Kahuripan No.92 Sumber<br/>
          SOLO<br/>
          -----------------------------
        </div>

        <div><strong>Tanggal:</strong> ${formatDate(saleData.date)}</div>

        <div class="line"></div>

        <table>
          ${itemsHtml}
        </table>

        <div class="line"></div>

        <table>
          <tr>
            <td class="text-end total" colspan="3">Total: ${formatRupiah(
              saleData.total
            )}</td>
          </tr>
        </table>

        <div class="line"></div>

        <div class="text-center">
          Terima kasih 🙏<br/>
          ~ Selamat Berbelanja Kembali ~
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}
