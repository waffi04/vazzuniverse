'use server';
import authConfig from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { RegisterAuth, UpdateUser } from '@/types/schema/auth';
import { User } from '@/types/schema/user';
import { hashSync } from 'bcryptjs';
import { randomBytes, randomInt } from 'crypto';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

export type CreateUserResult = {
  success: boolean;
  message: string;
  user?: Partial<User>;
};
function generateApiKey() {
  return randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
}
export default async function CreateUser({
  credentials,
}: {
  credentials: RegisterAuth;
}): Promise<CreateUserResult> {
  try {
    // Validate input using Zod schema
    const validatedData = {
      ...credentials,
      whatsapp: credentials.whatsapp?.toString(),
    };

    // Check if user already exists
    const existingUser = await findUserByUsername(validatedData.username);
    if (existingUser) {
      return {
        success: false,
        message: 'Username sudah terpakai',
      };
    }

    // Hash password
    const hashedPassword = hashSync(validatedData.password, 10);

    // Create user
    const user = await prisma.users.create({
      data: {
        ...validatedData,
        password: hashedPassword,
        role: 'Member',
            balance: 0,
            apiKey: generateApiKey(),
          },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
      },
    });

    return {
      success: true,
      message: 'register created succesfully',
      user,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors.map((err) => err.message).join(', '),
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message || 'Failed to create user',
      };
    }

    return {
      success: false,
      message: 'An unexpected error occurred',
    };
  }
}

export async function findUserByUsername(username: string) {
  return await prisma.users.findFirst({
    where: { username },
    select: {
      username: true,
      name: true,
      id: true,
      createdAt: true,
      role: true,
      otp : true,
      apiKey: true,
      token : true,
      updatedAt: true,
      whatsapp: true,
    },
  });
}

export async function findUserById(id: number
) {
  const user = await prisma.users.findUnique({
    where: { id },
    select: {
      username: true,
      name: true,
      balance: true,
      id: true,
      createdAt: true,
      role: true,
      otp : true,
      token : true,
      apiKey: true,
      updatedAt: true,
      whatsapp: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    ...user,
    balance: user?.balance.toString(),
  };
}
export async function UpdateUsers({
  credentials,
}: {
  credentials: UpdateUser;
}): Promise<CreateUserResult> {
  try {
    const user = await getProfile();

    if (!user) {
      return {
        message: 'Unauthorized: User Tidak Ditemukan',
        success: false,
      };
    }

    const data = await prisma.users.update({
      where: {
        username: user.session.username,
      },
      data: {
        name: credentials.name,
        whatsapp: credentials.whatsapp.toString(),
      },
    });

    return {
      message: 'Profile updated successfully',
      success: true,
      user: { ...data, balance: data.balance.toString() },
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      message:
        error instanceof Error ? error.message : 'Failed to update profile',
      success: false,
    };
  }
}


export async  function getProfile() {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    return null
  }
  return {
    session : session?.user
  }
}
