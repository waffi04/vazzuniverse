export type User = {
  id: number; // Keep as number to match Prisma Int
  name: string | null;
  username: string;
  role: string;
  whatsapp: string | null;
  balance: string;
  apiKey: string | null;
  otp: string | null;
  createdAt: Date | null
  updatedAt: Date | null
};


export type Member = {
    name: string;
    id: number;
    createdAt: string | null;
    updatedAt: string | null;
    username: string;
    whatsapp: string | null;
    password: string;
    balance: number;
    role: string;
    otp: string | null;
    apiKey: string | null;
    lastPaymentAt: string | null;
}