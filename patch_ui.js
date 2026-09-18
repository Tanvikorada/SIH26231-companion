const fs = require("fs");
let code = fs.readFileSync("src/app/capture/page.tsx", "utf8");

// We need to add a <select> element and pass it in the form data
code = code.replace(/<form onSubmit=\{handleSubmit\} className="space-y-4">/, `
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Reagent Used</label>
            <select name="reagent" className="p-2 border rounded text-black bg-white" required>
              <option value="Marquis">Marquis</option>
              <option value="Ferric Sulfate">Ferric Sulfate</option>
              <option value="Nitric Acid">Nitric Acid</option>
              <option value="Wagner">Wagner</option>
              <option value="Cobalt Thiocyanate">Cobalt Thiocyanate</option>
              <option value="Simon Test">Simon Test</option>
              <option value="Liebermann">Liebermann</option>
              <option value="Dille-Koppanyi">Dille-Koppanyi</option>
              <option value="Scott">Scott</option>
            </select>
          </div>
`);

// The handleSubmit function currently uses FormData from the event target, so the select named 'reagent' will automatically be included!
fs.writeFileSync("src/app/capture/page.tsx", code);
