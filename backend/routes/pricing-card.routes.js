const express = require('express');
const {
    getCards,
    getCard,
    createCard,
    updateCard,
    deleteCard
} = require('../controllers/pricing-card.controller');

// Import your middlewares
const { protect } = require('../middlewares/auth.middleware');

// Note: You will need to add validatePricingCard to your validation.middleware.js file!
const { validate, validatePricingCard } = require('../middlewares/validation.middleware'); 

const router = express.Router();

router.route('/')
    // PUBLIC: Anyone can view the cards on the frontend
    .get(getCards)
    // PROTECTED: Only admins can create new cards
    .post(protect, validatePricingCard, validate, createCard);

router.route('/:id')
    // PUBLIC: Anyone can view a specific card
    .get(getCard)
    // PROTECTED: Only admins can update or delete cards
    .put(protect, validatePricingCard, validate, updateCard)
    .delete(protect, deleteCard);

module.exports = router;