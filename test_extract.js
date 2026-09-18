const sharp = require("sharp");

async function check() {
  const imagePath = "./public/uploads/mock_positive_dim.png"; // Let's use the one we copied
  // wait, did I name it mock_positive_dim.png in public/uploads? No, I copied it to the artifacts directory.
  // I will just use the file in the artifacts directory.
  const path = "C:/Users/Thanvi/.gemini/antigravity/brain/0efb9c96-94cf-46f6-b9a6-ddd90ee86df9/mock_positive_dim.png";
  const image = sharp(path);
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;
  
  const refX = Math.floor(width * 0.12);
  const refY = Math.floor(height * 0.75);
  const testX = Math.floor(width * 0.70);
  const testY = Math.floor(height * 0.50);
  
  const refStats = await image.extract({ left: refX - 5, top: refY - 5, width: 10, height: 10 }).stats();
  const testStats = await image.extract({ left: testX - 5, top: testY - 5, width: 10, height: 10 }).stats();
  
  console.log("Width:", width, "Height:", height);
  console.log("Ref (x=12%, y=75%):", Math.round(refStats.channels[0].mean), Math.round(refStats.channels[1].mean), Math.round(refStats.channels[2].mean));
  console.log("Test (x=70%, y=50%):", Math.round(testStats.channels[0].mean), Math.round(testStats.channels[1].mean), Math.round(testStats.channels[2].mean));
}
check();
