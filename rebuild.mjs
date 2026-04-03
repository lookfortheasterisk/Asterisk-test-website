import { readFileSync, writeFileSync } from 'fs';
let c = readFileSync('c:/Users/prana/ASTERISK/asterisk_v2 (1).html', 'utf-8');

function rep(from, to, label) {
  if (!c.includes(from)) { console.log('✗', label || from.substring(0,55)); return false; }
  c = c.replace(from, to);
  console.log('✓', label || from.substring(0,55));
  return true;
}
function findDivEnd(str, idx) {
  let pos = idx, depth = 0;
  while (pos < str.length) {
    const oi = str.indexOf('<div', pos), ci = str.indexOf('</div>', pos);
    if (oi === -1 && ci === -1) break;
    if (oi !== -1 && (ci === -1 || oi < ci)) { depth++; pos = oi + 1; }
    else { depth--; pos = ci + 6; if (depth === 0) return pos; }
  }
  return -1;
}

// ══════════════════════════════════════════════════════════════════
// PASS 1 — original section removals (from patch_ast)
// ══════════════════════════════════════════════════════════════════

// 1. Remove "Sustainable Design Studio, India" hero-tag
rep(
  '    <div class="hero-tag" style="position:relative;z-index:2;">Sustainable Design Studio, India</div>\n',
  '', 'Remove hero-tag'
);

// 2. Remove sphere canvas
const ci = c.indexOf('    <!-- DitheringShader: Sphere');
if (ci !== -1) {
  const ls = c.lastIndexOf('\n', ci);
  const ce = c.indexOf('</canvas>', ci) + '</canvas>'.length;
  c = c.slice(0, ls) + c.slice(ce);
  console.log('✓ Removed sphere canvas');
}

// 3a. Cursor border-radius → circle
rep('      border-radius: 0;\n', '      border-radius: 50%;\n', 'Cursor → circle');

// 3b. Remove crosshair
const xhS = '    /* Asterisk inside cursor ring */';
const xhE = "#cursor-ring.big::before,\n    #cursor-ring.big::after { background: var(--indigo); }\n";
const xi = c.indexOf(xhS), xe = c.indexOf(xhE);
if (xi !== -1 && xe !== -1) { c = c.slice(0, xi) + c.slice(xe + xhE.length); console.log('✓ Removed crosshair CSS'); }

// 4. Remove stats strip after countdown (100% / ∞ / 1 Drop)
const sm = '        <div style="margin-top:40px;padding-top:40px;border-top:1px solid rgba(255,255,255,0.08);display:flex;gap:40px;">';
const si2 = c.indexOf(sm);
if (si2 !== -1) {
  const ls = c.lastIndexOf('\n', si2);
  let pos = si2, depth = 0, end = -1;
  while (pos < c.length) {
    const oi = c.indexOf('<div', pos), ci2 = c.indexOf('</div>', pos);
    if (oi === -1 && ci2 === -1) break;
    if (oi !== -1 && (ci2 === -1 || oi < ci2)) { depth++; pos = oi + 1; }
    else { depth--; pos = ci2 + 6; if (depth === 0) { end = pos; break; } }
  }
  if (end !== -1) { c = c.slice(0, ls) + c.slice(end); console.log('✓ Removed stats strip'); }
}

// 5. Remove artists section
const artS = c.indexOf('  <!-- ══════════════════════════ ARTISTS');
const artE = c.indexOf('  <!-- ══════════════════════ CIRCULAR');
if (artS !== -1 && artE !== -1) {
  const pre = c.lastIndexOf('\n\n', artS);
  c = c.slice(0, pre + 1) + c.slice(artE);
  console.log('✓ Removed artists section');
}

// 6. Remove circular/loop section
const circS = c.indexOf('  <!-- ══════════════════════ CIRCULAR');
const circE = c.indexOf('  <!-- ══════════════════════════ NOTIFY');
if (circS !== -1 && circE !== -1) {
  const pre = c.lastIndexOf('\n\n', circS);
  c = c.slice(0, pre + 1) + c.slice(circE);
  console.log('✓ Removed circular section');
}

// 7. Remove post-notify stats
const s2m = '    <div class="reveal reveal-delay-2" style="margin-top:100px;padding-top:80px;border-top:1px solid rgba(255,255,255,0.06);">';
const s2i = c.indexOf(s2m);
if (s2i !== -1) {
  const ls = c.lastIndexOf('\n', s2i);
  let pos = s2i, depth = 0, end = -1;
  while (pos < c.length) {
    const oi = c.indexOf('<div', pos), ci2 = c.indexOf('</div>', pos);
    if (oi === -1 && ci2 === -1) break;
    if (oi !== -1 && (ci2 === -1 || oi < ci2)) { depth++; pos = oi + 1; }
    else { depth--; pos = ci2 + 6; if (depth === 0) { end = pos; break; } }
  }
  if (end !== -1) { c = c.slice(0, ls) + c.slice(end); console.log('✓ Removed post-notify stats'); }
}

// 8. Remove footer stance
const fsS = c.indexOf('    <div class="footer-stance">');
if (fsS !== -1) {
  const ls = c.lastIndexOf('\n', fsS);
  const fsE = c.indexOf('</div>', fsS) + '</div>'.length;
  c = c.slice(0, ls) + c.slice(fsE);
  console.log('✓ Removed footer stance');
}
rep('  <footer>', '  <footer style="justify-content:center;flex-direction:column;gap:16px;text-align:center;">', 'Footer center');
rep('\n      <a href="#artists" class="nav-link">Artists</a>', '', 'Remove Artists nav');
rep('\n      <a href="#circular" class="nav-link">Circular</a>', '', 'Remove Circular nav');

// 9. Remove WebGL dithering shader JS
const dS = c.indexOf('    // ══════════════════════════════════════════════════════════\n    // DITHERING SHADER');
if (dS !== -1) {
  const bS = c.lastIndexOf('\n\n', dS) + 1;
  const fS = c.indexOf('(function initDitheringShader()', dS);
  const iE = c.indexOf('    })();\n', fS);
  if (iE !== -1) { c = c.slice(0, bS) + c.slice(iE + '    })();\n'.length); console.log('✓ Removed dithering shader JS'); }
}

// 10. Remove artists scroll drag JS
const dgS = c.indexOf('    // ── ARTISTS SCROLL DRAG');
if (dgS !== -1) {
  const bS = c.lastIndexOf('\n', dgS);
  const tE = c.indexOf('\n    // ── THEME TOGGLE', dgS);
  if (tE !== -1) { c = c.slice(0, bS) + c.slice(tE); console.log('✓ Removed artists drag JS'); }
}

// ══════════════════════════════════════════════════════════════════
// PASS 2 — CSS additions
// ══════════════════════════════════════════════════════════════════
const newCSS = `
    /* ═══ HERO WAVE ════════════════════════════════════════════════ */
    #hero-wave-svg {
      position: absolute; inset: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 0;
    }

    /* ═══ WIPE REVEAL ══════════════════════════════════════════════ */
    .sec-wipe {
      clip-path: inset(48px 0 0 0); opacity: 0;
      transition: clip-path 1.1s cubic-bezier(0.16,1,0.3,1), opacity 0.9s ease;
    }
    .sec-wipe.wipe-in { clip-path: inset(0px 0 0 0); opacity: 1; }

    /* ═══ PILLAR CANVAS ════════════════════════════════════════════ */
    .pillar-canvas { display: block; width: 60px; height: 60px; margin-bottom: 28px; }

    /* ═══ NOTIFY / BE AN ASTERISK ══════════════════════════════════ */
    .be-heading {
      font-family: 'Inter', sans-serif; font-weight: 900;
      font-size: clamp(64px, 10vw, 128px);
      letter-spacing: -0.05em; line-height: 0.88; color: #fff;
    }
    .be-heading .be-lime { color: #CFFF04; }
    .notify-divider { width: 1px; height: 72px; background: rgba(255,255,255,0.1); margin: 40px auto 44px; }
    .drop-label-sm {
      font-family: 'Inter', sans-serif; font-weight: 700;
      font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #CFFF04; margin-bottom: 24px;
    }
`;
rep('  </style>', newCSS + '\n  </style>', 'Add CSS');

// ══════════════════════════════════════════════════════════════════
// PASS 3 — HTML modifications
// ══════════════════════════════════════════════════════════════════

// Hero: replace entire content, centered, with wave + tagline only
rep(
  '  <section id="hero">',
  '  <section id="hero" style="align-items:center;text-align:center;justify-content:center;">',
  'Hero center'
);
rep(
  '    <!-- Big background asterisk (kept for mobile / fallback) -->\n    <img data-lm="1" src="" alt="" class="hero-bg-asterisk" aria-hidden="true">',
  `    <!-- Wave background -->
    <svg id="hero-wave-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"></svg>`,
  'Hero wave SVG + remove bg asterisk'
);

// Remove h1
const h1S = c.indexOf('\n    <h1 class="hero-h1"');
const h1E = c.indexOf('</h1>', h1S) + '</h1>'.length;
if (h1S !== -1 && h1E !== -1) { c = c.slice(0, h1S) + c.slice(h1E); console.log('✓ Removed h1'); }

// Replace hero-sub with tagline
rep(
  `    <p class="hero-sub" style="position:relative;z-index:2;">
      There's always more than meets the eye. We design products that transform the ordinary into the extraordinary, powered by art, driven by innovation, rooted in sustainability.
    </p>`,
  `    <div style="position:relative;z-index:2;max-width:820px;">
      <p style="font-family:'Inter',sans-serif;font-weight:900;font-size:clamp(28px,4.5vw,62px);letter-spacing:-0.04em;line-height:1.05;color:#fff;margin:0;">
        There's always more to something
      </p>
      <p style="font-family:'Inter',sans-serif;font-weight:900;font-size:clamp(28px,4.5vw,62px);letter-spacing:-0.04em;line-height:1.05;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,0.28);margin:0;">
        than meets the eye.
      </p>
    </div>`,
  'Replace hero-sub with tagline'
);

// Remove hero-actions
rep(
  `\n    <div class="hero-actions" style="position:relative;z-index:2;">
      <a href="#drop" class="btn-primary"><span>See First Drop &nbsp;→</span></a>
      <a href="#about" class="btn-outline"><span>Our Story</span></a>
    </div>`,
  '', 'Remove hero actions'
);

// Fix scroll indicator: remove old, add fixed-bottom version
rep(
  `    <!-- Scroll indicator -->
    <div class="hero-scroll" style="position:relative;z-index:2;">
      <div class="scroll-line"></div>
      <span>Scroll to explore</span>
    </div>`,
  `    <!-- Scroll indicator — pinned to bottom of hero -->
    <div class="hero-scroll" style="position:absolute;bottom:48px;left:48px;z-index:2;">
      <div class="scroll-line"></div>
      <span>Scroll to explore</span>
    </div>`,
  'Fix scroll indicator position'
);

// Remove rotating ring wrap
const rrS = c.indexOf('\n    <!-- Rotating text ring -->');
const rrE = c.indexOf('</div>\n  </section>', rrS) + '</div>'.length;
if (rrS !== -1 && rrE !== -1) { c = c.slice(0, rrS) + c.slice(rrE); console.log('✓ Removed rotating ring'); }

// About section wipe
rep('  <section id="about">', '  <section id="about" class="sec-wipe">', 'About sec-wipe');

// Pillar canvases
rep(
  `        <!-- Asterisk-inspired icon: cross + diagonal -->
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" style="margin-bottom:32px;">
          <rect x="19" y="4" width="6" height="36" rx="3" fill="#CFFF04"/>
          <rect x="4" y="19" width="36" height="6" rx="3" fill="#CFFF04"/>
          <rect x="7" y="7" width="6" height="22" rx="3" fill="#CFFF04" opacity="0.5" transform="rotate(-45 7 7) translate(8, -4)"/>
        </svg>`,
  '        <canvas class="pillar-canvas" id="pc1"></canvas>', 'Pillar 1 canvas'
);
rep(
  `        <!-- Brush / palette icon -->
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" style="margin-bottom:32px;">
          <circle cx="22" cy="22" r="14" stroke="#5D00FF" stroke-width="3"/>
          <circle cx="22" cy="22" r="6" fill="#5D00FF" opacity="0.5"/>
          <line x1="22" y1="4" x2="22" y2="12" stroke="#5D00FF" stroke-width="3" stroke-linecap="round"/>
          <line x1="22" y1="32" x2="22" y2="40" stroke="#5D00FF" stroke-width="3" stroke-linecap="round"/>
          <line x1="4" y1="22" x2="12" y2="22" stroke="#5D00FF" stroke-width="3" stroke-linecap="round"/>
          <line x1="32" y1="22" x2="40" y2="22" stroke="#5D00FF" stroke-width="3" stroke-linecap="round"/>
        </svg>`,
  '        <canvas class="pillar-canvas" id="pc2"></canvas>', 'Pillar 2 canvas'
);
rep(
  `        <!-- Circular loop icon -->
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" style="margin-bottom:32px;">
          <path d="M22 8 A14 14 0 0 1 36 22" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
          <path d="M36 22 A14 14 0 0 1 22 36" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
          <path d="M22 36 A14 14 0 0 1 8 22" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
          <path d="M8 22 A14 14 0 0 1 22 8" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
          <polygon points="22,4 26,12 18,12" fill="white" opacity="0.7"/>
        </svg>`,
  '        <canvas class="pillar-canvas" id="pc3"></canvas>', 'Pillar 3 canvas'
);

// Manifesto wipe + remove brand stance
rep('  <section id="manifesto"', '  <section id="manifesto" class="sec-wipe"', 'Manifesto sec-wipe');
const stS = c.indexOf('      <div class="reveal reveal-delay-2" style="margin-top:64px;display:flex;align-items:center;gap:32px;">');
if (stS !== -1) {
  const ls = c.lastIndexOf('\n', stS);
  const stE = findDivEnd(c, stS);
  c = c.slice(0, ls) + c.slice(stE);
  console.log('✓ Removed brand stance');
}

// Product visual → question mark
rep(
  `      <!-- Visual -->
      <div class="reveal">
        <div class="product-visual-wrap">
          <div class="product-label">COMING SOON</div>
          <div class="product-img-holder">
            <img data-lm="1" src="" alt="Clip+Art* product mark">
          </div>
        </div>
      </div>`,
  `      <!-- Question mark reveal -->
      <div class="reveal">
        <div class="product-visual-wrap">
          <div class="product-label">COMING SOON</div>
          <div class="product-img-holder" style="display:flex;align-items:center;justify-content:center;">
            <span style="font-family:'Inter',sans-serif;font-weight:900;font-size:clamp(120px,18vw,260px);letter-spacing:-0.06em;line-height:1;color:transparent;-webkit-text-stroke:2px rgba(207,255,4,0.35);user-select:none;position:relative;z-index:1;">?</span>
          </div>
        </div>
      </div>`,
  'Product → question mark'
);

// Notify restructure + sec-wipe
rep(
  `  <section id="notify" style="padding:160px 48px;text-align:center;">
    <div class="reveal">
      <p style="font-family:'Inter',sans-serif;font-weight:700;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:var(--lime);margin-bottom:24px;">Limited First Edition</p>
      <h2 class="notify-h">
        Don't miss<br><span class="line-lime">the drop</span>
      </h2>
      <p class="notify-p">
        Clip+Art drops June 20, 2026. First come, first gallery. Enter your email to be first in line.
      </p>
      <form class="notify-form" onsubmit="handleNotify(event)">
        <input type="email" class="notify-input" id="notifyEmail" placeholder="your@email.com" required>
        <button type="submit" class="notify-submit"><span>Notify Me</span></button>
      </form>
      <p class="notify-disclaimer">No spam. One email when we drop. That's it.</p>
    </div>

  </section>`,
  `  <section id="notify" class="sec-wipe" style="padding:140px 48px 120px;text-align:center;">
    <div class="reveal">
      <h2 class="be-heading">Be an<br><span class="be-lime">Asterisk</span></h2>
    </div>
    <div class="notify-divider"></div>
    <div class="reveal reveal-delay-1">
      <p class="drop-label-sm">Limited First Edition &middot; June 20, 2026</p>
      <p class="notify-p" style="margin-bottom:40px;">
        Clip+Art drops June 20. First come, first gallery.<br>Enter your email to be first in line.
      </p>
      <form class="notify-form" onsubmit="handleNotify(event)">
        <input type="email" class="notify-input" id="notifyEmail" placeholder="your@email.com" required>
        <button type="submit" class="notify-submit"><span>Notify Me</span></button>
      </form>
      <p class="notify-disclaimer">No spam. One email when we drop. That's it.</p>
    </div>
  </section>`,
  'Notify restructure'
);

// ══════════════════════════════════════════════════════════════════
// PASS 4 — JS additions
// ══════════════════════════════════════════════════════════════════
const bigJS = `

    // ══ HERO WAVE (Perlin noise + mouse) ═════════════════════════
    (function() {
      const _p = new Uint8Array(256);
      for (let i=0;i<256;i++) _p[i]=i;
      for (let i=255;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=_p[i];_p[i]=_p[j];_p[j]=t;}
      const P=new Uint8Array(512); for(let i=0;i<512;i++) P[i]=_p[i&255];
      function fade(t){return t*t*t*(t*(t*6-15)+10);}
      function lerp(t,a,b){return a+t*(b-a);}
      function grad(h,x,y){const u=(h&1)?x:y,v=(h&2)?x:y;return((h&1)?-u:u)+((h&2)?-v:v);}
      function noise(x,y){
        const X=Math.floor(x)&255,Y=Math.floor(y)&255;
        x-=Math.floor(x);y-=Math.floor(y);
        const u=fade(x),v=fade(y),a=P[X]+Y,b=P[X+1]+Y;
        return lerp(v,lerp(u,grad(P[a],x,y),grad(P[b],x-1,y)),lerp(u,grad(P[a+1],x,y-1),grad(P[b+1],x-1,y-1)));
      }

      const svg  = document.getElementById('hero-wave-svg');
      const hero = document.getElementById('hero');
      if (!svg || !hero) return;

      const mouse = {x:-999,y:-999,sx:-999,sy:-999};
      hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      });

      let paths=[], lines=[], W=0, H=0;
      function build() {
        W=hero.offsetWidth; H=hero.offsetHeight;
        svg.setAttribute('viewBox',\`0 0 \${W} \${H}\`);
        svg.innerHTML=''; paths=[]; lines=[];
        const xG=24, yG=20;
        const cols=Math.ceil((W+120)/xG)+1, rows=Math.ceil((H+40)/yG)+1;
        const xs=(W-xG*(cols-1))/2, ys=(H-yG*(rows-1))/2;
        for(let i=0;i<cols;i++){
          const pts=[];
          for(let j=0;j<rows;j++) pts.push({bx:xs+xG*i,by:ys+yG*j,cx:0,cy:0,cvx:0,cvy:0,_fx:0,_fy:0});
          const path=document.createElementNS('http://www.w3.org/2000/svg','path');
          path.setAttribute('fill','none'); path.setAttribute('stroke','#CFFF04');
          path.setAttribute('stroke-width','0.65'); path.style.opacity='0.18';
          svg.appendChild(path); paths.push(path); lines.push(pts);
        }
      }
      build(); window.addEventListener('resize', build);

      let t=0;
      function frame() {
        t+=0.007;
        mouse.sx+=(mouse.x-mouse.sx)*0.08; mouse.sy+=(mouse.y-mouse.sy)*0.08;
        lines.forEach((pts,li)=>{
          pts.forEach(p=>{
            const n=noise((p.bx+t*55)*0.0024,(p.by+t*28)*0.0017)*10;
            const wx=Math.cos(n)*16, wy=Math.sin(n)*8;
            const dx=p.bx-mouse.sx, dy=p.by-mouse.sy, d=Math.sqrt(dx*dx+dy*dy);
            if(d<200){const s=(1-d/200)*1.8;p.cvx+=(dx/d)*s*2.8;p.cvy+=(dy/d)*s*1.8;}
            p.cvx+=(0-p.cx)*0.09; p.cvy+=(0-p.cy)*0.09;
            p.cvx*=0.87; p.cvy*=0.87;
            p.cx+=p.cvx; p.cy+=p.cvy;
            p.cx=Math.max(-65,Math.min(65,p.cx)); p.cy=Math.max(-45,Math.min(45,p.cy));
            p._fx=p.bx+wx+p.cx; p._fy=p.by+wy+p.cy;
          });
          let d=\`M \${pts[0]._fx} \${pts[0]._fy}\`;
          for(let k=1;k<pts.length;k++) d+=\` L \${pts[k]._fx} \${pts[k]._fy}\`;
          paths[li].setAttribute('d',d);
        });
        requestAnimationFrame(frame);
      }
      frame();
    })();

    // ══ SECTION WIPE OBSERVERS ════════════════════════════════════
    (function() {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('wipe-in');obs.unobserve(e.target);} });
      }, {threshold: 0.06});
      document.querySelectorAll('.sec-wipe').forEach(el => obs.observe(el));
    })();

    // ══ PILLAR ANIMATED CANVASES ══════════════════════════════════
    (function() {
      function initInnovation(el) {
        const ctx=el.getContext('2d'); const S=el.width=el.height=120;
        const nodes=[{x:S/2,y:S/2,phase:0}];
        for(let i=0;i<6;i++) nodes.push({x:S/2+Math.cos(i*Math.PI/3)*38,y:S/2+Math.sin(i*Math.PI/3)*38,phase:i*0.9});
        let t=0;
        function f(){
          ctx.clearRect(0,0,S,S); t+=0.025;
          nodes.slice(1).forEach(n=>{
            ctx.strokeStyle=\`rgba(207,255,4,\${0.1+0.08*Math.sin(t+n.phase)})\`;
            ctx.lineWidth=0.8; ctx.beginPath(); ctx.moveTo(nodes[0].x,nodes[0].y); ctx.lineTo(n.x,n.y); ctx.stroke();
          });
          for(let i=1;i<nodes.length-1;i++){
            ctx.strokeStyle='rgba(207,255,4,0.05)'; ctx.lineWidth=0.6;
            ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[i+1].x,nodes[i+1].y); ctx.stroke();
          }
          nodes.forEach((n,i)=>{
            const pulse=1+0.3*Math.sin(t*1.3+n.phase);
            const r=(i===0?6:3.5)*pulse;
            ctx.beginPath(); ctx.arc(n.x,n.y,r,0,Math.PI*2);
            ctx.fillStyle=\`rgba(207,255,4,\${(0.5+0.3*Math.sin(t+n.phase))*(i===0?1:0.6)})\`; ctx.fill();
          });
          requestAnimationFrame(f);
        } f();
      }
      function initArt(el) {
        const ctx=el.getContext('2d'); const S=el.width=el.height=120;
        const cx=S/2,cy=S/2;
        const rings=[{r:32,sp:0.022,ph:0,c:[93,0,255]},{r:22,sp:-0.038,ph:1.2,c:[93,0,255]},{r:13,sp:0.058,ph:2.5,c:[93,0,255]}];
        let t=0;
        function f(){
          ctx.clearRect(0,0,S,S); t+=0.016;
          rings.forEach(ring=>{
            for(let i=0;i<7;i++){
              const a=(t*ring.sp*60+ring.ph)-i*0.2;
              const tx=cx+Math.cos(a)*ring.r, ty=cy+Math.sin(a)*ring.r;
              ctx.beginPath(); ctx.arc(tx,ty,2.4,0,Math.PI*2);
              ctx.fillStyle=\`rgba(\${ring.c.join(',')},\${(1-i/7)*0.3})\`; ctx.fill();
            }
            const ax=cx+Math.cos(t*ring.sp*60+ring.ph)*ring.r, ay=cy+Math.sin(t*ring.sp*60+ring.ph)*ring.r;
            ctx.beginPath(); ctx.arc(ax,ay,4,0,Math.PI*2);
            ctx.fillStyle=\`rgba(\${ring.c.join(',')},0.9)\`; ctx.fill();
          });
          ctx.beginPath(); ctx.arc(cx,cy,5.5,0,Math.PI*2);
          ctx.fillStyle='rgba(93,0,255,0.65)'; ctx.fill();
          requestAnimationFrame(f);
        } f();
      }
      function initSustainability(el) {
        const ctx=el.getContext('2d'); const S=el.width=el.height=120;
        const cx=S/2,cy=S/2,R=28;
        const parts=Array.from({length:12},(_,i)=>({off:i/12}));
        let t=0;
        function f(){
          ctx.clearRect(0,0,S,S); t+=0.008;
          ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
          ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=2; ctx.stroke();
          ctx.beginPath(); ctx.arc(cx,cy,R,-Math.PI/2+t,-Math.PI/2+t+Math.PI*1.5);
          ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=2; ctx.lineCap='round'; ctx.stroke();
          const ah=-Math.PI/2+t+Math.PI*1.5;
          const ax=cx+Math.cos(ah)*R, ay=cy+Math.sin(ah)*R;
          ctx.save(); ctx.translate(ax,ay); ctx.rotate(ah+Math.PI/2);
          ctx.beginPath(); ctx.moveTo(0,-5); ctx.lineTo(-4,3); ctx.lineTo(4,3); ctx.closePath();
          ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.fill(); ctx.restore();
          parts.forEach(p=>{
            const a=-Math.PI/2+(p.off+t*0.3)*Math.PI*2;
            const px=cx+Math.cos(a)*R, py=cy+Math.sin(a)*R;
            const alpha=0.12+0.18*Math.sin((p.off+t)*Math.PI*4);
            ctx.beginPath(); ctx.arc(px,py,1.5,0,Math.PI*2);
            ctx.fillStyle=\`rgba(255,255,255,\${alpha})\`; ctx.fill();
          });
          requestAnimationFrame(f);
        } f();
      }
      const c1=document.getElementById('pc1'),c2=document.getElementById('pc2'),c3=document.getElementById('pc3');
      if(c1) initInnovation(c1); if(c2) initArt(c2); if(c3) initSustainability(c3);
    })();
`;

const lastScript = c.lastIndexOf('  </script>');
if (lastScript !== -1) {
  c = c.slice(0, lastScript) + bigJS + '\n  </script>' + c.slice(lastScript + '  </script>'.length);
  console.log('✓ JS added');
}

writeFileSync('c:/Users/prana/ASTERISK/ASTWEB.html', c, 'utf-8');
console.log('\nDone. Bytes:', c.length.toLocaleString());
