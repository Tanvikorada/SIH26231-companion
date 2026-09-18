const fs = require("fs");
let code = fs.readFileSync("src/app/capture/page.tsx", "utf8");
code = code.replace("from `"lucide-react`";", "from `"lucide-react`";"); // Wait, let's just replace the import line.
code = code.replace(
  'import { ArrowLeft, Upload, MapPin, Loader2, CheckCircle2, Scan, FileCode2, Crosshair, Cpu } from "lucide-react";',
  'import { ArrowLeft, Upload, MapPin, Loader2, CheckCircle2, Scan, FileCode2, Crosshair, Cpu, Camera } from "lucide-react";'
);
fs.writeFileSync("src/app/capture/page.tsx", code);
