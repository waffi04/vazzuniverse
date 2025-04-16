import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { handleOrderStatusChange } from '@/lib/whatsapp-message';

export async function POST(req: NextRequest) {
  let logId: string = '';
  let referenceId: string = 'UNKNOWN';

  try {
    // Create initial log entry with comprehensive metadata
    const initialLog = await prisma.systemLog.create({
      data: {
        type: 'DIGIFLAZZ',
        action: 'DIGIFLAZZ_CALLBACK_RECEIVED',
        status: 'STARTED',
        metadata: JSON.stringify({
          timestamp: new Date(),
          method: 'POST',
          sourceIP: req.ip || 'Unknown',
          requestHeaders: Object.fromEntries(req.headers)
        })
      }
    });
    logId = initialLog.id;

    // Parse the callback data from Digiflazz
    const callbackData = await req.json();
    
    // Update log with raw callback data
    await prisma.systemLog.update({
      where: { id: logId },
      data: {
        details: JSON.stringify(callbackData),
        metadata: JSON.stringify({
          ...JSON.parse(initialLog.metadata || '{}'),
          rawCallbackReceived: true,
          rawCallbackData: callbackData
        })
      }
    });

    const {
      ref_id,
      buyer_sku_code,
      customer_no,
      status,
      message,
      sn,
    } = callbackData.data;

    referenceId = ref_id;

    if (!referenceId || !buyer_sku_code || !customer_no) {
      const validationErrorLog = await prisma.systemLog.create({
        data: {
          type: 'DIGIFLAZZ',
          parentLogId: logId,
          action: 'PARAMETER_VALIDATION_FAILED',
          status: 'FAILED',
          details: 'Missing required parameters',
          errorMessage: 'Terdapat parameter yang kosong',
          metadata: JSON.stringify({
            missingParameters: {
              referenceId: !referenceId,
              buyer_sku_code: !buyer_sku_code,
              customer_no: !customer_no
            }
          })
        }
      });

      return NextResponse.json({
        data: {
          status: "2",
          message: "Terdapat parameter yang kosong",
          rc: "07"
        }
      });
    }

    // Normalize status
    const normalizedStatus = status ? status.trim().toLowerCase() : '';
    const purchaseStatus = normalizedStatus === 'sukses' ? 'SUCCESS' : 'FAILED';

    // Use transaction to ensure data integrity
    return await prisma.$transaction(async (tx) => {
      // Comprehensive transaction logging
      await tx.systemLog.update({
        where: { id: logId },
        data: {
          ref: referenceId,
          action: 'TRANSACTION_STARTED',
          details: `Processing reference ID: ${referenceId}`,
          metadata: JSON.stringify({
            referenceId,
            buyer_sku_code,
            customer_no,
            normalizedStatus,
            purchaseStatus
          })
        }
      });

      // Find the pembelian record
      const pembelian = await tx.pembelian.findFirst({
        where: { refId: referenceId }
      });

      // Enhanced pembelian lookup logging
      await tx.systemLog.create({
        data: {
          type: 'DIGIFLAZZ',
          parentLogId: logId,
          action: 'PEMBELIAN_LOOKUP',
          status: pembelian ? 'FOUND' : 'NOT_FOUND',
          details: pembelian 
            ? `Pembelian found: ${pembelian.id}` 
            : `No pembelian found for ref_id: ${referenceId}`,
          metadata: JSON.stringify({
            referenceId,
            pembelianFound: !!pembelian
          })
        }
      });

      if (!pembelian) {
        await tx.systemLog.update({
          where: { id: logId },
          data: {
            status: 'FAILED',
            action: 'PEMBELIAN_NOT_FOUND',
            errorMessage: `No pembelian found for ref_id: ${referenceId}`
          }
        });

        throw new Error('Pembelian tidak ditemukan');
      }

      // Find associated pembayaran
      const pembayaran = await tx.pembayaran.findFirst({
        where: { orderId: pembelian?.orderId }
      });

      // Log pembayaran details
      await tx.systemLog.create({
        data: {
          type: 'DIGIFLAZZ',
          parentLogId: logId,
          action: 'PEMBAYARAN_LOOKUP',
          status: pembayaran ? 'FOUND' : 'NOT_FOUND',
          details: JSON.stringify({
            orderId: pembayaran?.orderId,
            metode: pembayaran?.metode
          }),
          metadata: JSON.stringify({
            orderId: pembayaran?.orderId,
            paymentMethodFound: !!pembayaran
          })
        }
      });

      // Prepare log message based on transaction status
      let logMessage = message || "";
      let refundProcessed = false;

      // For successful transactions, especially vouchers, include SN in the log
      if (purchaseStatus === 'SUCCESS' && sn) {
        logMessage = `Transaksi berhasil. SN/Kode Voucher: ${sn}`;
        
        // Log SN details
        await tx.systemLog.create({
          data: {
            type: 'DIGIFLAZZ',
            parentLogId: logId,
            action: 'SN_RECEIVED',
            status: 'SUCCESS',
            details: `Serial Number received for transaction: ${referenceId}`,
            metadata: JSON.stringify({
              serialNumber: sn,
              referenceId
            })
          }
        });
      } 
      // If transaction fails, check for username and attempt to refund
      else if (purchaseStatus === 'FAILED' && pembelian.username) {
        // Find user by username from pembelian record
        const user = await tx.users.findFirst({
          where: { 
            username: pembelian.username as string
          }
        });
      
        // Log user lookup
        await tx.systemLog.create({
          data: {
            type: 'DIGIFLAZZ',
            parentLogId: logId,
            action: 'USER_LOOKUP',
            status: user ? 'FOUND' : 'NOT_FOUND',
            details: user 
              ? `User found: ${user.id} (${user.username})` 
              : `No user found for username: ${pembelian.username}`,
            metadata: JSON.stringify({
              username: pembelian.username,
              userFound: !!user
            })
          }
        });
      
        if (user && pembayaran) {
          // Refund balance
          const balanceUpdate = await tx.users.update({
            where: { id: user.id },
            data: { 
              balance: { increment: parseInt(pembayaran.harga) } 
            }
          });

          // Update log message with refund information
          logMessage = `Transakasi gagal, saldo otomatis kembali menjadi Koin Akun `;
          refundProcessed = true;

          // Create detailed refund log
          const refundLog = await tx.systemLog.create({
            data: {
              type: 'BALANCE_TRANSACTION',
              parentLogId: logId,
              action: 'BALANCE_REFUND',
              status: 'SUCCESS',
              details: `Refunded ${pembayaran.harga} to user ${user.id} (${user.username})`,
              metadata: JSON.stringify({
                userId: user.id,
                username: user.username,
                orderId: pembelian.orderId,
                referenceId: referenceId,
                refundAmount: pembayaran.harga,
                paymentMethod: pembayaran.metode,
                originalPurchaseStatus: purchaseStatus
              })
            }
          });
        } else if (!user) {
          // Log user not found
          const userNotFoundLog = await tx.systemLog.create({
            data: {
              type: 'DIGIFLAZZ',
              parentLogId: logId,
              action: 'BALANCE_REFUND_FAILED',
              status: 'ERROR',
              errorMessage: 'User not found',
              details: `No user found with username from pembelian: ${pembelian.username}, reference ID: ${referenceId}`,
              metadata: JSON.stringify({
                username: pembelian.username,
                referenceId
              })
            }
          });
          
          // Add error information to log message
          logMessage = `Transaksi gagal. Refund gagal: User ${pembelian.username} tidak ditemukan.`;
        } else if (!pembayaran) {
          // Log payment not found
          const paymentNotFoundLog = await tx.systemLog.create({
            data: {
              type: 'DIGIFLAZZ',
              parentLogId: logId,
              action: 'BALANCE_REFUND_FAILED',
              status: 'ERROR',
              errorMessage: 'Payment not found',
              details: `No payment found for orderId: ${pembelian.orderId}, reference ID: ${referenceId}`,
              metadata: JSON.stringify({
                orderId: pembelian.orderId,
                referenceId
              })
            }
          });
          
          // Add error information to log message
          logMessage = `${message || "Transaksi gagal"}. Refund gagal: Pembayaran untuk order ${pembelian.orderId} tidak ditemukan.`;
        }
      }
      
      const updatedPembelian = await tx.pembelian.update({
        where: { id: pembelian.id },
        data: {
          status: purchaseStatus,
          sn: sn || null,
          log: logMessage,
          updatedAt: new Date(),
        }
      });

      // Log pembelian update
      await tx.systemLog.create({
        data: {
          type: 'DIGIFLAZZ',
          parentLogId: logId,
          action: 'PEMBELIAN_UPDATE',
          status: 'SUCCESS',
          details: `Updated pembelian ${updatedPembelian.id} with status ${purchaseStatus}`,
          metadata: JSON.stringify({
            pembelianId: updatedPembelian.id,
            newStatus: purchaseStatus,
            serialNumber: sn,
            logMessage,
            refundProcessed
          })
        }
      });

      // Trigger order status change notification
      await handleOrderStatusChange({
        orderData : {
          amount : pembelian.harga,
          link : `${process.env.NEXTAUTH_URL}/invoice?invoice=${pembelian.orderId}`,
          method : pembayaran?.metode,
          productName : pembelian.layanan,
          status : purchaseStatus,
          customerName : pembelian.username as string,
          orderId : pembelian.orderId,
          whatsapp : pembayaran?.noPembeli,
          sn,
        }
      });

      // Handle success report
      if (purchaseStatus === 'SUCCESS' && !pembelian.successReportSended) {
        const successReportUpdate = await tx.pembelian.update({
          where: { id: pembelian.id },
          data: { successReportSended: true }
        });

        // Log success report
        await tx.systemLog.create({
          data: {
            type: 'DIGIFLAZZ',
            parentLogId: logId,
            action: 'SUCCESS_REPORT',
            status: 'SENT',
            details: `Success report sent for pembelian ${pembelian.id}`,
            metadata: JSON.stringify({
              pembelianId: pembelian.id,
              successReportSent: true
            })
          }
        });
      }

      // Update main log as completed
      await tx.systemLog.update({
        where: { id: logId },
        data: {
          status: 'SUCCESS',
          action: 'DIGIFLAZZ_CALLBACK_PROCESSED',
          details: 'Callback processed successfully',
          metadata: JSON.stringify({
            finalStatus: 'SUCCESS',
            referenceId,
            purchaseStatus,
            refundProcessed,
            snProvided: !!sn
          })
        }
      });

      return NextResponse.json({
        data: {
          status: "0",
          message: "Callback processed successfully",
          rc: "00"
        }
      });
    }, {
      maxWait: 15000,  
      timeout: 30000,
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });

  } catch (error) {
    // Comprehensive error logging
    const errorLog = await prisma.systemLog.create({
      data: {
        type: 'DIGIFLAZZ',
        parentLogId: logId || undefined,
        action: 'CALLBACK_PROCESSING_ERROR',
        status: 'ERROR',
        errorMessage: error instanceof Error ? error.message : 'Unknown system error',
        details: JSON.stringify({
          errorName: error instanceof Error ? error.name : 'UnknownError',
          errorStack: error instanceof Error ? error.stack : 'No stack trace',
          referenceId: referenceId || 'Not available'
        })
      }
    });

    console.error('DigiFlazz callback error:', error);
  
    return NextResponse.json({
      data: {
        status: "2",
        message: error instanceof Error ? error.message : "System error",
        rc: "99"
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}