import { Button } from "@/components/ui/button";
import { Transaction } from "@/features/pages/dashboard/recent-transactions";
import { formatDate } from "@/utils/formatPrice";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

interface ExportToExcelProps {
  data: Transaction[];
  status: string;
  date: string;
  onClick: () => void;
}


export function ExportToExcel({ data, status, date, onClick }: ExportToExcelProps) {
  const handleExport = () => {
    onClick();
    // Format data untuk ekspor, termasuk profit per transaksi
    const formattedData = data.map((transaction) => {
      const profitPercentage = transaction.profit || 0;
      const profitInRupiah = Math.round(
        (transaction.harga * profitPercentage) / (100 + profitPercentage)
      );

      return {
        ID: transaction.id,
        OrderID: transaction.orderId,
        Username: transaction.username || "-",
        Layanan: transaction.layanan,
        Harga: transaction.harga,
        "Profit (Rp)": profitInRupiah,
        "Profit (%)": profitPercentage,
        Status: transaction.status,
        Tanggal: formatDate(transaction.createdAt as string) || "-",
        MetodePembayaran: transaction.pembayaran?.metode || "-",
        NoPembeli: transaction.pembayaran?.noPembeli || "-",
        Zone: transaction.zone || "-",
        UserID: transaction.userId || "-",
        Nickname: transaction.nickname || "-",
      };
    });

    // Hitung total profit untuk semua transaksi
    const totalProfit = formattedData.reduce((sum, transaction) => {
      return sum + transaction["Profit (Rp)"];
    }, 0);

    // Tambahkan baris total di bawah data
    const totalRow = {
      ID: "",
      OrderID: "",
      Username: "",
      Layanan: "Total Profit",
      Harga: "",
      "Profit (Rp)": totalProfit,
      "Profit (%)": "",
      Status: "",
      Tanggal: "",
      MetodePembayaran: "",
      NoPembeli: "",
      Zone: "",
      UserID: "",
      Nickname: "",
    };

    // Gabungkan data transaksi dengan baris total
    const finalData = [...formattedData, totalRow];

    // Buat worksheet dan workbook
    const worksheet = XLSX.utils.json_to_sheet(finalData);

    // Atur lebar kolom agar lebih rapi
    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 20 }, // OrderI
      { wch: 15 }, // Username
      { wch: 50 }, // Layanan
      { wch: 15 }, // Harga
      { wch: 15 }, // Profit (Rp)
      { wch: 15 }, // Profit (%)
      { wch: 15 }, // Status
      { wch: 30 }, // Tanggal
      { wch: 30 }, // MetodePembayaran
      { wch: 20 }, // NoPembeli
      { wch: 10 }, // Zone
      { wch: 15 }, // UserID
      { wch: 15 }, // Nickname
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");

    // Ekspor ke file Excel
    XLSX.writeFile(workbook, `transaksi-${status}-${date}.xlsx`);
  };

  return (
    <Button onClick={handleExport} className="text-xs flex items-center gap-2">
      <Download className="w-4 h-4" />
      Export to Excel
    </Button>
  );
}