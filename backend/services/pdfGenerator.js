const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * PDF Report Generator Service
 * Generates insurance-ready climate loss reports
 */

async function generateLossReportPDF(lossReport, user, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            // Create PDF document
            const doc = new PDFDocument({ size: 'A4', margin: 50 });

            // Pipe to file
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // Header
            doc.fontSize(20).font('Helvetica-Bold')
                .text('CLIMATE LOSS REPORT', { align: 'center' })
                .moveDown(0.5);

            doc.fontSize(12).font('Helvetica')
                .text('Kishan Saathi - Climate Intelligence System', { align: 'center' })
                .moveDown(1.5);

            // Report ID and Date
            doc.fontSize(10)
                .text(`Report ID: ${lossReport.reportId}`, { bold: true })
                .text(`Generated: ${new Date().toLocaleDateString('en-IN')}`)
                .moveDown(1);

            // Farmer Information
            doc.fontSize(14).font('Helvetica-Bold')
                .text('Farmer Information')
                .moveDown(0.5);

            doc.fontSize(10).font('Helvetica')
                .text(`Name: ${user.name}`)
                .text(`Phone: ${user.phone}`)
                .text(`Location: ${user.farmDetails.location.village || ''}, ${user.farmDetails.location.district}, ${user.farmDetails.location.state}`)
                .text(`Land Area: ${user.farmDetails.landArea} hectares`)
                .text(`Soil Type: ${user.farmDetails.soilType}`)
                .moveDown(1);

            // Report Period
            doc.fontSize(14).font('Helvetica-Bold')
                .text('Report Period')
                .moveDown(0.5);

            doc.fontSize(10).font('Helvetica')
                .text(`Period: ${new Date(lossReport.period.startDate).toLocaleDateString('en-IN')} to ${new Date(lossReport.period.endDate).toLocaleDateString('en-IN')}`)
                .text(`Season: ${lossReport.period.season || 'N/A'}`)
                .text(`Crop: ${lossReport.period.crop || 'N/A'}`)
                .moveDown(1);

            // Climate Impact Analysis
            doc.fontSize(14).font('Helvetica-Bold')
                .text('Climate Impact Analysis')
                .moveDown(0.5);

            if (lossReport.climateImpact.stressEvents && lossReport.climateImpact.stressEvents.length > 0) {
                doc.fontSize(10).font('Helvetica')
                    .text(`Total Stress Days: ${lossReport.climateImpact.totalStressDays || 0}`)
                    .text(`Average Stress Level: ${lossReport.climateImpact.avgStressLevel || 'Not Available'}`)
                    .moveDown(0.5);

                doc.fontSize(12).font('Helvetica-Bold')
                    .text('Climate Stress Events:')
                    .moveDown(0.3);

                lossReport.climateImpact.stressEvents.forEach((event, index) => {
                    doc.fontSize(10).font('Helvetica')
                        .text(`${index + 1}. ${event.type} - Severity: ${event.severity}`)
                        .text(`   Date: ${new Date(event.date).toLocaleDateString('en-IN')}`)
                        .text(`   Duration: ${event.duration} days`)
                        .text(`   Description: ${event.description || 'N/A'}`)
                        .moveDown(0.3);
                });
            } else {
                doc.fontSize(10).font('Helvetica')
                    .text('No major climate stress events recorded.')
                    .moveDown(0.5);
            }

            doc.moveDown(0.5);

            // Yield Loss Estimation
            doc.fontSize(14).font('Helvetica-Bold')
                .text('Yield Loss Estimation')
                .moveDown(0.5);

            doc.fontSize(10).font('Helvetica')
                .text(`Expected Yield: ${lossReport.yieldLoss.expectedYield.value} ${lossReport.yieldLoss.expectedYield.unit}`)
                .text(`Actual Yield: ${lossReport.yieldLoss.actualYield.value} ${lossReport.yieldLoss.actualYield.unit}`)
                .text(`Loss Percentage: ${lossReport.yieldLoss.lossPercentage}%`, { underline: true })
                .text(`Loss Quantity: ${lossReport.yieldLoss.lossQuantity.value} ${lossReport.yieldLoss.lossQuantity.unit}`)
                .moveDown(1);

            // Financial Impact
            doc.fontSize(14).font('Helvetica-Bold')
                .text('Financial Impact')
                .moveDown(0.5);

            doc.fontSize(10).font('Helvetica')
                .text(`Expected Crop Value: ₹${lossReport.financialLoss.cropValue.expected.toLocaleString('en-IN')}`)
                .text(`Actual Crop Value: ₹${lossReport.financialLoss.cropValue.actual.toLocaleString('en-IN')}`)
                .text(`Crop Value Loss: ₹${lossReport.financialLoss.cropValue.loss.toLocaleString('en-IN')}`, { underline: true })
                .moveDown(0.5);

            if (lossReport.financialLoss.additionalCosts) {
                doc.text('Additional Costs:')
                    .text(`  - Irrigation: ₹${lossReport.financialLoss.additionalCosts.irrigation || 0}`)
                    .text(`  - Pest Control: ₹${lossReport.financialLoss.additionalCosts.pestControl || 0}`)
                    .text(`  - Extra Labor: ₹${lossReport.financialLoss.additionalCosts.laborExtra || 0}`)
                    .text(`  - Other: ₹${lossReport.financialLoss.additionalCosts.other || 0}`)
                    .moveDown(0.5);
            }

            doc.fontSize(12).font('Helvetica-Bold')
                .text(`TOTAL LOSS: ₹${lossReport.financialLoss.totalLoss.toLocaleString('en-IN')}`, { underline: true })
                .moveDown(1);

            // Insurance & Compensation
            doc.fontSize(14).font('Helvetica-Bold')
                .text('Insurance & Compensation Status')
                .moveDown(0.5);

            doc.fontSize(10).font('Helvetica');

            if (lossReport.insuranceInfo.hasInsurance) {
                doc.text(`Insurance Provider: ${lossReport.insuranceInfo.provider}`)
                    .text(`Policy Number: ${lossReport.insuranceInfo.policyNumber}`)
                    .text(`Claim Amount: ₹${lossReport.insuranceInfo.claimAmount?.toLocaleString('en-IN') || 'Pending'}`)
                    .text(`Claim Status: ${lossReport.insuranceInfo.claimStatus}`)
                    .moveDown(0.5);
            } else {
                doc.text('No insurance coverage.')
                    .moveDown(0.5);
            }

            if (lossReport.governmentCompensation.eligible) {
                doc.text(`Government Scheme: ${lossReport.governmentCompensation.scheme}`)
                    .text(`Expected Compensation: ₹${lossReport.governmentCompensation.expectedAmount?.toLocaleString('en-IN') || 'TBD'}`)
                    .text(`Application Status: ${lossReport.governmentCompensation.applicationStatus}`)
                    .moveDown(1);
            } else {
                doc.text('Eligibility for government compensation being evaluated.')
                    .moveDown(1);
            }

            // Certification
            doc.moveDown(2);
            doc.fontSize(10).font('Helvetica')
                .text('This report has been generated by Kishan Saathi Climate Intelligence System based on verified weather data, climate stress analysis, and farmer-provided information. This document can be used for insurance claims and government compensation applications.',
                    { align: 'justify' })
                .moveDown(1);

            // Footer
            doc.fontSize(8).font('Helvetica-Oblique')
                .text(`Report Status: ${lossReport.status}`, { align: 'center' })
                .text(`Generated on ${new Date().toLocaleString('en-IN')}`, { align: 'center' });

            // Finalize PDF
            doc.end();

            stream.on('finish', () => {
                resolve(outputPath);
            });

            stream.on('error', (error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generateLossReportPDF
};
