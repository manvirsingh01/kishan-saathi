const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse-fork');
const { authMiddleware } = require('../middleware/auth');
const SoilReport = require('../models/SoilReport');
const { analyzeSoilReport } = require('../services/soilAnalysis');

// Configure multer for PDF upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/soil-reports');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `soil-report-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// @route   POST /api/soil-reports/upload
// @desc    Upload soil report PDF and get AI recommendations
// @access  Private
router.post('/upload', authMiddleware, upload.single('soilReport'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const user = req.user;
        const { lat, lng, notes } = req.body;

        // Use provided location or user's farm location
        const location = lat && lng
            ? { coordinates: [parseFloat(lng), parseFloat(lat)], state: user.farmDetails.location.state, district: 'Current Location' }
            : user.farmDetails.location;

        // Read PDF file - pdf-parse-fork is a function
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        const pdfText = pdfData.text;

        // Analyze with Saathi
        console.log('Analyzing soil report with Saathi...');
        const aiAnalysis = await analyzeSoilReport(pdfText, location, user.farmDetails);

        // Generate unique report ID
        const reportId = `SR-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        // Create soil report record
        const soilReport = await SoilReport.create({
            reportId,
            userId: user.id,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            location,
            soilData: aiAnalysis.soilAnalysis || {},
            aiAnalysis,
            cropRecommendations: aiAnalysis.cropRecommendations || [],
            status: 'analyzed',
            notes: notes || ''
        });

        res.status(201).json({
            message: 'Soil report uploaded and analyzed successfully',
            report: {
                id: soilReport.id,
                reportId: soilReport.reportId,
                fileName: soilReport.fileName,
                uploadedAt: soilReport.createdAt,
                soilAnalysis: aiAnalysis.soilAnalysis,
                cropRecommendations: aiAnalysis.cropRecommendations,
                fertilizerPlan: aiAnalysis.fertilizerPlan,
                soilImprovement: aiAnalysis.soilImprovement
            }
        });
    } catch (error) {
        console.error('Soil report upload error:', error);
        res.status(500).json({
            error: 'Failed to process soil report',
            message: error.message
        });
    }
});

// @route   GET /api/soil-reports
// @desc    Get all soil reports for logged-in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const reports = await SoilReport.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'reportId', 'fileName', 'status', 'location', 'createdAt']
        });

        res.json({ reports });
    } catch (error) {
        console.error('Fetch soil reports error:', error);
        res.status(500).json({ error: 'Failed to fetch soil reports' });
    }
});

// @route   GET /api/soil-reports/:id
// @desc    Get specific soil report with full analysis
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const report = await SoilReport.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!report) {
            return res.status(404).json({ error: 'Soil report not found' });
        }

        res.json({ report });
    } catch (error) {
        console.error('Fetch soil report error:', error);
        res.status(500).json({ error: 'Failed to fetch soil report' });
    }
});

// @route   DELETE /api/soil-reports/:id
// @desc    Delete soil report
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const report = await SoilReport.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!report) {
            return res.status(404).json({ error: 'Soil report not found' });
        }

        // Delete file from filesystem
        if (fs.existsSync(report.filePath)) {
            fs.unlinkSync(report.filePath);
        }

        await report.destroy();

        res.json({ message: 'Soil report deleted successfully' });
    } catch (error) {
        console.error('Delete soil report error:', error);
        res.status(500).json({ error: 'Failed to delete soil report' });
    }
});

module.exports = router;
