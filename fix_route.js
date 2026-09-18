const fs = require('fs');
let code = fs.readFileSync('src/app/api/v1/tests/route.ts', 'utf8');

code = code.replace(
  /const fileName = \`\$\{image_hash\}\.jpg\`;\s+await sharp\(imageBuffer\)\.toFile\(`\.\/public\/uploads\/\$\{fileName\}`\);\s+const testRecord = await prisma\.test\.create\(\{/,
  `// In Vercel serverless, we cannot write to disk. 
    // We'll compress the image and store it as a Base64 string directly in the database.
    const compressedBuffer = await sharp(imageBuffer)
      .resize({ width: 800 }) // compress for DB storage
      .jpeg({ quality: 75 })
      .toBuffer();
    const base64Image = \`data:image/jpeg;base64,\${compressedBuffer.toString("base64")}\`;

    const testRecord = await prisma.test.create({`
);

code = code.replace(
  /image_path: `\/uploads\/\$\{fileName\}`/,
  `image_path: base64Image`
);

fs.writeFileSync('src/app/api/v1/tests/route.ts', code);
