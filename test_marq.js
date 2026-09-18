const lib = require("./src/lib/color_library.json");
const marquis = lib.filter(x => x.reagent === "Marquis");
marquis.forEach(m => {
  console.log(`${m.drug}: Pos [${m.positive_rgb.join()}] Neg [${m.negative_rgb.join()}]`);
});
