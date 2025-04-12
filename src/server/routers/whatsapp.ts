import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import axios from "axios";
import { findUserByUsername } from "@/app/(auth)/auth/components/server";
import { ForgotPasswordMessagesWa, GenerateRandomNumber } from "@/data/template/forgot-password";
import jwt from "jsonwebtoken";
import { hashSync } from "bcryptjs";

export const WA_URL = "http://103.127.98.128:4000/api/sendText"
export const WhatsappMessage  = router({
    sendForgotMessages : publicProcedure
  .input(
    z.object({
      username: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      // Find user by username
      const user = await findUserByUsername(input.username);
      if (!user) {
        return {
          status: false,
          message: "User not found",
        };
      }

      const otp = GenerateRandomNumber();
      const verificationCode = otp.toString().padStart(6, "0");

      // Generate the message
      const messages = ForgotPasswordMessagesWa(verificationCode);

      // Update OTP in the database
      await ctx.prisma.users.update({
        where: {
          username: input.username,
        },
        data: {
          otp: verificationCode,
        },
      });
      // Send the message via WhatsApp
      const payload = {
        chatId: `${user.whatsapp}@c.us`,
        text: messages,
        session : "default"
      };

      await axios.post(WA_URL, payload);

      return {
        status: true,
        message: "OTP sent successfully",
      };
    } catch (error) {
      throw new Error(
        `Failed to send OTP: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }),
  verifyOtp : publicProcedure.input(
    z.object({
        otp : z.string(),
        username : z.string()
    })
  )  .mutation(async ({ ctx, input }) => {
    try {
      const user = await findUserByUsername(input.username);

      if (!user) {
        return {
          status: false,
          message: "User not found",
        };
      }

      // Verifikasi OTP
      if (user.otp !== input.otp) {
        return {
          status: false,
          message: "Verification Code Failed",
        };
      }

      // Buat token JWT
      const secretKey = "RjaXY87#+gXTBojDHVkZ"; 
      if (!secretKey) {
        throw new Error("JWT_SECRET is not defined");
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username }, 
        secretKey,
        { expiresIn: "1h" }
      );

      await ctx.prisma.users.update({
        where: {
          username: user.username,
        },
        data: {
          token: token, 
        },
      });
      return {
        status: true,
        message: "OTP verified successfully",
        passwordlink: `${process.env.NEXTAUTH_URL}/auth/resetpassword/token/${token}`,
      };
    } catch (error) {
      return {
        status: false,
        message: "An error occurred while verifying OTP",
      };
    }
  }),
  newPass: publicProcedure
  .input(
    z.object({
      token: z.string(),
      password: z.string(),
      retypePassword: z.string()
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      if (input.password !== input.retypePassword) {
        return {
          message: "Password tidak sama, silahkan coba lagi",
          status: false
        }
      }

      // Validasi panjang password
      if (input.password.length < 8) {
        return {
          message: "Password harus minimal 8 karakter",
          status: false
        }
      }

      // Cek validitas token
      const secretKey = "RjaXY87#+gXTBojDHVkZ"; 
      if (!secretKey) {
        throw new Error("JWT_SECRET is not defined");
      }

      let decoded;
      try {
        decoded = jwt.verify(input.token, secretKey);
      } catch (err) {
        return {
          message: "Token tidak valid atau sudah kadaluarsa",
          status: false
        }
      }

      // Ambil username atau userId dari token yang sudah didekode
      const { userId } = decoded as { userId: string; username: string };

      // Enkripsi password baru
      const hashedPassword = hashSync(input.password, 10);

      // Update password user
      const userUpdate = await ctx.prisma.users.update({
        where: {
          id: parseInt(userId),
        },
        data: {
          password: hashedPassword,
          token: null, 
        }
      });

      if (!userUpdate) {
        return {
          message: "User tidak ditemukan",
          status: false
        }
      }

      return {
        message: "Password berhasil diubah, silahkan login dengan password baru",
        status: true
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      return {
        message: "Terjadi kesalahan pada server, silahkan coba lagi nanti",
        status: false
      }
    }
  })
})