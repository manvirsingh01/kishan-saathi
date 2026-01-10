const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const { authMiddleware } = require('../middleware/auth');
const LossReport = require('../models/LossReport');
const ClimateData = require('../models/ClimateData');
const { generateLossReportPDF } = require('../services/pdfGenerator');

// @route   POST /api/reports/loss
// @desc    Create a new climate loss report
// @access  Private
router.post('/loss', authMiddleware, async (req, res) => {
    try {
        const {
            period,
            climateImpact,
            yieldLoss,
            financialLoss,
            insuranceInfo,
            governmentCompensation
        } = req.body;

        // Create loss report
        const lossReport = new LossReport({
            userId: req.user._id,
            period,
            climateImpact,
            yieldLoss,
            financialLoss,
            insuranceInfo: insuranceInfo || { hasInsurance: false },
            governmentCompensation: governmentCompensation || { eligible: false }
        });

        await lossReport.save();

        res.status(201).json({
            message: 'Loss report created successfully',
            report: lossReport
        });
    } catch (error) {
        console.error('Loss report creation error:', error);
        res.status(500).json({ error: 'Failed to create loss report' });
    }
});

// @route   GET /api/reports/loss
// @desc    Get all loss reports for farmer
// @access  Private
router.get('/loss', authMiddleware, async (req, res) => {
    try {
        const reports = await LossReport.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .select('-__v');

        res.json({ reports });
    } catch (error) {
        console.error('Loss reports fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch loss reports' });
    }
});

// @route   GET /api/reports/loss/:id
// @desc    Get specific loss report
// @access  Private
router.get('/loss/:id', authMiddleware, async (req, res) => {
    try {
        const report = await LossReport.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json({ report });
    } catch (error) {
        console.error('Loss report fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// @route   PUT /api/reports/loss/:id
// @desc    Update loss report
// @access  Private
router.put('/loss/:id', authMiddleware, async (req, res) => {
    try {
        const report = await LossReport.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json({
            message: 'Report updated successfully',
            report
        });
    } catch (error) {
        console.error('Loss report update error:', error);
        res.status(500).json({ error: 'Failed to update report' });
    }
});

// @route   GET /api/reports/pdf/:id
// @desc    Generate and download PDF report
// @access  Private
router.get('/pdf/:id', authMiddleware, async (req, res) => {
    try {
        const report = await LossReport.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const user = req.user;

        // Create reports directory if it doesn't exist
        const reportsDir = path.join(__dirname, '..', 'reports');
        try {
            await fs.mkdir(reportsDir, { recursive: true });
        } catch (err) {
            // Directory might already exist
        }

        // Generate PDF
        const pdfPath = path.join(reportsDir, `${report.reportId}.pdf`);
        await generateLossReportPDF(report, user, pdfPath);

        // Update report with PDF path
        report.pdfGenerated = true;
        report.pdfPath = pdfPath;
        await report.save();

        // Send PDF file
        res.download(pdfPath, `Climate_Loss_Report_${report.reportId}.pdf`, (err) => {
            if (err) {
                console.error('PDF download error:', err);
                res.status(500).json({ error: 'Failed to download PDF' });
            }
        });
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({
            error: 'Failed to generate PDF',
            message: error.message
        });
    }
});

module.exports = router;
