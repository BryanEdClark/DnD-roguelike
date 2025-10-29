const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function splitPDF() {
    try {
        // Read the PDF
        const existingPdfBytes = fs.readFileSync('DnD-5.24e-Players-Handbook-2024.pdf');
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const totalPages = pdfDoc.getPageCount();
        console.log(`Total pages: ${totalPages}`);

        // Define chapters with their starting pages (converting to 0-indexed)
        const chapters = [
            { name: '00-Introduction', startPage: 1, endPage: 8 },
            { name: '01-Playing-the-Game', startPage: 9, endPage: 56 },
            { name: '02-Creating-a-Character', startPage: 57, endPage: 86 },
            { name: '03-Character-Classes', startPage: 87, endPage: 325 },
            { name: '04-Character-Origins', startPage: 326, endPage: 356 },
            { name: '05-Feats', startPage: 357, endPage: 385 },
            { name: '06-Equipment', startPage: 386, endPage: 427 },
            { name: '07-Spells', startPage: 428, endPage: 643 },
            { name: '08-Appendix', startPage: 644, endPage: totalPages }
        ];

        // Create output directory if it doesn't exist
        const outputDir = 'chapters';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        // Split into chapters
        for (const chapter of chapters) {
            console.log(`\nCreating ${chapter.name}...`);
            console.log(`  Pages ${chapter.startPage}-${chapter.endPage}`);

            const chapterDoc = await PDFDocument.create();

            // Convert to 0-indexed and copy pages
            const startIdx = chapter.startPage - 1;
            const endIdx = chapter.endPage;
            const pageIndices = Array.from({length: endIdx - startIdx}, (_, i) => startIdx + i);

            const copiedPages = await chapterDoc.copyPages(pdfDoc, pageIndices);
            copiedPages.forEach(page => chapterDoc.addPage(page));

            // Save the chapter PDF
            const chapterBytes = await chapterDoc.save();
            const filename = `${outputDir}/DnD-PHB-2024-${chapter.name}.pdf`;
            fs.writeFileSync(filename, chapterBytes);

            console.log(`  Saved: ${filename} (${(chapterBytes.length / (1024 * 1024)).toFixed(2)} MB)`);
        }

        console.log('\n✓ PDF split successfully into chapters!');

    } catch (error) {
        console.error('Error splitting PDF:', error);
    }
}

splitPDF();
