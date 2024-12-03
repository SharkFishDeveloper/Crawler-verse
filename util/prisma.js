import { PrismaClient } from '@prisma/client';

class PrismaSingleton {
   static prisma;

  // Private constructor to prevent instantiation
   constructor() {}

  // Method to get the single instance of PrismaClient
   static getInstance() {
    if (!PrismaSingleton.prisma) {
      PrismaSingleton.prisma = new PrismaClient();
    }
    return PrismaSingleton.prisma;
  }
}

// Usage
const prisma = PrismaSingleton.getInstance();
export default prisma;