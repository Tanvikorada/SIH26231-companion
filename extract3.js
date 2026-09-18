const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:/Users/Thanvi/.gemini/antigravity/brain/0efb9c96-94cf-46f6-b9a6-ddd90ee86df9/.user_uploaded/media_1789750958177.pdf';

async function parsePDF() {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  fs.writeFileSync('pdf_with_newlines.txt', data.text);
  console.log("Done! Length: ", data.text.length);
}

parsePDF().catch(console.error);
