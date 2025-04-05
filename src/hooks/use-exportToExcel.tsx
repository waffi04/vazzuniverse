import { Button } from "@/components/ui/button";
import { Transaction } from "@/features/pages/dashboard/recent-transactions";
import { formatDate } from "@/utils/formatPrice";
import { trpc } from "@/utils/trpc";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

interface ExportToExcelProps {
  data: Transaction[];
  status : string
  date : string
  onClick : ()  => void
}

export function ExportToExcel({ data,status,date,onClick }: ExportToExcelProps) {

 

    const handleExport = () => {
      onClick()
        // Membuat array data yang diformat untuk Excel
        const formattedData = data.map((transaction) => {
          const profitInRupiah =
            transaction.harga > 0 ? ((transaction.harga * transaction.profit) / 100).toFixed(0) : "0";
      
          const profitPercentage = transaction.profit.toFixed(2);
      
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
            nickname : transaction.nickname || "-"
          };
        });
      
        // Buat worksheet dan workbook
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");
      
        XLSX.writeFile(workbook, `transaksi-${status}-${date}.xlsx`);
      };

    

  return (
    <Button onClick={handleExport} className="text-xs flex items-center gap-2">
      <Download className="w-4 h-4" />
      Export to Excel
    </Button>
  );
}