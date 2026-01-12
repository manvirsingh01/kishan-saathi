// PDF Generator - Disabled for serverless mode
// Original functionality required pdfkit which isn't serverless compatible

/**
 * Generate Loss Report PDF - Disabled for serverless
 */
async function generateLossReportPDF(report, user, outputPath) {
    throw new Error('PDF generation is not available in serverless mode');
}

module.exports = {
    generateLossReportPDF
};
