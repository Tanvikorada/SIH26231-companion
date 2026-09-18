const fs = require("fs");
let code = fs.readFileSync("src/app/result/[id]/page.tsx", "utf8");
code = code.replace(/import \{ ArrowLeft, Landmark, Printer, Download, ShieldCheck, ShieldAlert \} from "lucide-react";/, 'import { ArrowLeft, Landmark, Printer, Download, ShieldCheck, ShieldAlert, Check } from "lucide-react";');
fs.writeFileSync("src/app/result/[id]/page.tsx", code);
