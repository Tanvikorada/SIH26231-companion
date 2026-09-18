const fs = require("fs");
const text = `
Marquis Morphine Sulfate Color Assist Light 16 6 13 Color Assist Light 215 209 199
Ferric Sulfate Morphine Sulfate Color Assist Light 129 127 102 Color Assist Light 213 200 165
Nitric Acid Morphine Sulfate Color Assist Light 190 109 11 Color Assist Light 181 174 169
Marquis Codeine Color Assist Light 25 11 23 Color Assist Light 177 171 167
Ferric Sulfate Codeine Color Assist Light 181 159 97 Color Assist Light 176 163 132
Nitric Acid Codeine Color Assist Light 184 184 98 Color Assist Light 217 210 209
Marquis Heroin Color Assist Light 17 7 14 Color Assist Light 165 161 156
Ferric Sulfate Heroin Color Assist Light 161 151 111 Color Assist Light 173 162 136
Nitric Acid Heroin Color Assist Light 191 186 152 Color Assist Light 176 171 170
Wagner Cocaine HCl Color Assist Light 38 10 8 Color Assist Light 134 47 9
Cobalt Thiocyanate Cocaine HCl Color Assist Light 2 65 121 Color Assist Light 194 146 158
Marquis Diazepam Color Assist Light 163 156 132 Color Assist Light 168 162 154
Marquis Methadone Color Assist Light 168 160 142 Color Assist Light 178 173 168
Chen Kao Cathine Color Assist Light 133 133 114 Color Assist Light 148 147 137
Marquis Opium Color Assist Light 139 117 89 Color Assist Light 168 162 149
Ferric Sulfate Opium Color Assist Light 173 153 106 Color Assist Light 177 166 130
Dille-Koppanyi Phenobarbital Color Assist Light 181 143 186 Color Assist Light 182 175 176
Marquis Amphetamine Color Assist Light 139 48 14 Color Assist Light 182 173 157
Sulfuric Acid Amphetamine Color Assist Light 180 170 150 Color Assist Light 210 199 180
Simon Test Amphetamine Color Assist Light 190 163 162 Color Assist Light 196 177 128
Marquis Methamphetamine Color Assist Light 137 53 17 Color Assist Light 169 157 136
Sulfuric Acid Methamphetamine Color Assist Light 178 168 149 Color Assist Light 178 170 158
Simon Test Methamphetamine Color Assist Light 198 180 149 Color Assist Light 172 152 107
Marquis Mescaline Color Assist Light 188 64 10 Color Assist Light 191 178 160
Liebermann Mescaline Color Assist Light 11 10 12 Color Assist Light 162 159 151
Marquis Fentanyl Color Assist Light 185 135 26 Color Assist Light 176 161 141
Marquis Meperidine Color Assist Light 178 132 31 Color Assist Light 165 153 130
Liebermann Meperidine Color Assist Light 178 70 8 Color Assist Light 210 206 199
Dille-Koppanyi Pentobarbital Color Assist Light 184 151 194 Color Assist Light 188 183 178
Scott Cocaine HCl Color Assist Light 106 143 153 Color Assist Light 194 171 164
Cobalt Thiocyanate PCP Color Assist Light 27 90 141 Color Assist Light 188 132 145
Scott Cocaine Base Color Assist Light 91 160 170 Color Assist Light 179 174 161
`;

const lines = text.trim().split("\n");
const db = [];

for (const line of lines) {
  // E.g. "Marquis Morphine Sulfate Color Assist Light 16 6 13 Color Assist Light 215 209 199"
  // regex to match: (Reagent) (Drug) Color Assist Light (R) (G) (B) Color Assist Light (R2) (G2) (B2)
  const match = line.match(/^(.*?) (.*?) Color Assist Light (\d+) (\d+) (\d+) Color Assist Light (\d+) (\d+) (\d+)$/);
  if (match) {
    db.push({
      reagent: match[1].trim(),
      drug: match[2].trim(),
      positive_rgb: [parseInt(match[3]), parseInt(match[4]), parseInt(match[5])],
      negative_rgb: [parseInt(match[6]), parseInt(match[7]), parseInt(match[8])]
    });
  }
}

fs.writeFileSync("src/lib/color_library.json", JSON.stringify(db, null, 2));
console.log("Wrote " + db.length + " tests to src/lib/color_library.json");
