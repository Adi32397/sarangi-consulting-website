const { Lead, User } = require('../models');
const { Op } = require('sequelize');
const { getSequelize } = require('../config/database');
const { logActivity } = require('../utils/logger');

// @desc    Create new lead
// @route   POST /api/leads
exports.createLead = async (req, res, next) => {
    try {
        const LeadModel = Lead();
        const lead = await LeadModel.create(req.body);
        await logActivity(req, 'Leads', `Created lead for ${lead.customerName}`, { title: 'New Lead', type: 'success' });
        res.status(201).json({ success: true, data: lead });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all leads with search, pagination, sort, filter
// @route   GET /api/leads
exports.getLeads = async (req, res, next) => {
    try {
        const LeadModel = Lead();
        const UserModel = User();
        
        const reqQuery = { ...req.query };
        const removeFields = ['select', 'sort', 'page', 'limit', 'search', 'startDate', 'endDate'];
        removeFields.forEach(param => delete reqQuery[param]);

        let whereClause = { ...reqQuery };

        // Convert query operators ($gt, $gte, etc) to Sequelize Op
        for (let key in whereClause) {
            if (typeof whereClause[key] === 'object') {
                const ops = {};
                for (let op in whereClause[key]) {
                    if (op === '$gt') ops[Op.gt] = whereClause[key][op];
                    if (op === '$gte') ops[Op.gte] = whereClause[key][op];
                    if (op === '$lt') ops[Op.lt] = whereClause[key][op];
                    if (op === '$lte') ops[Op.lte] = whereClause[key][op];
                    if (op === '$in') ops[Op.in] = whereClause[key][op];
                }
                whereClause[key] = ops;
            }
        }

        if (req.query.search) {
            whereClause[Op.or] = [
                { customerName: { [Op.like]: `%${req.query.search}%` } },
                { company: { [Op.like]: `%${req.query.search}%` } },
                { email: { [Op.like]: `%${req.query.search}%` } }
            ];
        }

        if (req.query.startDate && req.query.endDate) {
            whereClause.createdAt = {
                [Op.gte]: new Date(req.query.startDate),
                [Op.lte]: new Date(req.query.endDate)
            };
        }

        let order = [['createdAt', 'DESC']];
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',');
            order = sortBy.map(s => {
                if (s.startsWith('-')) return [s.substring(1), 'DESC'];
                return [s, 'ASC'];
            });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await LeadModel.findAndCountAll({
            where: whereClause,
            order,
            limit,
            offset
        });

        res.status(200).json({
            success: true,
            count: rows.length,
            total: count,
            page,
            pages: Math.ceil(count / limit),
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
exports.getLead = async (req, res, next) => {
    try {
        const LeadModel = Lead();
        const lead = await LeadModel.findOne({
            where: { id: req.params.id }
        });

        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        next(error);
    }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
exports.updateLead = async (req, res, next) => {
    try {
        const LeadModel = Lead();
        let lead = await LeadModel.findByPk(req.params.id);

        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

        lead = await lead.update(req.body);
        await logActivity(req, 'Leads', `Updated lead ${lead.leadId}`);
        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
exports.deleteLead = async (req, res, next) => {
    try {
        const LeadModel = Lead();
        const lead = await LeadModel.findByPk(req.params.id);
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

        await lead.destroy();
        await logActivity(req, 'Leads', `Deleted lead ${lead.leadId}`, { title: 'Lead Deleted', type: 'warning' });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

// @desc    Update lead status
// @route   PATCH /api/leads/:id/status
exports.updateStatus = async (req, res, next) => {
    try {
        const LeadModel = Lead();
        const lead = await LeadModel.findByPk(req.params.id);
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
        
        await lead.update({ status: req.body.status });
        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        next(error);
    }
};

// @desc    Update lead priority
// @route   PATCH /api/leads/:id/priority
exports.updatePriority = async (req, res, next) => {
    try {
        const LeadModel = Lead();
        const lead = await LeadModel.findByPk(req.params.id);
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
        
        await lead.update({ priority: req.body.priority });
        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        next(error);
    }
};

// @desc    Assign consultant
// @route   PATCH /api/leads/:id/assign
exports.assignConsultant = async (req, res, next) => {
    try {
        const LeadModel = Lead();
        const lead = await LeadModel.findByPk(req.params.id);
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
        
        const UserModel = User();
        const consultant = await UserModel.findByPk(req.body.consultantId);
        const consultantName = consultant ? consultant.name : null;

        await lead.update({ 
            assignedConsultant: consultantName
        });
        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        next(error);
    }
};

// @desc    Add note
// @route   POST /api/leads/:id/note
exports.addNote = async (req, res, next) => {
    try {
        const LeadModel = Lead();
        const lead = await LeadModel.findByPk(req.params.id);
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

        const notes = [...(lead.internalNotes || [])];
        notes.push({
            content: req.body.content,
            addedBy: req.user.id
        });
        
        await lead.update({ internalNotes: notes });
        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        next(error);
    }
};

// @desc    Add followup (communication)
// @route   POST /api/leads/:id/followup
exports.addFollowup = async (req, res, next) => {
    try {
        const LeadModel = Lead();
        const lead = await LeadModel.findByPk(req.params.id);
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

        const comms = [...(lead.communicationHistory || [])];
        comms.push({
            type: req.body.type,
            notes: req.body.notes, // changed summary to notes
            date: req.body.date || new Date(),
            addedBy: req.user.id
        });

        await lead.update({ communicationHistory: comms });
        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        next(error);
    }
};

// ==================== BULK OPERATIONS ====================

exports.bulkDelete = async (req, res, next) => {
    const sequelize = getSequelize();
    const t = await sequelize.transaction();
    try {
        const LeadModel = Lead();
        await LeadModel.destroy({ 
            where: { id: { [Op.in]: req.body.ids } },
            transaction: t
        });
        await logActivity(req, 'Leads', `Bulk deleted ${req.body.ids.length} leads`);
        await t.commit();
        res.status(200).json({ success: true, message: 'Leads deleted successfully' });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

exports.bulkAssign = async (req, res, next) => {
    const sequelize = getSequelize();
    const t = await sequelize.transaction();
    try {
        const UserModel = User();
        const consultant = await UserModel.findOne({ 
            where: { name: { [Op.like]: `%${req.body.consultantName}%` } } 
        });

        if (!consultant) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Consultant not found with that name' });
        }

        const LeadModel = Lead();
        await LeadModel.update(
            { 
                assignedConsultant: consultant.name
            },
            { 
                where: { id: { [Op.in]: req.body.ids } },
                transaction: t
            }
        );
        await logActivity(req, 'Leads', `Bulk assigned ${req.body.ids.length} leads`);
        await t.commit();
        res.status(200).json({ success: true, message: 'Leads assigned successfully' });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

exports.bulkStatus = async (req, res, next) => {
    const sequelize = getSequelize();
    const t = await sequelize.transaction();
    try {
        const LeadModel = Lead();
        await LeadModel.update(
            { status: req.body.status },
            { 
                where: { id: { [Op.in]: req.body.ids } },
                transaction: t
            }
        );
        await logActivity(req, 'Leads', `Bulk updated status of ${req.body.ids.length} leads`);
        await t.commit();
        res.status(200).json({ success: true, message: 'Lead statuses updated successfully' });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

exports.exportLeads = async (req, res, next) => {
    try {
        const LeadModel = Lead();
        let whereClause = {};
        if (req.body.ids && req.body.ids.length > 0) {
            whereClause = { id: { [Op.in]: req.body.ids } };
        }
        
        const leads = await LeadModel.findAll({ where: whereClause });
        await logActivity(req, 'Leads', `Exported ${leads.length} leads`);
        res.status(200).json({ success: true, data: leads });
    } catch (error) {
        next(error);
    }
};

// ==================== DASHBOARD & ANALYTICS ====================

exports.getDashboardStats = async (req, res, next) => {
    try {
        const LeadModel = Lead();
        const totalLeads = await LeadModel.count();
        
        const newLeads = await LeadModel.count({ where: { status: 'New' } });
        const contactedLeads = await LeadModel.count({ where: { status: 'Contacted' } });
        const qualifiedLeads = await LeadModel.count({ where: { status: 'Qualified' } });
        const wonLeads = await LeadModel.count({ where: { status: 'Won' } });
        const lostLeads = await LeadModel.count({ where: { status: 'Lost' } });

        res.status(200).json({
            success: true,
            data: {
                totalLeads,
                newLeads,
                contactedLeads,
                qualifiedLeads,
                wonLeads,
                lostLeads
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getAnalytics = async (req, res, next) => {
    try {
        const sequelize = getSequelize();
        const LeadModel = Lead();

        // Group by Source
        const bySource = await LeadModel.findAll({
            attributes: ['leadSource', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['leadSource']
        }).then(res => res.map(r => ({ _id: r.leadSource, count: r.get('count') })));

        // Group by Status
        const byStatus = await LeadModel.findAll({
            attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['status']
        }).then(res => res.map(r => ({ _id: r.status, count: r.get('count') })));

        // Monthly Leads (MySQL-specific group by)
        const monthlyLeads = await LeadModel.findAll({
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
                [sequelize.fn('YEAR', sequelize.col('createdAt')), 'year'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['year', 'month'],
            order: [['year', 'ASC'], ['month', 'ASC']]
        }).then(res => res.map(r => ({
            _id: { month: r.get('month'), year: r.get('year') },
            count: r.get('count')
        })));

        // Conversion Rate
        const wonCount = await LeadModel.count({ where: { status: 'Won' } });
        const lostCount = await LeadModel.count({ where: { status: 'Lost' } });
        let conversionRate = 0;
        if (wonCount + lostCount > 0) {
            conversionRate = (wonCount / (wonCount + lostCount)) * 100;
        }

        // Group by Service
        const byService = await LeadModel.findAll({
            attributes: ['serviceInterested', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['serviceInterested'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            limit: 5
        }).then(res => res.map(r => ({ _id: r.serviceInterested, count: r.get('count') })));

        res.status(200).json({
            success: true,
            data: {
                bySource,
                byStatus,
                byService,
                monthlyLeads,
                conversionRate: conversionRate.toFixed(2)
            }
        });
    } catch (error) {
        next(error);
    }
};
