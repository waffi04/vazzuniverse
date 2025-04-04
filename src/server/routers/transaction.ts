import { TRANSACTION_FLOW } from "@/types/transaction";
import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
export const adminStats = publicProcedure.query(async ({ ctx }) => {
  try {
    // Format number to Rupiah
    const formatToRupiah = (number : number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(number);
    };

    // Get current date
    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Get total transactions
    const totalTransactions = await ctx.prisma.pembelian.count();
    
    // Get successful transactions
    const successfulTransactions = await ctx.prisma.pembelian.count({
      where: {
        status: "SUCCESS"
      }
    });
    
    // Get pending transactions
    const pendingTransactions = await ctx.prisma.pembelian.count({
      where: {
        status: TRANSACTION_FLOW.PENDING
      }
    });
    
    // Get failed transactions
    const failedTransactions = await ctx.prisma.pembelian.count({
      where: {
        status: TRANSACTION_FLOW.FAILED
      }
    });
    
    // Get today's data (revenue and profit combined)
    const todayData = await ctx.prisma.pembelian.aggregate({
      where: {
        status: "SUCCESS",
        createdAt: {
          gte: startOfToday
        }
      },
      _sum: {
        profit: true,
        harga: true
      }
    });
    
    // Gunakan nilai yang aman dengan default 0 jika null
    const todayProfit = todayData._sum.profit || 0;
    const todayRevenue = todayData._sum.harga || 0;
    
    // Hitung persentase profit hanya jika revenue > 0 untuk menghindari division by zero
    const todayProfitPercentage = todayRevenue > 0 
      ? (todayProfit / todayRevenue) * 100 
      : 0;
    
    // Get this month's revenue and profit in one query
    const thisMonthData = await ctx.prisma.pembelian.aggregate({
      where: {
        status: "SUCCESS",
        createdAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        harga: true,
        profit: true
      }
    });
    
    const thisMonthRevenue = thisMonthData._sum.harga || 0;
    const thisMonthProfit = thisMonthData._sum.profit || 0;
    const thisMonthProfitPercentage = thisMonthRevenue > 0 
      ? (thisMonthProfit / thisMonthRevenue) * 100 
      : 0;
    
    // Get last month's revenue and profit in one query
    const lastMonthData = await ctx.prisma.pembelian.aggregate({
      where: {
        status: "SUCCESS",
        createdAt: {
          gte: startOfLastMonth,
          lt: endOfLastMonth
        }
      },
      _sum: {
        harga: true,
        profit: true
      }
    });
    
    const lastMonthRevenue = lastMonthData._sum.harga || 0;
    const lastMonthProfit = lastMonthData._sum.profit || 0;
    const lastMonthProfitPercentage = lastMonthRevenue > 0 
      ? (lastMonthProfit / lastMonthRevenue) * 100 
      : 0;
    
    // Get payment method stats
    const paymentMethodStats = await ctx.prisma.pembayaran.groupBy({
      by: ['metode'],
      _count: {
        metode: true
      },
      where: {
        status: "SUCCESS"
      }
    });
    
    // Get transaction type stats
    const transactionTypeStats = await ctx.prisma.pembelian.groupBy({
      by: ['tipeTransaksi'],
      _count: {
        tipeTransaksi: true
      },
      where: {
        status: "SUCCESS"
      }
    });
    
    // Recent transactions
    const recentTransactions = await ctx.prisma.pembelian.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        pembayaran: true
      }
    });

    return {
      totalTransactions,
      statusCounts: {
        successful: successfulTransactions,
        pending: pendingTransactions,
        failed: failedTransactions
      },
      revenue: {
        today: todayRevenue,
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        // Format dalam Rupiah
        todayFormatted: formatToRupiah(todayRevenue),
        thisMonthFormatted: formatToRupiah(thisMonthRevenue),
        lastMonthFormatted: formatToRupiah(lastMonthRevenue)
      },
      profit: {
        today: todayProfit,
        thisMonth: thisMonthProfit,
        lastMonth: lastMonthProfit,
        // Format dalam Rupiah
        todayFormatted: formatToRupiah(todayProfit),
        thisMonthFormatted: formatToRupiah(thisMonthProfit),
        lastMonthFormatted: formatToRupiah(lastMonthProfit)
      },
      profitPercentage: {
        today: parseFloat(todayProfitPercentage.toFixed(2)),
        thisMonth: parseFloat(thisMonthProfitPercentage.toFixed(2)),
        lastMonth: parseFloat(lastMonthProfitPercentage.toFixed(2))
      },
      paymentMethodStats,
      transactionTypeStats,
      recentTransactions
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


