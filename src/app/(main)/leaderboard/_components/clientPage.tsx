'use client';
import { trpc } from '@/utils/trpc';
import { FormatPrice } from '@/utils/formatPrice';



export function LeaderboardPage() {
  // Fetch semua data transaksi sekaligus
  const { data: allData, isLoading: loadingAllData } =
    trpc.pembelian.getAllPembelianData.useQuery();

  if (loadingAllData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-cyan-500"></div>
      </div>
    );
  }

  // Data categories
  const todayTransactions = allData?.expensive?.today || [];
  const weekTransactions = allData?.expensive?.week || [];
  const monthTransactions = allData?.expensive?.month || [];


  return (
    <main className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-extrabold text-white text-center mb-12 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
        Leaderboard Transaksi
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Hari Ini */}
        <LeaderboardCard
          title="Hari Ini"
          transactions={todayTransactions}
          emptyMessage="Belum ada transaksi hari ini"
        />

        {/* Minggu Ini */}
        <LeaderboardCard
          title="Minggu Ini"
          transactions={weekTransactions}
          emptyMessage="Belum ada transaksi minggu ini"
        />

        {/* Bulan Ini */}
        <LeaderboardCard
          title="Bulan Ini"
          transactions={monthTransactions}
          emptyMessage="Belum ada transaksi bulan ini"
        />
      </div>
    </main>
  );
}

// Komponen reusable untuk kartu leaderboard
function LeaderboardCard({
  title,
  transactions,
  emptyMessage,
}: {
  title: string
  transactions: {
    nickname : string,
    username : string,
    harga : number
  }[],
  emptyMessage: string
}) {
  return (
    <div className="relative pt-6 mb-7">
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold py-1 px-4 rounded-full text-sm z-10">
        TOP {title}
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-cyan-400">#{index + 1}</span>
                  <span className="text-gray-300 text-sm">{transaction.nickname || transaction.username}</span>
                </div>
                <div className="text-sm font-semibold text-green-400">
                  {FormatPrice(transaction.harga)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-6">{emptyMessage}</div>
        )}
      </div>
    </div>
  )
}