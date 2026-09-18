const { PdfReader } = require('pdfreader');

let text = "";
new PdfReader().parseFileItems("C:/Users/Thanvi/.gemini/antigravity/brain/0efb9c96-94cf-46f6-b9a6-ddd90ee86df9/.user_uploaded/media_1789750958177.pdf", (err, item) => {
  if (err) console.error("error:", err);
  else if (!item) {
    const fs = require('fs');
    fs.writeFileSync('raw_pdf_text.txt', text);
    console.log("Done! Length: ", text.length);
  }
  else if (item.text) text += item.text + " ";
});
