const express = require('express');
const { protect } = require('../../middleware/auth.middleware');
const prisma = require('../../config/prisma');

const router = express.Router();

router.get('/', protect, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', protect, async (req, res, next) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: Number(req.params.id) },
      data: { is_read: true }
    });
    res.json(notification);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
