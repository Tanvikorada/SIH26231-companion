// Test script to safely probe government and public health alert sources
async function run() {
  console.log("=== Testing Target Sources for Threat Alerts & Official References ===");

  const endpoints = [
    {
      name: "openFDA Drug Enforcement API",
      url: "https://api.fda.gov/drug/enforcement.json?limit=3",
      type: "json"
    },
    {
      name: "CDC Press Releases",
      url: "https://www.cdc.gov/media/releases/index.html",
      type: "html"
    },
    {
      name: "DEA Press Releases / Bulletins",
      url: "https://www.dea.gov/press-releases",
      type: "html"
    },
    {
      name: "DrugsData.org Lab Database",
      url: "https://www.drugsdata.org/",
      type: "html"
    },
    {
      name: "UNODC Early Warning Advisory",
      url: "https://www.unodc.org/LSS/Home/EWA",
      type: "html"
    },
    {
      name: "NCB India Official Portal",
      url: "https://narcoticsindia.nic.in/",
      type: "html"
    }
  ];

  for (const ep of endpoints) {
    const start = Date.now();
    try {
      const res = await fetch(ep.url, {
        headers: {
          "User-Agent": "NCB-Forensic-Alert-Bot/1.0 (Government Health & Safety Monitoring; contact: forensic@ncb.gov.in)"
        },
        signal: AbortSignal.timeout(6000)
      });
      const elapsed = Date.now() - start;
      const text = await res.text();
      console.log(`[PASS] ${ep.name} | Status: ${res.status} | Latency: ${elapsed}ms | Size: ${text.length} bytes`);
      if (ep.type === "json") {
        const json = JSON.parse(text);
        console.log(`       Sample records returned: ${json.results?.length || json.length}`);
      } else {
        const titleMatch = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        console.log(`       Page title: ${titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "N/A"}`);
      }
    } catch (err) {
      console.log(`[FAIL] ${ep.name} | Error: ${err.message}`);
    }
  }
}

run();
