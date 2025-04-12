import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
const getStartOfDayInWIB = () => {
  const now = new Date(); 
  const utcMillis = now.getTime(); 
  const wibMillis = utcMillis + (7 * 60 * 60 * 1000);
  const wibDate = new Date(wibMillis); 
  const startOfDay = new Date(wibDate);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

const getStartOfMonthInWIB = () => {
  const now = new Date(); 
  const utcMillis = now.getTime(); 
  const wibMillis = utcMillis + (7 * 60 * 60 * 1000); 
  const wibDate = new Date(wibMillis); 
  const startOfMonth = new Date(wibDate);
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0); 
  return startOfMonth;
};

export const adminStats = publicProcedure.query(async ({ ctx }) => {
  try {
    const formatToRupiah = (number: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(number);
    };


    // Hitung awal hari dan bulan
    const startOfToday = getStartOfDayInWIB();
    const startOfMonth = getStartOfMonthInWIB();

    // Agregasi pendapatan hari ini dan bulan ini
    const todayData = await ctx.prisma.pembelian.aggregate({
      where: {
        status: "SUCCESS",
        createdAt: {
          gte: startOfToday,
        },
      },
      _sum: {
        harga: true,
      },
    });

    const thisMonthData = await ctx.prisma.pembelian.aggregate({
      where: {
        status: "SUCCESS",
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        harga: true,
      },
    });

    const todayRevenue = todayData._sum.harga || 0;
    const thisMonthRevenue = thisMonthData._sum.harga || 0;

    // Hitung profit hari ini dan bulan ini
    const transactionsToday = await ctx.prisma.pembelian.findMany({
      where: {
        status: "SUCCESS",
        createdAt: {
          gte: startOfToday,
        },
      },
      select: {
        harga: true,
        profit: true,
      },
    });

    const transactionsThisMonth = await ctx.prisma.pembelian.findMany({
      where: {
        status: "SUCCESS",
        createdAt: {
          gte: startOfMonth,
        },
      },
      select: {
        harga: true,
        profit: true,
      },
    });
    const todayProfit = transactionsToday.reduce((sum, transaction) => {
      const profitAmount = Math.round(transaction.harga * transaction.profit / (100 + transaction.profit));
      return sum + profitAmount;
    }, 0);
    
    const thisMonthProfit = transactionsThisMonth.reduce((sum, transaction) => {
      const profitAmount = Math.round(transaction.harga * transaction.profit / (100 + transaction.profit));
      return sum + profitAmount;
    }, 0);


    // Hitung total transaksi
    const totalTransactions = await ctx.prisma.pembelian.count();

    // Hitung transaksi berdasarkan status
    const successfulTransactions = await ctx.prisma.pembelian.count({
      where: { status: "SUCCESS" },
    });

    const pendingTransactions = await ctx.prisma.pembelian.count({
      where: { status: "PENDING" },
    });

    const failedTransactions = await ctx.prisma.pembelian.count({
      where: { status: "FAILED" },
    });


    const recentTransactions =   await  ctx.prisma.pembelian.findMany({
      take: 10,
      include: {
        pembayaran: true
      },
      orderBy: { 
        createdAt: 'desc' 
      },
    })

    const successPercentage =
      totalTransactions > 0 ? ((successfulTransactions / totalTransactions) * 100).toFixed(2) : 0;
    const failedPercentage =
      totalTransactions > 0 ? ((failedTransactions / totalTransactions) * 100).toFixed(2) : 0;

    return {
      totalTransactions,
      recentTransactions,
      statusCounts: {
        successful: successfulTransactions,
        pending: pendingTransactions,
        failed: failedTransactions,
      },
      revenue: {
        today: formatToRupiah(todayRevenue),
        thisMonthFormatted : thisMonthRevenue,
        thisMonth: formatToRupiah(thisMonthRevenue),
      },
      profit: {
        today: formatToRupiah(todayProfit),
        thisMonth: formatToRupiah(thisMonthProfit),
      },
      percentages: {
        success: `${successPercentage}%`,
        failed: `${failedPercentage}%`,
      },
    };
  } catch (error) {
    throw new Error("Failed to fetch admin statistics");
  }
});
export const PembelianAll = router({
  getId: publicProcedure
  .input(
    z.object({
      merchantOrderId: z.string().nullable()
    })
  )
  .query(async ({ ctx, input }) => {
    const { merchantOrderId } = input;

    // Periksa apakah merchantOrderId ada
    if (!merchantOrderId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Merchant Order ID is required'
      });
    }

    // Gunakan findUnique dengan kondisi yang spesifik
    const purchase = await ctx.prisma.pembelian.findUnique({
      where: {
        orderId: merchantOrderId
      },
      include: {
        pembayaran: true,
      }
    });

    if (!purchase) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction details not found'
      });
    }

    // Fetch layanan details jika diperlukan
    let layananDetails = null;
    if (purchase.layanan) {
      layananDetails = await ctx.prisma.layanan.findFirst({
        where: {
          layanan: purchase.layanan
        }
      });
    }

    return {
      purchase,
      layananDetails,
    };
  }),
  getAll: publicProcedure
  .input(
    z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      status: z.string().optional(),
      page: z.number().min(1).optional().default(1),
      limit: z.number().min(1).optional().default(10),
      searchTerm: z.string().optional().default(''),
      all: z.boolean().optional().default(false),
    })
  )
  .query(async ({ ctx, input }) => {
    try {
      const { status, page, limit, searchTerm, endDate, startDate, all } = input;
      
      // Build the where clause
      const where: Prisma.PembelianWhereInput = {};
      
      // Filter by status
      if (status) {
        where.status = status;
      }
      
      // Search filter
      if (searchTerm) {
        where.OR = [
          { orderId: { contains: searchTerm} },
          { nickname: { contains: searchTerm } },
        ];
      }
      
      // Date filters
      if (startDate || endDate) {
        where.createdAt = {};
        
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          where.createdAt.gte = start;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.createdAt.lte = end;
        }
      }
      
      // Return all records if all flag is set
      if (all) {
        const allTransactions = await ctx.prisma.pembelian.findMany({
          where,
          include: { 
            pembayaran: true 
          },
          orderBy: { 
            createdAt: 'desc' 
          },
        });
        
        return {
          transactions: allTransactions,
          totalCount: allTransactions.length,
        };
      }
      
      // Pagination
      const skip = (page - 1) * limit;
      
      // Execute queries in parallel
      const [transactions, totalCount] = await Promise.all([
        ctx.prisma.pembelian.findMany({
          where,
          skip,
          take: limit,
          include: {
            pembayaran: true
          },
          orderBy: { 
            createdAt: 'desc' 
          },
        }),
        ctx.prisma.pembelian.count({ where }),
      ]);
      
      return {
        transactions,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page,
      };
    } catch (error) {
      // Enhanced error reporting
      if (error instanceof Error) {
        throw new Error(`Failed to fetch pembelian data: ${error.message}`);
      }
      throw new Error("Failed to fetch pembelian data: Unknown error");
    }
  }),
      trackingInvoice  : publicProcedure.input(z.object({
        invoice: z.string()
      })).query(async({ctx,input})  => {
        try {
          return await ctx.prisma.pembayaran.findFirst({
            where : {
              orderId : input.invoice
            },
            select : {
              orderId : true,
              noPembeli : true,
              status : true,
              updatedAt : true
            }
          })
        } catch (error) {
          throw new Error("Invoice tidak ditemukan")
        }
      }),
      findMostPembelian  : publicProcedure.query(async({ctx})  => {
          return await ctx.prisma.pembayaran.findMany({
            take : 10,
            select : {
                orderId : true,
                noPembeli : true,
                status : true,
                updatedAt : true
            },
            orderBy : {
              createdAt : 'desc'
            }
          })
        
      }),
      getAllPembelianData: publicProcedure
      .query(async ({ ctx }) => {
        const now = new Date(); 
    
        // Today: Last 24 hours
        const last24Hours = new Date(now);
        last24Hours.setHours(now.getHours() - 24);
    
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
    
        const lastMonth = new Date(now);
        lastMonth.setDate(now.getDate() - 30);
        
        const aggregateAndSort = (transactions: any[]) => {
          const userTotals = new Map();
          
          transactions.forEach(tx => {
            console.log(tx)
            const userKey = tx.username
            
            if (!userKey) return;
            
            if (userTotals.has(userKey)) {
              const existingData = userTotals.get(userKey);
              userTotals.set(userKey, {
                username: tx.username || existingData.username,
                harga: existingData.harga + tx.harga
              });
            } else {
              userTotals.set(userKey, {
                username: tx.username,
                harga: tx.harga
              });
            }
          });
          
          return Array.from(userTotals.values())
            .sort((a, b) => b.harga - a.harga)
            .slice(0, 10); // Take top 10
        };
        
        // Common filter for successful transactions
        const commonFilter = {
          NOT: {
            AND: [
              { username: "Guest" },
              { nickname: "not-found" }
            ]
          },
          status: {
            in: ["SUCCESS", "Success"]
          }
        };
        
        // Execute all queries in parallel for better performance
        const [todayTransactions, weekTransactions, monthTransactions] = await Promise.all([
          // Today's transactions (last 24 hours)
          ctx.prisma.pembelian.findMany({
            where: {
              createdAt: {
                gte: last24Hours,
                lte: now
              },
              ...commonFilter
            },
            select: {
              nickname: true,
              username: true,
              harga: true,
            }
          }),
          
          // This week's transactions (last 7 days)
          ctx.prisma.pembelian.findMany({
            where: {
              createdAt: {
                gte: lastWeek,
                lte: now
              },
              ...commonFilter
            },
            select: {
              nickname: true,
              username: true,
              harga: true,
            }
          }),
          
          // This month's transactions (last 30 days)
          ctx.prisma.pembelian.findMany({
            where: {
              createdAt: {
                gte: lastMonth,
                lte: now
              },
              ...commonFilter
            },
            select: {
              nickname: true,
              username: true,
              harga: true,
            }
          })
        ]);
        
        // Aggregate and sort each time period's data
        const expensiveToday = aggregateAndSort(todayTransactions);
        const expensiveWeek = aggregateAndSort(weekTransactions);
        const expensiveMonth = aggregateAndSort(monthTransactions);
        
        // Return all data in a structured object
        return {
          expensive: {
            today: expensiveToday,
            week: expensiveWeek,
            month: expensiveMonth
          }
        };
      })
  });


