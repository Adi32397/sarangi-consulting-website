require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing old data...');
  // Clear in dependency order
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.user.deleteMany();

  console.log('🌱 Seeding demo data...');

  const adminPass = await bcrypt.hash('admin123', 10);
  const userPass  = await bcrypt.hash('user123', 10);

  // ── Users ─────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: { name: 'RC Sarangi (Admin)', email: 'admin@sarangi.com', password: adminPass, role: 'admin', is_verified: true, updated_at: new Date() }
  });

  const client = await prisma.user.create({
    data: { name: 'Rahul Sharma', email: 'user@sarangi.com', password: userPass, role: 'user', is_verified: true, phone: '9876543210', updated_at: new Date() }
  });

  // ── Services ─────────────────────────────────────────
  await prisma.service.createMany({
    data: [
      { name: 'Startup Advisory Session', slug: 'startup-advisory', description: 'One-on-one advisory for early-stage startups.', price: 1999, discount_price: 999, status: 'active' },
      { name: 'Strategy & Growth Consulting', slug: 'strategy-growth', description: 'End-to-end business growth strategy.', price: 9999, status: 'active' },
      { name: 'Financial Advisory', slug: 'financial-advisory', description: 'Funding, cash-flow, and financial planning.', price: 4999, status: 'active' },
      { name: 'Digital Transformation', slug: 'digital-transformation', description: 'Modernise operations with technology.', price: 14999, status: 'active' },
    ]
  });

  // ── Banners (with QR code) ────────────────────────────
  await prisma.banner.createMany({
    data: [
      {
        title: 'Startup Advisory — 50% OFF',
        subtitle: 'Only 5 slots remaining this month. Scan the QR to register.',
        image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://sarangiconsulting.com/startup-advisory',
        button_text: 'Register Now',
        button_link: '/startup-advisory.html',
        status: 'active',
        start_date: new Date('2026-07-01'),
        end_date: new Date('2026-07-31'),
        
      },
      {
        title: 'Free Business Health Webinar',
        subtitle: 'Join RC Sarangi live on July 15. Scan to reserve your spot.',
        image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://sarangiconsulting.com/webinar-july-2026',
        button_text: 'Reserve Spot',
        button_link: '/contact.html',
        status: 'active',
        start_date: new Date('2026-07-01'),
        end_date: new Date('2026-07-15'),
      }
    ]
  });

  // ── Contacts ─────────────────────────────────────────
  const c1 = await prisma.contact.create({
    data: { name: 'Rahul Sharma', email: 'rahul@technova.in', phone: '9876543210', subject: 'Strategy Consulting Inquiry', message: 'Looking for end-to-end strategy consulting for our Series A startup in EdTech.', status: 'new' }
  });
  const c2 = await prisma.contact.create({
    data: { name: 'Priya Patel', email: 'priya@greenleaf.com', phone: '9812345678', subject: 'Financial Advisory', message: 'Need guidance on our cash-flow management and next round of funding.', status: 'in_progress' }
  });
  const c3 = await prisma.contact.create({
    data: { name: 'Amit Joshi', email: 'amit@manufab.co', phone: '9998887776', subject: 'Operations Consulting', message: 'Our production line efficiency has dropped 20% this quarter. Need expert help.', status: 'new' }
  });

  // ── Leads ─────────────────────────────────────────────
  await prisma.lead.createMany({
    data: [
      { contact_id: c1.id, source: 'Website', status: 'new', notes: 'Interested in full strategy package.' },
      { contact_id: c2.id, source: 'LinkedIn', status: 'in_progress', assigned_to: admin.id, notes: 'Spoke on call — send proposal by Friday.' },
      { contact_id: c3.id, source: 'WhatsApp', status: 'new' },
    ]
  });

  // ── Bookings ──────────────────────────────────────────
  await prisma.booking.createMany({
    data: [
      { user_id: client.id, name: 'Rahul Sharma', email: 'rahul@technova.in', phone: '9876543210', business_name: 'TechNova EdTech', booking_date: new Date('2026-10-24'), booking_time: '10:00 AM', status: 'confirmed' },
      { user_id: client.id, name: 'Priya Patel', email: 'priya@greenleaf.com', phone: '9812345678', business_name: 'GreenLeaf E-Commerce', booking_date: new Date('2026-10-25'), booking_time: '02:00 PM', status: 'pending' },
      { user_id: client.id, name: 'Amit Joshi', email: 'amit@manufab.co', phone: '9998887776', business_name: 'ManuFab Industries', booking_date: new Date('2026-10-28'), booking_time: '11:00 AM', status: 'confirmed' },
    ]
  });

  // ── Notifications ─────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { user_id: admin.id, title: 'New Lead: TechNova EdTech', message: 'A new lead from Rahul Sharma has been submitted via the website.', type: 'lead', is_read: false },
      { user_id: admin.id, title: 'Booking Confirmed', message: 'Booking for Rahul Sharma on Oct 24 at 10:00 AM has been confirmed.', type: 'booking', is_read: true },
      { user_id: client.id, title: 'Session Confirmed!', message: 'Your advisory session on Oct 24, 2026 at 10:00 AM is confirmed. Check your email for the meeting link.', type: 'booking', is_read: false },
    ]
  });

  console.log('\n✅ Demo data seeded successfully!');
  console.log('──────────────────────────────────────');
  console.log('Admin Login:  admin@sarangi.com / admin123');
  console.log('User Login:   user@sarangi.com  / user123');
  console.log('──────────────────────────────────────');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
