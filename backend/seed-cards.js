require('dotenv').config();
const { getSequelize, connectDB } = require('./config/database');
const { PricingCard, initPricingCard } = require('./models/PricingCard');

const seedCards = async () => {
    await connectDB();
    
    initPricingCard();

    const PricingCardModel = PricingCard();
    const sequelize = getSequelize();
    await sequelize.sync();

    const initialCards = [
        {
            title: 'One-on-One Advisory',
            description: '60-minute Google Meet session with Industry Expert Business Consultant to solve growth challenges and build a roadmap.',
            price_strike: '₹1,999',
            price_active: '₹999',
            urgency_text: '50% Off - Only 5 Slots Left!',
            is_highlighted: true,
            order_index: 1,
            features: ['Business & Strategy Review', 'Market Positioning Advice', 'Custom Growth Roadmap', 'Founder Q&A']
        },
        {
            title: 'IP Registration',
            description: 'Safeguard and protect your intellectual property with comprehensive registration of trademarks, copyrights and patents.',
            price_strike: '₹19,999',
            price_active: 'Starts from ₹9,999',
            urgency_text: null,
            is_highlighted: false,
            order_index: 2,
            features: ['Strategic IP Planning', 'Trademark Search & Registration', 'Copyright Registration Filing', 'Patent Draft & Filing Support', 'Govt. Documentation handling']
        },
        {
            title: 'Firm Registration',
            description: 'End-to-end incorporation services for Private Limited, LLP, and Partnership entities with scalable legal and regulatory compliance.',
            price_strike: '₹49,999',
            price_active: 'Starts from ₹29,999',
            urgency_text: null,
            is_highlighted: false,
            order_index: 3,
            features: ['Entity Structuring Advisory', 'Pvt Ltd, LLP & Firm Registration', 'MOA, AOA & Deed Drafting', 'Core Compliance (GST, PAN, TAN)']
        },
        {
            title: 'Licenses & Certifications',
            description: 'Essential operational licenses and compliance certifications to ensure your business is legally cleared to scale.',
            price_strike: '₹5,999',
            price_active: 'Starts from ₹2,999',
            urgency_text: 'Register now to get the best price',
            is_highlighted: false,
            order_index: 4,
            features: ['Startup India (DPIIT) Recognition', 'MSME (Udyam) Registration', 'FSSAI, ISO & Trade Licenses', 'Industry-Specific Compliance']
        }
    ];

    for (let c of initialCards) {
        const existing = await PricingCardModel.findOne({ where: { title: c.title } });
        if (!existing) {
            await PricingCardModel.create(c);
            console.log(`Created card: ${c.title}`);
        } else {
            console.log(`Card already exists: ${c.title}`);
        }
    }
    process.exit(0);
};

seedCards().catch(err => {
    console.error(err);
    process.exit(1);
});