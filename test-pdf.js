const fs = require('fs');
const pdf = require('pdf-parse');

async function testExtract() {
  const dataBuffer = fs.readFileSync('./chapters/spells/page-0434.pdf');
  const data = await pdf(dataBuffer);
  console.log("=== SAMPLE TEXT ===");
  console.log(data.text.substring(0, 2000));
}

testExtract();
