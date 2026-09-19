const fs = require('fs');
const path = require('path');

const planPath = path.join(__dirname, 'm2_gateway_plan.md');
const planContent = fs.readFileSync(planPath, 'utf8');

// Extract JSX code block
const match = planContent.match(/```tsx([\s\S]*?)```/);
if (!match) {
  console.error("FAIL: Could not find code block in m2_gateway_plan.md");
  process.exit(1);
}

const code = match[1];

const tests = [
  { name: "Zero backdrop-blur", pass: !/backdrop-blur/i.test(code) },
  { name: "Zero bg-gradient-to-*", pass: !/bg-gradient-to-[trbl]{1,2}/i.test(code) },
  { name: "Zero spring animation", pass: !/type:\s*["']spring["']/i.test(code) },
  { name: "Zero duplicate <header> tag", pass: !/<header[\s>]/i.test(code) },
  { name: "Zero duplicate <footer> tag", pass: !/<footer[\s>]/i.test(code) },
  { name: "Zero rounded-3xl", pass: !/rounded-3xl/i.test(code) },
  { name: "Has National Emblem reference", pass: /StateEmblem/i.test(code) },
  { name: "Has Government of India", pass: /Government of India/i.test(code) },
  { name: "Has Ministry of Home Affairs", pass: /Ministry of Home Affairs/i.test(code) },
  { name: "Has Narcotics Control Bureau", pass: /Narcotics Control Bureau/i.test(code) },
  { name: "Has NDPS Act 1985 notice", pass: /NDPS Act/i.test(code) },
  { name: "Has Section 65B Indian Evidence Act", pass: /65B/i.test(code) && /Evidence Act/i.test(code) },
  { name: "Has high-contrast link to /dashboard", pass: /href=["']\/dashboard["']/i.test(code) },
  { name: "Has high-contrast link to /capture", pass: /href=["']\/capture["']/i.test(code) },
  { name: "Has route link to /ledger", pass: /href=["']\/ledger["']/i.test(code) },
  { name: "Has route link to /logs", pass: /href=["']\/logs["']/i.test(code) },
  { name: "Has DBIM Navy Blue token #003366", pass: /#003366/i.test(code) },
  { name: "Has DBIM Green token #138808", pass: /#138808/i.test(code) },
  { name: "Has DBIM Saffron token #FF9933", pass: /#FF9933/i.test(code) },
];

let allPassed = true;
tests.forEach(t => {
  if (t.pass) {
    console.log(`PASS: ${t.name}`);
  } else {
    console.error(`FAIL: ${t.name}`);
    allPassed = false;
  }
});

if (!allPassed) {
  process.exit(1);
}
console.log("\nALL 19 AUDIT CHECKS PASSED FOR PROPOSED src/app/page.tsx CODE!");
