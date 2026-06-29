const { Lead, Booking } = require('../models');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { logActivity } = require('../utils/logger');
const { Op } = require('sequelize');

const getModelData = async (moduleName, ids) => {
    let Model;
    if (moduleName === 'leads') Model = Lead();
    else if (moduleName === 'bookings') Model = Booking();
    else throw new Error('Invalid module');

    let whereClause = {};
    if (ids && ids.length > 0) {
        whereClause = { id: { [Op.in]: ids } };
    }
    
    // For leads, we might want to include Consultant
    const data = await Model.findAll({ where: whereClause, raw: true });
    return data;
};

exports.exportCSV = async (req, res, next) => {
    try {
        const { module: moduleName } = req.params;
        const data = await getModelData(moduleName, req.body.ids);

        if (!data || data.length === 0) {
            return res.status(404).json({ success: false, message: 'No data to export' });
        }

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(data);

        await logActivity(req, moduleName, `Exported ${data.length} records to CSV`);

        res.header('Content-Type', 'text/csv');
        res.attachment(`${moduleName}_export_${Date.now()}.csv`);
        return res.send(csv);
    } catch (error) {
        next(error);
    }
};

exports.exportExcel = async (req, res, next) => {
    try {
        const { module: moduleName } = req.params;
        const data = await getModelData(moduleName, req.body.ids);

        if (!data || data.length === 0) {
            return res.status(404).json({ success: false, message: 'No data to export' });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(moduleName.toUpperCase());

        // Create headers based on keys of first object
        const columns = Object.keys(data[0]).map(key => ({ header: key, key: key }));
        worksheet.columns = columns;

        data.forEach(item => {
            worksheet.addRow(item);
        });

        await logActivity(req, moduleName, `Exported ${data.length} records to Excel`);

        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment(`${moduleName}_export_${Date.now()}.xlsx`);
        
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};

exports.exportPDF = async (req, res, next) => {
    try {
        const { module: moduleName } = req.params;
        const data = await getModelData(moduleName, req.body.ids);

        if (!data || data.length === 0) {
            return res.status(404).json({ success: false, message: 'No data to export' });
        }

        await logActivity(req, moduleName, `Exported ${data.length} records to PDF`);

        const doc = new PDFDocument();
        res.header('Content-Type', 'application/pdf');
        res.attachment(`${moduleName}_export_${Date.now()}.pdf`);
        
        doc.pipe(res);

        doc.fontSize(20).text(`${moduleName.toUpperCase()} EXPORT`, { align: 'center' });
        doc.moveDown();

        data.forEach((item, index) => {
            doc.fontSize(12).text(`Record #${index + 1}`);
            Object.keys(item).forEach(key => {
                // Ignore long JSON strings or massive texts for simple PDF
                if (typeof item[key] !== 'object' && String(item[key]).length < 100) {
                    doc.fontSize(10).text(`${key}: ${item[key]}`);
                }
            });
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        next(error);
    }
};
