const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function splitSpellsIntoPages() {
    try {
        // Read the Spells chapter PDF
        const spellsPdfPath = 'chapters/DnD-PHB-2024-07-Spells.pdf';
        const existingPdfBytes = fs.readFileSync(spellsPdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const totalPages = pdfDoc.getPageCount();
        console.log(`Total pages in Spells chapter: ${totalPages}`);

        // Create output directory
        const outputDir = 'chapters/spells';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Split into individual pages
        for (let pageNum = 0; pageNum < totalPages; pageNum++) {
            const pageDoc = await PDFDocument.create();

            // Copy single page
            const [copiedPage] = await pageDoc.copyPages(pdfDoc, [pageNum]);
            pageDoc.addPage(copiedPage);

            // Save the page PDF
            const pageBytes = await pageDoc.save();

            // Page numbers start from 428 in the original book
            const originalPageNum = 428 + pageNum;
            const filename = `${outputDir}/page-${String(originalPageNum).padStart(4, '0')}.pdf`;

            fs.writeFileSync(filename, pageBytes);

            // Progress indicator every 10 pages
            if ((pageNum + 1) % 10 === 0) {
                console.log(`  Processed ${pageNum + 1}/${totalPages} pages...`);
            }
        }

        console.log(`\n✓ Successfully split ${totalPages} pages into individual files!`);
        console.log(`  Files saved in: ${outputDir}/`);

    } catch (error) {
        console.error('Error splitting PDF:', error);
    }
}

splitSpellsIntoPages();
