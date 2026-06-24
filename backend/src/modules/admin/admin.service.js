const prisma = require('../../config/prisma');

const getDashboardStats = async () => {
  const [totalLeads, totalContacts, totalBookings, revenue] = await Promise.all([
    prisma.lead.count(),
    prisma.contact.count(),
    prisma.booking.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'completed' }
    })
  ]);

  return {
    totalLeads,
    totalContacts,
    totalBookings,
    revenue: revenue._sum.amount || 0,
    // assessments: ...
    // payments: ...
  };
};

module.exports = {
  getDashboardStats
};
