const path = require('path');
const PptxGenJS = require('pptxgenjs');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
pptx.author = 'CISC 878 Team';
pptx.company = 'Queen\'s University';
pptx.subject = 'Schnorr Zero-Knowledge Authentication';
pptx.title = 'CISC 878 Project Presentation';
pptx.lang = 'en-CA';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'en-CA',
};

const assets = {
  benchmarkChart: path.resolve(__dirname, 'assets/benchmark_chart.png'),
  pytestOutput: path.resolve(__dirname, 'assets/pytest_output.png'),
  benchmarkOutput: path.resolve(__dirname, 'assets/benchmark_output.png'),
};

function warnIfSlideHasOverlaps() {}
function warnIfSlideElementsOutOfBounds() {}

function addHeader(slide, title, subtitle = '') {
  slide.background = { color: 'F8FAFC' };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.9,
    fill: { color: '0F172A' },
    line: { color: '0F172A' },
  });
  slide.addText(title, {
    x: 0.45,
    y: 0.2,
    w: 9.5,
    h: 0.45,
    fontFace: 'Aptos Display',
    fontSize: 22,
    color: 'F8FAFC',
    bold: true,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.45,
      y: 0.6,
      w: 11.8,
      h: 0.2,
      fontFace: 'Aptos',
      fontSize: 11,
      color: 'CBD5E1',
    });
  }
}

function addFooter(slide, text = 'CISC 878 | March 25, 2026') {
  slide.addText(text, {
    x: 0.45,
    y: 7.1,
    w: 12,
    h: 0.2,
    fontFace: 'Aptos',
    fontSize: 9,
    color: '64748B',
    align: 'right',
  });
}

// Slide 1: Title
{
  const slide = pptx.addSlide();
  slide.background = { color: '020617' };
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.55,
    y: 0.6,
    w: 12.2,
    h: 6.2,
    rectRadius: 0.08,
    fill: { color: '0F172A' },
    line: { color: '1E293B', pt: 1.2 },
  });
  slide.addText('Schnorr Zero-Knowledge Authentication', {
    x: 1.0,
    y: 1.5,
    w: 11.2,
    h: 0.9,
    fontFace: 'Aptos Display',
    fontSize: 38,
    color: 'E2E8F0',
    bold: true,
    align: 'center',
  });
  slide.addText('CISC 878 Project | 5-minute Progress Presentation', {
    x: 1.0,
    y: 2.5,
    w: 11.2,
    h: 0.5,
    fontFace: 'Aptos',
    fontSize: 18,
    color: '93C5FD',
    align: 'center',
  });
  slide.addText('Goal: passwordless login with proof of key ownership, without revealing secret key', {
    x: 1.25,
    y: 3.5,
    w: 10.8,
    h: 0.8,
    fontFace: 'Aptos',
    fontSize: 16,
    color: 'CBD5E1',
    align: 'center',
    valign: 'mid',
  });
  slide.addText('Presenter: Team Project878', {
    x: 1.0,
    y: 5.8,
    w: 11.2,
    h: 0.35,
    fontFace: 'Aptos',
    fontSize: 13,
    color: '94A3B8',
    align: 'center',
  });
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

// Slide 2: Project goal
{
  const slide = pptx.addSlide();
  addHeader(slide, '1. Project Goal and Motivation', 'Why Schnorr-based authentication?');

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7, y: 1.25, w: 5.9, h: 5.4,
    fill: { color: 'E0F2FE' }, line: { color: '7DD3FC', pt: 1 }, rectRadius: 0.06,
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.8, y: 1.25, w: 5.85, h: 5.4,
    fill: { color: 'FFF7ED' }, line: { color: 'FDBA74', pt: 1 }, rectRadius: 0.06,
  });

  slide.addText('Problem We Address', {
    x: 1.0, y: 1.55, w: 5.2, h: 0.35, fontFace: 'Aptos Display', fontSize: 20, color: '0C4A6E', bold: true,
  });
  slide.addText([
    { text: 'Traditional password login has leakage and replay risks.' , options: { bullet: { indent: 12 } }},
    { text: 'Need authentication that proves identity without exposing secret.' , options: { bullet: { indent: 12 } }},
    { text: 'Need a practical protocol that can be integrated into apps.' , options: { bullet: { indent: 12 } }},
  ], {
    x: 1.0, y: 2.0, w: 5.2, h: 2.4, fontFace: 'Aptos', fontSize: 14, color: '0F172A', breakLine: false,
  });

  slide.addText('Project Objectives', {
    x: 7.1, y: 1.55, w: 5.2, h: 0.35, fontFace: 'Aptos Display', fontSize: 20, color: '9A3412', bold: true,
  });
  slide.addText([
    { text: 'Implement interactive Schnorr identification end-to-end.', options: { bullet: { indent: 12 } } },
    { text: 'Implement Fiat-Shamir variant for non-interactive proof.', options: { bullet: { indent: 12 } } },
    { text: 'Compare runtime, communication cost, and round trips.', options: { bullet: { indent: 12 } } },
    { text: 'Validate correctness + replay resistance via tests.', options: { bullet: { indent: 12 } } },
  ], {
    x: 7.1, y: 2.0, w: 5.2, h: 2.8, fontFace: 'Aptos', fontSize: 14, color: '0F172A', breakLine: false,
  });

  slide.addText('Key message: security property + measurable performance tradeoff', {
    x: 1.0, y: 5.8, w: 11.3, h: 0.45, fontFace: 'Aptos', fontSize: 14, bold: true, color: '334155', align: 'center',
  });
  addFooter(slide);
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

// Slide 3: High-level workflow
{
  const slide = pptx.addSlide();
  addHeader(slide, '2. How It Works (High Level)', 'Interactive vs Fiat-Shamir login flow');

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7, y: 1.2, w: 12.0, h: 1.0,
    fill: { color: 'DBEAFE' }, line: { color: '93C5FD', pt: 1 }, rectRadius: 0.05,
  });
  slide.addText('Registration: client generates (x, y=g^x mod p), sends only public key y to server', {
    x: 1.0, y: 1.5, w: 11.4, h: 0.35, fontFace: 'Aptos', fontSize: 14, color: '1E3A8A', align: 'center',
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7, y: 2.45, w: 5.85, h: 3.95,
    fill: { color: 'ECFEFF' }, line: { color: '67E8F9', pt: 1 }, rectRadius: 0.05,
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.85, y: 2.45, w: 5.85, h: 3.95,
    fill: { color: 'FEF3C7' }, line: { color: 'FCD34D', pt: 1 }, rectRadius: 0.05,
  });

  slide.addText('Interactive Schnorr (2 round trips)', {
    x: 1.0, y: 2.75, w: 5.2, h: 0.3, fontFace: 'Aptos Display', fontSize: 16, color: '0E7490', bold: true,
  });
  slide.addText([
    { text: '1) Client -> Server: commitment t = g^r', options: { bullet: { indent: 12 } } },
    { text: '2) Server -> Client: random challenge c', options: { bullet: { indent: 12 } } },
    { text: '3) Client -> Server: s = r + c*x (mod q)', options: { bullet: { indent: 12 } } },
    { text: '4) Server checks g^s = t * y^c', options: { bullet: { indent: 12 } } },
  ], {
    x: 1.0, y: 3.15, w: 5.2, h: 2.4, fontFace: 'Aptos', fontSize: 13, color: '0F172A', breakLine: false,
  });

  slide.addText('Fiat-Shamir Variant (1 round trip)', {
    x: 7.15, y: 2.75, w: 5.2, h: 0.3, fontFace: 'Aptos Display', fontSize: 16, color: '92400E', bold: true,
  });
  slide.addText([
    { text: '1) Server sends one-time login_nonce', options: { bullet: { indent: 12 } } },
    { text: '2) Client computes c = H(user, nonce, y, t)', options: { bullet: { indent: 12 } } },
    { text: '3) Client sends proof (t, c, s, nonce)', options: { bullet: { indent: 12 } } },
    { text: '4) Server recomputes c and verifies equation', options: { bullet: { indent: 12 } } },
  ], {
    x: 7.15, y: 3.15, w: 5.2, h: 2.4, fontFace: 'Aptos', fontSize: 13, color: '0F172A', breakLine: false,
  });

  addFooter(slide);
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

// Slide 4: Implementation highlights
{
  const slide = pptx.addSlide();
  addHeader(slide, '3. Implementation Snapshot', 'Code structure and security checks');

  slide.addText('Core modules', {
    x: 0.9, y: 1.25, w: 2.8, h: 0.4, fontFace: 'Aptos Display', fontSize: 18, bold: true, color: '1E293B',
  });

  const modules = [
    ['src/zk_auth/schnorr.py', 'Protocol primitives and Fiat-Shamir challenge derivation'],
    ['src/zk_auth/app.py', 'Registration and two login workflows + session token issue'],
    ['tests/test_auth.py', 'Correctness, forgery rejection, replay defense, subgroup checks'],
    ['benchmark.py', 'Runtime + communication cost benchmark and CSV export'],
  ];

  let y = 1.75;
  for (const [name, desc] of modules) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.9, y, w: 12.0, h: 1.05,
      fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', pt: 1 }, rectRadius: 0.03,
      shadow: { type: 'outer', color: 'E2E8F0', blur: 2, angle: 90, distance: 1, opacity: 0.3 },
    });
    slide.addText(name, {
      x: 1.15, y: y + 0.18, w: 5.5, h: 0.25, fontFace: 'Consolas', fontSize: 12, bold: true, color: '1D4ED8',
    });
    slide.addText(desc, {
      x: 1.15, y: y + 0.48, w: 11.2, h: 0.35, fontFace: 'Aptos', fontSize: 13, color: '334155',
    });
    y += 1.2;
  }

  slide.addText('Security hardening: subgroup validation + one-time session/nonce consumption', {
    x: 0.95, y: 6.65, w: 12.0, h: 0.3, fontFace: 'Aptos', fontSize: 12, color: '7C2D12', bold: true, align: 'center',
  });

  addFooter(slide);
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

// Slide 5: Results and test screenshots
{
  const slide = pptx.addSlide();
  addHeader(slide, '4. Current Results', 'Latest local run on March 25, 2026');

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.6, y: 1.15, w: 8.4, h: 3.55,
    fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', pt: 1 }, rectRadius: 0.05,
  });
  slide.addText('Benchmark (200 trials/mode)', {
    x: 0.85, y: 1.35, w: 7.8, h: 0.3, fontFace: 'Aptos Display', fontSize: 16, bold: true, color: '0F172A',
  });
  slide.addImage({
    path: assets.benchmarkChart,
    x: 0.85, y: 1.7, w: 7.9, h: 2.8,
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 9.2, y: 1.15, w: 3.55, h: 3.55,
    fill: { color: 'ECFDF5' }, line: { color: '86EFAC', pt: 1 }, rectRadius: 0.05,
  });
  slide.addText('Key observations', {
    x: 9.45, y: 1.35, w: 3.1, h: 0.3, fontFace: 'Aptos Display', fontSize: 14, bold: true, color: '14532D',
  });
  slide.addText([
    { text: 'Fiat-Shamir is faster (0.1386ms vs 0.2051ms).', options: { bullet: { indent: 10 } } },
    { text: 'Lower communication (300.88B vs 328.13B).', options: { bullet: { indent: 10 } } },
    { text: 'Round trips drop from 2 to 1.', options: { bullet: { indent: 10 } } },
  ], {
    x: 9.45, y: 1.75, w: 3.1, h: 2.35, fontFace: 'Aptos', fontSize: 12.5, color: '14532D', breakLine: false,
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.6, y: 4.95, w: 6.2, h: 2.0,
    fill: { color: '0F172A' }, line: { color: '1E293B', pt: 1 }, rectRadius: 0.04,
  });
  slide.addText('Code test result screenshot (pytest)', {
    x: 0.85, y: 5.13, w: 5.8, h: 0.2, fontFace: 'Aptos', fontSize: 10, color: '94A3B8',
  });
  slide.addImage({ path: assets.pytestOutput, x: 0.85, y: 5.35, w: 5.7, h: 1.45 });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.95, y: 4.95, w: 5.8, h: 2.0,
    fill: { color: '0F172A' }, line: { color: '1E293B', pt: 1 }, rectRadius: 0.04,
  });
  slide.addText('Benchmark terminal screenshot', {
    x: 7.2, y: 5.13, w: 5.3, h: 0.2, fontFace: 'Aptos', fontSize: 10, color: '94A3B8',
  });
  slide.addImage({ path: assets.benchmarkOutput, x: 7.2, y: 5.35, w: 5.3, h: 1.45 });

  addFooter(slide);
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

// Slide 6: Conclusion
{
  const slide = pptx.addSlide();
  addHeader(slide, '5. Takeaways and Next Steps', 'Current progress and what we can improve next');

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.85, y: 1.4, w: 12.0, h: 2.2,
    fill: { color: 'EFF6FF' }, line: { color: '93C5FD', pt: 1 }, rectRadius: 0.06,
  });
  slide.addText('Takeaways', {
    x: 1.15, y: 1.7, w: 3.5, h: 0.4, fontFace: 'Aptos Display', fontSize: 20, bold: true, color: '1E3A8A',
  });
  slide.addText([
    { text: 'We built a complete, runnable Schnorr-based passwordless authentication demo.', options: { bullet: { indent: 12 } } },
    { text: 'Both protocol correctness and key security properties are validated by tests.', options: { bullet: { indent: 12 } } },
    { text: 'Fiat-Shamir shows better communication/runtime behavior in current local benchmark.', options: { bullet: { indent: 12 } } },
  ], {
    x: 1.15, y: 2.15, w: 11.2, h: 1.2, fontFace: 'Aptos', fontSize: 13.5, color: '1E293B', breakLine: false,
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.85, y: 3.95, w: 12.0, h: 2.3,
    fill: { color: 'FFF7ED' }, line: { color: 'FDBA74', pt: 1 }, rectRadius: 0.06,
  });
  slide.addText('Next steps (future work)', {
    x: 1.15, y: 4.25, w: 4.8, h: 0.4, fontFace: 'Aptos Display', fontSize: 20, bold: true, color: '9A3412',
  });
  slide.addText([
    { text: 'Integrate with HTTP API and persistent storage.', options: { bullet: { indent: 12 } } },
    { text: 'Evaluate under simulated network delay and larger parameters.', options: { bullet: { indent: 12 } } },
    { text: 'Add production-style protections (TLS, rate limits, lockout policy).', options: { bullet: { indent: 12 } } },
  ], {
    x: 1.15, y: 4.7, w: 11.2, h: 1.15, fontFace: 'Aptos', fontSize: 13.5, color: '1E293B', breakLine: false,
  });

  slide.addText('Thank you - Questions?', {
    x: 0.85, y: 6.55, w: 12.0, h: 0.5,
    fontFace: 'Aptos Display', fontSize: 24, bold: true, color: '0F172A', align: 'center',
  });

  addFooter(slide);
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

pptx.writeFile({ fileName: path.resolve(__dirname, 'CISC878_Project878_5min_Presentation.pptx') });
