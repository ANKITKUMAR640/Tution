import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

try {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');
  if (!email || !/^\S+@\S+\.\S+$/.test(email) || password.length < 12 || password === 'SET_A_STRONG_PASSWORD_BEFORE_RUNNING_SEED') {
    throw new Error('Set a valid ADMIN_EMAIL and a unique ADMIN_PASSWORD (at least 12 characters) in backend/.env before seeding.');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash, name: process.env.ADMIN_NAME || 'BECC Administrator', role: 'ADMIN', active: true },
    update: { passwordHash, name: process.env.ADMIN_NAME || 'BECC Administrator', role: 'ADMIN', active: true }
  });
  const settings = [{
    name: process.env.INSTITUTE_NAME || 'BHARTI EXCELLENT COACHING CENTER',
    shortName: 'BECC',
    address: process.env.INSTITUTE_ADDRESS || 'Baji Chowk, Sakra, Muzaffarpur, Bihar',
    phone: process.env.INSTITUTE_PHONE || '7033737767',
    email: process.env.INSTITUTE_EMAIL || 'mkankit9525@gmail.com',
    established: process.env.INSTITUTE_ESTABLISHED || '2022',
    timings: process.env.INSTITUTE_TIMINGS || '6:00 AM – 11:00 AM'
  }];
  await prisma.contentBucket.upsert({
    where: { key: 'settings' },
    create: { key: 'settings', data: settings },
    update: {}
  });
  console.log(`BECC administrator account is ready: ${admin.email}`);
  console.log('Institute settings are ready. Existing saved settings were preserved.');
} finally {
  await prisma.$disconnect();
}
