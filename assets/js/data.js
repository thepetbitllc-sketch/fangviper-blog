/* ==========================================================
   FANG VIPER — blog content
   Add a post: copy the object below, give it a unique slug, fill the fields, then run
   tools\build-pages.ps1 so it gets its own page at /<slug>/.
     title       the on-page H1 (use once)
     seoTitle    the browser tab / Google result title (keep under ~60 characters)
     excerpt     the meta description; also shown on cards and under the H1
     keywords    main keyword first, then supporting keywords
     category    one of FV_CATEGORIES below
     cover       type "photo" (src + alt) or type "pattern" (bars, horizon, halftone,
                 waves, grid, contour, ripple); word = big outlined word on the cover
     adMatch     product id from ads.js to feature inside the article
     body        article HTML: <h2> sections, <h3> steps, <ul>, <blockquote>, <mark>,
                 table.compare, div.versus, figure.drive-chart, div.faq with <details>
   ========================================================== */
window.FV_POSTS = [
  {
    slug: "discipline-vs-motivation",
    title: "Discipline vs Motivation: Why Motivation Fades and What Actually Keeps You Going",
    seoTitle: "Discipline vs Motivation: What Actually Keeps You Going",
    category: "Mindset",
    date: "2026-09-25",
    excerpt: "Motivation gets you started, but it never lasts. Learn why discipline beats motivation and how to build it, whether you're growing a business, training, or chasing any goal.",
    keywords: ["discipline vs motivation", "how to stay disciplined", "motivation fades", "how to keep going", "self discipline tips"],
    cover: { type: "photo", src: "assets/img/run-solo.jpg", alt: "discipline vs motivation", word: "ENGINE" },
    adMatch: "mug",
    body: `
<p>Everyone has felt it. You watch a video, hear a story, or hit a breaking point, and suddenly you're ready. Tomorrow you start the business. You finish the house. You run every morning. You study every night.</p>
<p>Then three days pass, and the fire is gone.</p>
<p>That isn't a character flaw. It's how motivation works. Once you understand the difference between motivation and discipline, you stop waiting to feel ready and start moving anyway.</p>

<h2>What Motivation Really Is</h2>
<p>Motivation is a feeling. It's the spark that makes a goal feel exciting and possible. It's real and useful, but like every feeling, it rises and falls.</p>
<div class="split-list">
  <div>
    <p class="list-label">Motivation is high when:</p>
    <ul>
      <li>The goal is new</li>
      <li>You just saw someone else succeed</li>
      <li>You're angry, inspired, or tired of where you are</li>
    </ul>
  </div>
  <div>
    <p class="list-label">Motivation drops when:</p>
    <ul>
      <li>The work gets repetitive</li>
      <li>Results are slow</li>
      <li>Nobody is clapping for you</li>
    </ul>
  </div>
</div>
<p>That's the problem. The hardest part of any goal is the long, quiet middle, and that's exactly when motivation is at its lowest.</p>
<figure class="drive-chart">
  <svg viewBox="0 0 640 300" role="img" aria-labelledby="drive-chart-title">
    <title id="drive-chart-title">Illustration: motivation spikes at the start and fades through the middle, while discipline keeps climbing</title>
    <rect class="zone" x="220" y="24" width="240" height="226"/>
    <text class="zone-label" x="340" y="46" text-anchor="middle">The quiet middle</text>
    <line class="axis" x1="40" y1="250" x2="620" y2="250"/>
    <path class="line line--motivation" pathLength="1" d="M40 236 C 70 110, 105 96, 140 140 S 220 222, 300 228 S 420 234, 480 226 S 560 206, 620 212"/>
    <path class="line line--discipline" pathLength="1" d="M40 240 C 200 228, 360 170, 620 64"/>
    <g class="legend">
      <line x1="44" y1="30" x2="72" y2="30" class="key key--motivation"/><text x="80" y="34">Motivation</text>
      <line x1="44" y1="52" x2="72" y2="52" class="key key--discipline"/><text x="80" y="56">Discipline</text>
    </g>
    <text class="tick" x="40" y="276">Start</text>
    <text class="tick" x="620" y="276" text-anchor="end">Finish</text>
  </svg>
  <figcaption>Illustration: motivation spikes and fades. Discipline keeps climbing.</figcaption>
</figure>

<h2>What Discipline Really Is</h2>
<p>Discipline is doing the work whether you feel like it or not. It isn't a feeling. It's a decision you've already made before the day starts.</p>
<div class="versus">
  <div class="versus__card"><span class="versus__who">A motivated person asks</span><p>"Do I feel like doing this today?"</p></div>
  <div class="versus__card versus__card--strong"><span class="versus__who">A disciplined person asks</span><p>"What time am I doing this today?"</p></div>
</div>
<p><mark>Discipline doesn't care about your mood. That's why it works.</mark></p>

<h2>Discipline vs Motivation: The Real Difference</h2>
<div class="table-wrap">
  <table class="compare">
    <thead><tr><th scope="col">Motivation</th><th scope="col">Discipline</th></tr></thead>
    <tbody>
      <tr><td>A feeling</td><td>A decision</td></tr>
      <tr><td>Starts the journey</td><td>Finishes the journey</td></tr>
      <tr><td>Depends on mood</td><td>Depends on commitment</td></tr>
      <tr><td>Loud and exciting</td><td>Quiet and boring</td></tr>
      <tr><td>Comes and goes</td><td>Gets stronger with use</td></tr>
    </tbody>
  </table>
</div>
<p>You don't have to choose one. <mark>Use motivation to start, and build discipline to finish.</mark></p>

<h2>Why This Matters for Any Goal</h2>
<p>This isn't only about the gym. The same pattern shows up everywhere:</p>
<ul>
  <li><strong>The entrepreneur</strong> is excited for launch week. Month four, with slow sales, is where most people quit.</li>
  <li><strong>The person building a house</strong> loves laying the foundation. Years of saving for the roof, windows, and finishing is where the dream stalls.</li>
  <li><strong>The runner</strong> feels great after the first 5K. The early, cold mornings in week six are the real test.</li>
  <li><strong>The student</strong> plans to study every night. By mid-semester, the plan is forgotten.</li>
</ul>
<p>Different goals, same enemy: the gap between the excitement of starting and the reality of continuing.</p>

<h2>How to Build Discipline (When Motivation Is Gone)</h2>
<h3><span class="step-n">1</span> Make the task smaller than your excuse</h3>
<p>If "work on the business" feels heavy, make it "send one email." If "go for a run" feels impossible, make it "put on my shoes and walk outside." Small actions beat big intentions, and starting usually carries you further than you planned.</p>
<h3><span class="step-n">2</span> Decide before the day begins</h3>
<p>Pick the exact time and place the night before. When the decision is already made, you don't give your mood a vote.</p>
<h3><span class="step-n">3</span> Track your streak</h3>
<p>Mark every day you show up. After a week, you won't want to break the chain. Proof that you're consistent becomes its own reason to keep going.</p>
<h3><span class="step-n">4</span> Stop negotiating with yourself</h3>
<p>"Maybe later" is how most goals die. Treat your commitment like a job you can't skip. You don't debate whether to show up. You just show up.</p>
<h3><span class="step-n">5</span> Surround yourself with reminders</h3>
<p>What you see every day shapes what you think every day. A written goal on your wall, a phone lock screen, a phrase on the cup you drink from every morning. Small reminders keep your why in front of you when motivation is quiet.</p>
<h3><span class="step-n">6</span> Expect the boring middle</h3>
<p>When the work stops feeling exciting, that doesn't mean you're on the wrong path. It means you've reached the part most people never survive. <mark>Boredom is a checkpoint, not a stop sign.</mark></p>

<h2>Motivation Is the Spark. Discipline Is the Engine.</h2>
<p>You'll never feel motivated every day, and nobody does. The people who finish houses, build businesses, set personal records, and change their lives aren't more motivated than you. They just stopped relying on motivation.</p>
<blockquote>Start when you feel it. Keep going when you don't.</blockquote>
<p class="cta-line">Want a daily reminder? <a class="text-cta" href="https://fangviper.com/collections/all?utm_source=fangviper_blog&amp;utm_medium=article_cta&amp;utm_campaign=blog_ads" target="_blank" rel="noopener">Explore the FangViper collection</a>, with t-shirts, cups, and bags made for people who keep going when the motivation runs out.</p>

<h2>Frequently Asked Questions</h2>
<div class="faq">
  <details class="faq__item">
    <summary>Is discipline more important than motivation?</summary>
    <p>For long-term goals, yes. Motivation helps you start, but discipline keeps you consistent when the excitement fades, and consistency is what produces results.</p>
  </details>
  <details class="faq__item">
    <summary>How do I stay disciplined when I have no motivation?</summary>
    <p>Shrink the task, schedule it in advance, track your streak, and stop debating with yourself. Action often creates motivation, not the other way around.</p>
  </details>
  <details class="faq__item">
    <summary>Can discipline be learned?</summary>
    <p>Yes. Discipline works like a muscle: every time you follow through on a small commitment, it gets easier to follow through on the next one.</p>
  </details>
  <details class="faq__item">
    <summary>Why does my motivation disappear after a few days?</summary>
    <p>Motivation is an emotion tied to novelty. Once a goal becomes routine, the excitement naturally drops. That's normal, and it's the point where discipline has to take over.</p>
  </details>
</div>
`
  }
];

// Categories shown as filters. A category only appears on the site once a post uses it.
window.FV_CATEGORIES = ["All", "Mindset", "Money", "Fitness", "Goals"];

window.FV_QUOTES = [
  "Start when you feel it. Keep going when you don't.",
  "Motivation is the spark. Discipline is the engine.",
  "Wealth is built on boring days.",
  "The weight doesn't care how you feel. Lift it anyway.",
  "Quiet work. Loud results.",
  "Your excuses cost more than your effort.",
  "Nobody is coming. Get up.",
  "Build it while they sleep.",
  "Discipline is remembering what you want.",
  "Be the hardest worker in any room you enter."
];
