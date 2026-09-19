const fs = require('fs');
const path = require('path');

function buildEmblemSvg() {
  // Spokes generator
  function spokes(cx, cy, rIn, rOut, count) {
    let res = [];
    for (let i = 0; i < count; i++) {
      const a = (i * 360 / count) * (Math.PI / 180);
      const x1 = (cx + rIn * Math.cos(a)).toFixed(1);
      const y1 = (cy + rIn * Math.sin(a)).toFixed(1);
      const x2 = (cx + rOut * Math.cos(a)).toFixed(1);
      const y2 = (cy + rOut * Math.sin(a)).toFixed(1);
      res.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="0.8" />`);
    }
    return res.join('\n      ');
  }

  // Bead row generator
  function beads(startX, endX, y, step, r) {
    let res = [];
    for (let x = startX; x <= endX; x += step) {
      res.push(`<circle cx="${x.toFixed(1)}" cy="${y}" r="${r}" fill="currentColor" />`);
    }
    return res.join('\n      ');
  }

  const centralChakraSpokes = spokes(100, 163, 2.8, 11, 24);
  const leftChakraSpokes = spokes(28, 163, 2, 7.5, 12);
  const rightChakraSpokes = spokes(172, 163, 2, 7.5, 12);

  const upperBeads = beads(24, 176, 146, 4, 1.0);
  const lowerBeads = beads(24, 176, 180, 4, 1.0);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" fill="none" role="img" aria-labelledby="emblemTitle emblemDesc">
  <title id="emblemTitle">State Emblem of India</title>
  <desc id="emblemDesc">Lion Capital of Ashoka with Satyameva Jayate</desc>
  
  <g fill="currentColor" stroke="none">
    <!-- ==================== LIONS ==================== -->
    
    <!-- LEFT LION (PROFILE FACING LEFT) -->
    <!-- Head & Roaring Jaws -->
    <path d="M 58 36 C 54 34 46 36 42 42 C 38 46 35 50 34 54 C 33 58 36 61 40 60 C 44 59 47 55 48 53 C 44 57 41 62 43 65 C 45 68 49 68 53 65 C 57 62 59 58 59 54 C 60 52 61 46 61 42 Z" />
    <!-- Left Ear -->
    <path d="M 57 32 C 55 28 50 29 49 34 C 48 38 52 40 56 38 Z" />
    <!-- Left Lion Mane & Crest -->
    <path d="M 60 38 C 55 42 48 48 45 56 C 42 63 43 72 47 78 C 43 80 40 85 42 90 C 44 95 48 98 52 96 C 48 100 46 106 48 111 C 51 116 57 118 62 115 C 58 120 57 127 60 131 C 63 135 68 137 72 136 C 68 139 63 140 55 140 L 42 140 C 40 136 39 128 42 120 C 45 112 44 102 40 96 C 36 90 35 80 38 72 C 40 66 43 62 46 58 Z" />
    <!-- Left Forelimb & Paw -->
    <path d="M 45 115 L 43 138 C 42 140 46 141 50 141 C 53 141 55 139 55 137 L 54 122 Z" />
    <path d="M 40 137 C 39 140 43 141 48 141 C 52 141 54 139 54 137 Z" />

    <!-- RIGHT LION (PROFILE FACING RIGHT) -->
    <!-- Head & Roaring Jaws -->
    <path d="M 142 36 C 146 34 154 36 158 42 C 162 46 165 50 166 54 C 167 58 164 61 160 60 C 156 59 153 55 152 53 C 156 57 159 62 157 65 C 155 68 151 68 147 65 C 143 62 141 58 141 54 C 140 52 139 46 139 42 Z" />
    <!-- Right Ear -->
    <path d="M 143 32 C 145 28 150 29 151 34 C 152 38 148 40 144 38 Z" />
    <!-- Right Lion Mane & Crest -->
    <path d="M 140 38 C 145 42 152 48 155 56 C 158 63 157 72 153 78 C 157 80 160 85 158 90 C 156 95 152 98 148 96 C 152 100 154 106 152 111 C 149 116 143 118 138 115 C 142 120 143 127 140 131 C 137 135 132 137 128 136 C 132 139 137 140 145 140 L 158 140 C 160 136 161 128 158 120 C 155 112 156 102 160 96 C 164 90 165 80 162 72 C 160 66 157 62 154 58 Z" />
    <!-- Right Forelimb & Paw -->
    <path d="M 155 115 L 157 138 C 158 140 154 141 150 141 C 147 141 145 139 145 137 L 146 122 Z" />
    <path d="M 160 137 C 161 140 157 141 152 141 C 148 141 146 139 146 137 Z" />

    <!-- CENTER LION (FRONTAL VIEW) -->
    <!-- Crown & Ears -->
    <path d="M 90 32 C 86 28 80 29 79 34 C 78 38 82 41 87 39 Z" />
    <path d="M 110 32 C 114 28 120 29 121 34 C 122 38 118 41 113 39 Z" />
    <path d="M 87 36 C 92 33 100 32 108 33 C 113 36 111 40 108 42 C 103 40 97 40 92 42 C 89 40 87 36 87 36 Z" />
    
    <!-- Forehead & Eyes -->
    <path d="M 91 43 C 95 44 98 46 99 49 C 97 50 94 49 92 47 Z" />
    <path d="M 109 43 C 105 44 102 46 101 49 C 103 50 106 49 108 47 Z" />
    <circle cx="95.5" cy="46.5" r="1.8" />
    <circle cx="104.5" cy="46.5" r="1.8" />
    
    <!-- Nose & Snout -->
    <path d="M 97 48 L 103 48 L 101.5 53 L 98.5 53 Z" />
    <path d="M 96 53 C 94 53 92 55 93 57 C 95 59 98 58 100 56 C 102 58 105 59 107 57 C 108 55 106 53 104 53 Z" />

    <!-- Roaring Mouth & Fangs -->
    <path d="M 94 58 C 96 57 100 57 106 58 C 106 63 104 67 100 68 C 96 67 94 63 94 58 Z" />
    <polygon points="96,58 97.5,61 99,58" fill="white" />
    <polygon points="101,58 102.5,61 104,58" fill="white" />
    <polygon points="97.5,66 99,63 100.5,66" fill="white" />
    <polygon points="100.5,66 102,63 103.5,66" fill="white" />

    <!-- Center Lion Mane Locks (Tiered Cascades) -->
    <!-- Tier 1: Surrounding Head -->
    <path d="M 85 43 C 81 46 76 52 76 57 C 76 61 80 62 84 59 C 80 63 78 68 80 72 C 83 74 87 72 89 67 C 88 72 89 77 92 80 C 95 81 98 78 97 73 Z" />
    <path d="M 115 43 C 119 46 124 52 124 57 C 124 61 120 62 116 59 C 120 63 122 68 120 72 C 117 74 113 72 111 67 C 112 72 111 77 108 80 C 105 81 102 78 103 73 Z" />
    
    <!-- Tier 2: Mid Mane -->
    <path d="M 77 68 C 72 73 70 80 72 86 C 74 91 79 92 82 87 C 80 92 80 98 83 102 C 86 105 90 102 91 97 Z" />
    <path d="M 123 68 C 128 73 130 80 128 86 C 126 91 121 92 118 87 C 120 92 120 98 117 102 C 114 105 110 102 109 97 Z" />

    <!-- Tier 3: Breast & Chest Locks -->
    <path d="M 94 77 C 91 83 90 91 92 98 C 94 103 98 105 100 100 C 102 105 106 103 108 98 C 110 91 109 83 106 77 C 103 82 97 82 94 77 Z" />
    <path d="M 93 100 C 90 106 88 114 91 121 C 94 126 98 127 100 122 C 102 127 106 126 109 121 C 112 114 110 106 107 100 C 104 105 96 105 93 100 Z" />

    <!-- Center Lion Forelegs & Paws on Abacus -->
    <path d="M 83 108 L 81 138 C 80 140 85 141 90 141 C 94 141 96 139 96 137 L 93 118 Z" />
    <path d="M 79 137 C 78 140 83 141 89 141 C 93 141 95 139 95 137 Z" />
    
    <path d="M 117 108 L 119 138 C 120 140 115 141 110 141 C 106 141 104 139 104 137 L 107 118 Z" />
    <path d="M 121 137 C 122 140 117 141 111 141 C 107 141 105 139 105 137 Z" />
  </g>

  <!-- ==================== ABACUS / FRIEZE ==================== -->
  <g fill="currentColor">
    <!-- Upper Moulding -->
    <rect x="20" y="142" width="160" height="2.5" />
    ${upperBeads}
    <rect x="20" y="148.5" width="160" height="1.5" />

    <!-- Lower Moulding -->
    <rect x="20" y="177" width="160" height="1.5" />
    ${lowerBeads}
    <rect x="20" y="183" width="160" height="2.5" />

    <!-- Flanking Half-Chakras -->
    <!-- Far Left Wheel -->
    <circle cx="28" cy="163" r="8" stroke="currentColor" stroke-width="1.2" fill="none" />
    <circle cx="28" cy="163" r="2" />
    ${leftChakraSpokes}

    <!-- Far Right Wheel -->
    <circle cx="172" cy="163" r="8" stroke="currentColor" stroke-width="1.2" fill="none" />
    <circle cx="172" cy="163" r="2" />
    ${rightChakraSpokes}

    <!-- Galloping Horse (Left of Central Chakra) -->
    <!-- Stylized dynamic horse silhouette -->
    <path d="M 44 168 C 46 166 48 163 48 160 C 48 156 46 154 44 153 C 45 151 47 151 49 152 C 51 153 53 156 55 155 C 57 154 58 152 60 152 C 62 152 64 155 67 155 C 69 155 72 153 74 155 C 77 157 78 160 76 163 C 74 165 71 166 69 166 C 68 168 67 171 67 174 L 65 174 C 65 171 66 168 64 167 C 62 167 60 169 58 171 L 56 171 C 57 168 58 166 56 165 C 53 165 50 166 48 169 L 46 169 C 46 167 45 166 43 166 L 43 168 Z" />
    
    <!-- Charging Bull (Right of Central Chakra) -->
    <!-- Stylized strong humped bull silhouette -->
    <path d="M 126 163 C 128 160 131 157 135 156 C 137 154 139 152 141 153 C 142 154 141 156 142 157 C 145 156 148 156 150 158 C 153 157 155 155 157 155 C 156 157 155 159 153 160 C 155 161 157 162 156 165 C 154 167 151 167 149 166 C 147 167 146 170 146 174 L 144 174 C 144 170 145 167 143 166 C 141 166 139 168 138 171 L 136 171 C 137 168 138 165 136 164 C 133 164 130 165 128 168 L 126 168 Z" />

    <!-- Central Ashoka Chakra -->
    <circle cx="100" cy="163" r="12" stroke="currentColor" stroke-width="1.8" fill="none" />
    <circle cx="100" cy="163" r="2.8" />
    ${centralChakraSpokes}
  </g>

  <!-- ==================== LOTUS PEDESTAL ==================== -->
  <g fill="currentColor">
    <!-- Inverted Lotus Petals -->
    <path d="M 40 186 C 50 188 60 196 68 205 C 62 201 52 198 42 196 Z" />
    <path d="M 64 186 C 72 190 82 198 88 206 C 82 203 74 199 66 197 Z" />
    <path d="M 84 186 C 92 190 98 198 100 207 C 102 198 108 190 116 186 C 110 195 106 202 100 207 C 94 202 90 195 84 186 Z" />
    <path d="M 136 186 C 128 190 118 198 112 206 C 118 203 126 199 134 197 Z" />
    <path d="M 160 186 C 150 188 140 196 132 205 C 138 201 148 198 158 196 Z" />
    
    <!-- Base Platform Rim -->
    <rect x="50" y="206" width="100" height="2" rx="1" />
  </g>

  <!-- ==================== MOTTO ==================== -->
  <text 
    x="100" 
    y="226" 
    text-anchor="middle" 
    font-family="'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif" 
    font-size="13" 
    font-weight="700" 
    letter-spacing="0.08em" 
    fill="currentColor">
    सत्यमेव जयते
  </text>
</svg>`;

  fs.writeFileSync(path.join(__dirname, 'emblem-india.svg'), svg, 'utf8');
  console.log("Wrote emblem-india.svg successfully! Length:", svg.length);
}

buildEmblemSvg();
