import { TRANSACTION_FLOW } from "@/types/transaction";
import { publicProcedure, router } from "../trpc";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { X } from "lucide-react";
import { TRPCError } from "@trpc/server";
import { startOfDay } from "date-fns";

export const adminStats = publicProcedure.query(async ({ ctx }) => {
  try {
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
        status:TRANSACTION_FLOW.FAILED
      }
    });
    
    // Get today's revenue
    const todayRevenue = await ctx.prisma.pembelian.aggregate({
      where: {
        status: TRANSACTION_FLOW.SUCCESS,
        createdAt: {
          gte: startOfToday
        }
      },
      _sum: {
        harga: true
      }
    });
    
    // Get today's profit
    const todayProfit = await ctx.prisma.pembelian.aggregate({
      where: {
        status: TRANSACTION_FLOW.SUCCESS,
        createdAt: {
          gte: startOfToday
        }
      },
      _sum: {
        profit: true
      }
    });
    
    // Get this month's revenue
    const thisMonthRevenue = await ctx.prisma.pembelian.aggregate({
      where: {
        status: TRANSACTION_FLOW.SUCCESS,
        createdAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        harga: true
      }
    });
    
    // Get this month's profit
    const thisMonthProfit = await ctx.prisma.pembelian.aggregate({
      where: {
        status: TRANSACTION_FLOW.SUCCESS,
        createdAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        profit: true
      }
    });
    
    // Get last month's revenue
    const lastMonthRevenue = await ctx.prisma.pembelian.aggregate({
      where: {
        status: TRANSACTION_FLOW.SUCCESS,
        createdAt: {
          gte: startOfLastMonth,
          lt: endOfLastMonth
        }
      },
      _sum: {
        harga: true
      }
    });
    
    // Get last month's profit
    const lastMonthProfit = await ctx.prisma.pembelian.aggregate({
      where: {
        status: TRANSACTION_FLOW.SUCCESS,
        createdAt: {
          gte: startOfLastMonth,
          lt: endOfLastMonth
        }
      },
      _sum: {
        profit: true
      }
    });
    
    // Get payment method stats
    const paymentMethodStats = await ctx.prisma.pembayaran.groupBy({
      by: ['metode'],
      _count: {
        metode: true
      },
      where: {
        status: TRANSACTION_FLOW.SUCCESS
      }
    });
    
    // Get transaction type stats
    const transactionTypeStats = await ctx.prisma.pembelian.groupBy({
      by: ['tipeTransaksi'],
      _count: {
        tipeTransaksi: true
      },
      where: {
        status: TRANSACTION_FLOW.SUCCESS
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
        today: todayRevenue._sum.harga || 0,
        thisMonth: thisMonthRevenue._sum.harga || 0,
        lastMonth: lastMonthRevenue._sum.harga || 0
      },
      profit: {
        today: todayProfit._sum.profit || 0,
        thisMonth: thisMonthProfit._sum.profit || 0,
        lastMonth: lastMonthProfit._sum.profit || 0
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
        orderId: merchantOrderId // Pastikan tipe data sesuai
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
      page: z.number().min(1).optional(),
      limit: z.number().min(1).optional(),
      searchTerm: z.string().optional(), 
    })
  )
  .query(async ({ ctx, input }) => {
    try {
      const { status, page = 1, limit = 10, searchTerm = '',endDate,startDate } = input || {};
      const where: Prisma.PembelianWhereInput = {};
      
      // Filter by status if provided
      if (status) {
        where.status = status;
      }
      
      // Add search filter if provided
      if (searchTerm) {
        where.OR = [
          { orderId: { contains: searchTerm } },
          { nickname: { contains: searchTerm } },
        ];
      }

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
      
      const skip = (page - 1) * limit;
      const take = limit;
      
      // Fetch paginated data and total count
      const [transactions, totalCount] = await Promise.all([
        ctx.prisma.pembelian.findMany({
          where,
          skip,
          take,
          include: {
            pembayaran: true
          },
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.pembelian.count({ where }),
      ]);
      
      return {
        transactions,
        totalCount,
      };
    } catch (error) {
      console.error("Error fetching pembelian data:", error);
      throw new Error("Failed to fetch pembelian data");
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
        const now = new Date(); // Current date and time
    
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
            const userKey = tx.username || tx.nickname || tx.nickname === "not-found" 
            
            if (!userKey) return;
            
            if (userTotals.has(userKey)) {
              const existingData = userTotals.get(userKey);
              userTotals.set(userKey, {
                username: tx.username || existingData.username,
                nickname: tx.nickname || existingData.nickname,
                harga: existingData.harga + tx.harga
              });
            } else {
              userTotals.set(userKey, {
                username: tx.username,
                nickname: tx.nickname,
                harga: tx.harga
              });
            }
          });
          
          // Convert map to array and sort by highest total price
          return Array.from(userTotals.values())
            .sort((a, b) => b.harga - a.harga)
            .slice(0, 10); // Take top 10
        };
        
        // Common filter for successful transactions
        const commonFilter = {
          NOT: {
            AND: [
              { username: null },
              { nickname: null }
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


