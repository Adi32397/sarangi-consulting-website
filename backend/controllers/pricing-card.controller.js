const { PricingCard } = require('../models');
const { logActivity } = require('../utils/logger'); // Pulling from your established utils

// @desc    Create new pricing card
// @route   POST /api/pricing-cards
exports.createCard = async (req, res, next) => {
    try {
        const PricingCardModel = PricingCard();

        req.body.button_text = req.body.button_text || 'Schedule a Discovery Call';

        const card = await PricingCardModel.create(req.body);
        
        // Log the creation
        if (typeof logActivity === 'function') {
            await logActivity(req, 'PricingCards', `Created pricing card: ${card.title}`, { title: 'New Pricing Card', type: 'success' });
        }
        
        res.status(201).json({ success: true, data: card });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all pricing cards
// @route   GET /api/pricing-cards
exports.getCards = async (req, res, next) => {
    try {
        const PricingCardModel = PricingCard();
        
        // We don't need heavy search/pagination for just 4 cards, 
        // but we absolutely need them sorted by order_index
        const cards = await PricingCardModel.findAll({
            order: [['order_index', 'ASC']]
        });
        
        res.status(200).json({ 
            success: true, 
            count: cards.length,
            data: cards 
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single pricing card
// @route   GET /api/pricing-cards/:id
exports.getCard = async (req, res, next) => {
    try {
        const PricingCardModel = PricingCard();
        const card = await PricingCardModel.findByPk(req.params.id);

        if (!card) return res.status(404).json({ success: false, message: 'Pricing card not found' });
        
        res.status(200).json({ success: true, data: card });
    } catch (error) {
        next(error);
    }
};

// @desc    Update pricing card
// @route   PUT /api/pricing-cards/:id
exports.updateCard = async (req, res, next) => {
    try {
        const PricingCardModel = PricingCard();
        let card = await PricingCardModel.findByPk(req.params.id);

        if (!card) return res.status(404).json({ success: false, message: 'Pricing card not found' });

        const updateData = { ...req.body };

        updateData.button_text = updateData.button_text || 'Schedule a Discovery Call';
        
        if (updateData.features && !Array.isArray(updateData.features)) {
             // If it somehow comes as a string, parse it
             updateData.features = JSON.parse(updateData.features);
        }

        card = await card.update(updateData);
        
        if (typeof logActivity === 'function') {
            await logActivity(req, 'PricingCards', `Updated pricing card: ${card.title}`);
        }
        
        res.status(200).json({ success: true, data: card });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete pricing card
// @route   DELETE /api/pricing-cards/:id
exports.deleteCard = async (req, res, next) => {
    try {
        const PricingCardModel = PricingCard();
        const card = await PricingCardModel.findByPk(req.params.id);
        
        if (!card) return res.status(404).json({ success: false, message: 'Pricing card not found' });

        const title = card.title; // Save title for the log before destroying
        await card.destroy();
        
        if (typeof logActivity === 'function') {
            await logActivity(req, 'PricingCards', `Deleted pricing card: ${title}`, { title: 'Pricing Card Deleted', type: 'warning' });
        }
        
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};