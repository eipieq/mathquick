import NavBar from "./NavBar";
import { ArrowSquareOut } from "@phosphor-icons/react";

const SECTIONS = [
  { id: "problem", label: "the problem" },
  { id: "approach", label: "our approach" },
  { id: "fsrs", label: "fsrs algorithm" },
  { id: "llm", label: "llm generation" },
  { id: "question-pipeline", label: "question pipeline" },
  { id: "what-broke", label: "what broke" },
  { id: "learner-model", label: "learner model" },
  { id: "algorithm", label: "adaptive algorithm" },
  { id: "stack", label: "tech stack" },
  { id: "references", label: "references" },
];

function Section({ id, title, children }) {
  return (
    <section id={id} style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Callout({ children, type = "info" }) {
  const colors = {
    info:    { bg: "var(--accent-subtle)", border: "var(--accent)", text: "var(--accent)" },
    success: { bg: "var(--success-subtle)", border: "var(--success)", text: "var(--success)" },
    warn:    { bg: "#FFF8EC", border: "#E6A817", text: "#B8810E" },
  };
  const c = colors[type];
  return (
    <div style={{ ...styles.callout, background: c.bg, borderLeftColor: c.border }}>
      {children}
    </div>
  );
}

function CodeBlock({ children }) {
  return <pre style={styles.code}><code>{children}</code></pre>;
}

function Cite({ num, href, children }) {
  return (
    <sup>
      <a href={href} target="_blank" rel="noopener noreferrer" style={styles.citeLink}>
        [{num}]
      </a>
    </sup>
  );
}

export default function ResearchScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <NavBar />

      <div style={styles.layout}>
        {/* sidebar */}
        <aside style={styles.sidebar} className="research-sidebar">
          <p style={styles.sidebarLabel}>on this page</p>
          <nav>
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} style={styles.sidebarLink}>
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* main content */}
        <div style={styles.main}>
          {/* hero */}
          <div style={styles.hero}>
            <p style={styles.badge}>research</p>
            <h1 style={styles.title}>adaptive learning in MathQuick</h1>
            <p style={styles.subtitle}>
              why static question banks don't work, what broke when we tried pure LLM generation, and how we ended up combining FSRS, a pre-built question bank, and Venice AI to build a math trainer that actually adapts.
            </p>
            <div style={styles.metaRow}>
              <span style={styles.metaTag}>edu-tech</span>
              <span style={styles.metaTag}>adaptive learning</span>
              <span style={styles.metaTag}>FSRS</span>
              <span style={styles.metaTag}>LLM generation</span>
              <span style={styles.metaTag}>knowledge tracing</span>
            </div>
          </div>

          <div style={styles.divider} />

          {/* 1. the problem */}
          <Section id="problem" title="the problem with static questions">
            <p style={styles.body}>
              most math drill apps pull from a fixed question bank. same problems, same difficulty, no memory. ace multiplication today, come back tomorrow, it starts from scratch. that's pretty obviously broken.
            </p>
            <p style={styles.body}>
              it creates two failure modes. learners who've already mastered a skill get bored. learners who aren't ready yet get discouraged. neither group is learning anything.
            </p>
            <Callout type="info">
              the cognitive science here is settled. learning is fastest in the <strong>zone of proximal development</strong> — problems just hard enough that you succeed roughly 70–85% of the time.
              <Cite num={1} href="https://en.wikipedia.org/wiki/Zone_of_proximal_development" /> too easy and nothing sticks. too hard and you disengage.
            </Callout>
            <p style={styles.body}>
              a static bank can't hit that zone for every learner. the only fix is a system that actually tracks what you know and adapts from there.
            </p>
          </Section>

          <div style={styles.divider} />

          {/* 2. our approach */}
          <Section id="approach" title="our hybrid approach">
            <p style={styles.body}>
              we combine two things that haven't been put together this way before:
            </p>
            <div style={styles.approachGrid}>
              <div style={styles.approachCard}>
                <p style={styles.approachCardTitle}>FSRS v6</p>
                <p style={styles.approachCardSub}>answers: <em>when</em> should each skill be revisited?</p>
              </div>
              <div style={styles.approachPlus}>+</div>
              <div style={styles.approachCard}>
                <p style={styles.approachCardTitle}>Claude API</p>
                <p style={styles.approachCardSub}>answers: <em>what</em> should the question look like?</p>
              </div>
            </div>
            <p style={styles.body}>
              FSRS decides which skill to drill and at what difficulty. Claude writes the actual question, fresh every time. the learner model sits in between, feeding performance data into FSRS and difficulty context into Claude.
            </p>
            <Callout type="success">
              the result: questions that <strong>never repeat</strong>, are always <strong>near your ZPD</strong>, and read like real scenarios instead of template strings.
            </Callout>
          </Section>

          <div style={styles.divider} />

          {/* 3. fsrs */}
          <Section id="fsrs" title="FSRS — free spaced repetition scheduler">
            <p style={styles.body}>
              FSRS is basically the most important thing to happen to spaced repetition since SM-2 in 1987. it's now the default algorithm in Anki, and v6 dropped in 2024.
              <Cite num={2} href="https://github.com/open-spaced-repetition/fsrs4anki" />
            </p>
            <p style={styles.body}>
              SM-2 uses fixed exponential intervals. FSRS actually models memory, using three variables from Ebbinghaus and Bjork's research:
            </p>
            <div style={styles.varGrid}>
              {[
                { letter: "D", name: "difficulty", desc: "how inherently hard this item is for this specific learner, 1–10" },
                { letter: "S", name: "stability", desc: "how long the memory will last before retrievability drops to 90%" },
                { letter: "R", name: "retrievability", desc: "probability of correct recall right now, 0–1" },
              ].map(v => (
                <div key={v.letter} style={styles.varCard}>
                  <div style={styles.varLetter}>{v.letter}</div>
                  <div>
                    <p style={styles.varName}>{v.name}</p>
                    <p style={styles.varDesc}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p style={styles.body}>
              after each response, FSRS updates D and S using 17 trainable parameters (optimized on 20,000+ real learner datasets) and schedules the next review for when R ≈ 0.9. that's the optimal retention target — review right before you'd forget, not before.
            </p>
            <p style={styles.body}>
              in MathQuick, each skill-level pair (e.g. <code style={styles.inlineCode}>mul:level3</code>) is an FSRS card. the selector asks FSRS which card is most overdue and goes from there.
            </p>
            <Callout type="info">
              FSRS v6 outperforms SM-2 by <strong>81% in retention prediction accuracy</strong>.
              <Cite num={3} href="https://github.com/open-spaced-repetition/fsrs.js" /> we use <code style={styles.inlineCode}>ts-fsrs</code> — ES module compatible, ~8kb gzipped.
              <Cite num={4} href="https://github.com/open-spaced-repetition/ts-fsrs" />
            </Callout>
          </Section>

          <div style={styles.divider} />

          {/* 4. LLM */}
          <Section id="llm" title="LLM-based question generation">
            <p style={styles.body}>
              the standard approach is parametric templates: <code style={styles.inlineCode}>"what is {`{a}`} × {`{b}`}?"</code> with numbers drawn from a level-appropriate range. it works, but learners notice the pattern fast and start gaming it.
            </p>
            <p style={styles.body}>
              we use Claude instead. given the learner's current state, we send a structured prompt:
            </p>
            <CodeBlock>{`{
  skill: "mul",
  level: 3,              // 2-digit × 1-digit, some carrying
  mode: "situational",   // real-life word problem
  recentErrors: ["×7", "×8"],  // where the learner struggled
  timerSeconds: 25       // difficulty pressure
}`}</CodeBlock>
            <p style={styles.body}>
              Claude returns a fresh question every time. coffee shop scenario, sports score, grocery math. the learner's weak spots get embedded naturally in the narrative, not bolted on.
            </p>
            <p style={styles.body}>
              2025 research confirms LLMs are genuinely viable math tutors at K–12 level when prompt-moderated with structured difficulty constraints.
              <Cite num={5} href="https://aclanthology.org/2025.findings-emnlp.605.pdf" /> the key finding: without scaffolding, LLMs drift to whatever difficulty feels natural to them. our learner model is that scaffolding.
            </p>
            <Callout type="warn">
              LLM generation adds ~500ms–1.5s latency. we pre-generate the next question while the learner reads feedback on the current one, so it's invisible.
            </Callout>
          </Section>

          <div style={styles.divider} />

          {/* 5. learner model */}
          <Section id="learner-model" title="learner model">
            <p style={styles.body}>
              the learner model lives in <code style={styles.inlineCode}>localStorage</code>. no account, no server, no privacy surface. it's a small JSON object that updates after every question.
            </p>
            <p style={styles.body}>
              we track 6 skill dimensions, each leveled 1–5 independently:
            </p>
            <div style={styles.skillTable}>
              {[
                { key: "add", name: "addition", desc: "single digit → cross-hundreds carrying" },
                { key: "sub", name: "subtraction", desc: "single digit → multi-borrow" },
                { key: "mul", name: "multiplication", desc: "×2/5/10 tables → double-digit" },
                { key: "div", name: "division", desc: "÷ simple → mixed large dividends" },
                { key: "pct", name: "percentages", desc: "50% of round numbers → arbitrary %" },
                { key: "chain", name: "chained ops", desc: "two-step problems, hold intermediate" },
              ].map(s => (
                <div key={s.key} style={styles.skillRow}>
                  <code style={{ ...styles.inlineCode, flexShrink: 0 }}>{s.key}</code>
                  <span style={styles.skillName}>{s.name}</span>
                  <span style={styles.skillDesc}>{s.desc}</span>
                </div>
              ))}
            </div>
            <p style={styles.body}>
              per skill, we store:
            </p>
            <CodeBlock>{`{
  level: 2,                    // current difficulty level, 1–5
  recentWindow: [1,1,0,1,1],  // last 5 outcomes (1=correct, 0=wrong/timeout)
  attempts: 14,
  correct: 11,
  lastSeenAt: "2026-04-29T...",
  fsrsCard: { ... }            // FSRS state: difficulty, stability, due date
}`}</CodeBlock>
            <p style={styles.body}>
              the <strong>rolling window of 5</strong> is the most important signal. lifetime accuracy is basically useless for adaptation — a learner who struggled early but improved recently looks mediocre on a lifetime rate. the window tells you where they are now.
            </p>
            <p style={styles.body}>
              skills unlock progressively so beginners aren't overwhelmed on day one:
            </p>
            <div style={styles.unlockList}>
              {[
                { condition: "on start", skills: "add, sub" },
                { condition: "add ≥ level 2", skills: "mul unlocks" },
                { condition: "mul ≥ level 2", skills: "div unlocks" },
                { condition: "div ≥ level 2", skills: "pct unlocks" },
                { condition: "mul ≥ level 3 + add ≥ level 3", skills: "chain unlocks" },
              ].map(u => (
                <div key={u.condition} style={styles.unlockRow}>
                  <span style={styles.unlockCondition}>{u.condition}</span>
                  <span style={styles.unlockArrow}>→</span>
                  <span style={styles.unlockSkill}>{u.skills}</span>
                </div>
              ))}
            </div>
          </Section>

          <div style={styles.divider} />

          {/* 6. algorithm */}
          <Section id="algorithm" title="adaptive selection algorithm">
            <p style={styles.body}>
              every question selection runs three checks:
            </p>

            <div style={styles.forceList}>
              <div style={styles.forceItem}>
                <div style={styles.forceNum}>1</div>
                <div>
                  <p style={styles.forceName}>FSRS scheduling — when</p>
                  <p style={styles.forceDesc}>
                    each skill-level pair has an FSRS due date. the selector asks: which skill is most overdue? this is the core spaced repetition insight — review right before you'd forget, not on a fixed schedule.
                  </p>
                </div>
              </div>
              <div style={styles.forceItem}>
                <div style={styles.forceNum}>2</div>
                <div>
                  <p style={styles.forceName}>ZPD targeting — what level</p>
                  <p style={styles.forceDesc}>
                    within the selected skill, level is chosen from <code style={styles.inlineCode}>recentWindow</code> accuracy. below 60%: drop a level. above 85% for 5 consecutive: promote. target zone is 60–85%. response time on correct answers is a secondary signal — slow-but-correct means the skill is known but not automatic, so hold the level.
                  </p>
                </div>
              </div>
              <div style={styles.forceItem}>
                <div style={styles.forceNum}>3</div>
                <div>
                  <p style={styles.forceName}>confidence checks — fluency decay</p>
                  <p style={styles.forceDesc}>
                    20% of questions come from already-mastered skills. a skill you aced two weeks ago will decay without reinforcement. FSRS handles this naturally through retrievability, but the 20% floor guarantees it.
                  </p>
                </div>
              </div>
            </div>

            <p style={styles.body}>
              promotion and demotion thresholds:
            </p>
            <div style={styles.thresholdGrid}>
              <div style={{ ...styles.thresholdCard, borderColor: "var(--success)", background: "var(--success-subtle)" }}>
                <p style={{ ...styles.thresholdLabel, color: "var(--success)" }}>promote when</p>
                <p style={styles.thresholdRule}>4 of last 5 correct</p>
                <p style={styles.thresholdRule}>avg response time &lt; 15s on correct</p>
              </div>
              <div style={{ ...styles.thresholdCard, borderColor: "var(--error)", background: "var(--error-subtle)" }}>
                <p style={{ ...styles.thresholdLabel, color: "var(--error)" }}>demote when</p>
                <p style={styles.thresholdRule}>3 consecutive misses at current level</p>
              </div>
            </div>
            <p style={styles.body}>
              these are deliberately conservative. false promotion is way more damaging than slow promotion — push a learner into level 4 before level 3 is solid and they disengage entirely.
            </p>
          </Section>

          <div style={styles.divider} />

          {/* question pipeline */}
          <Section id="question-pipeline" title="how questions are generated">
            <p style={styles.body}>
              every question goes through a three-layer system, checked in order. the adaptive selector first decides the target — a <code style={styles.inlineCode}>{`{ skillKey, level }`}</code> pair like <code style={styles.inlineCode}>mul:3</code>. then:
            </p>

            <div style={styles.forceList}>
              <div style={styles.forceItem}>
                <div style={styles.forceNum}>1</div>
                <div>
                  <p style={styles.forceName}>static bank (primary)</p>
                  <p style={styles.forceDesc}>
                    a pre-generated bank of ~15 questions per bucket (6 skills × 5 levels × 2 modes = 60 buckets, ~900 questions total) ships with the app. on first load, the bank seeds the local cache. most questions in a session come from here — zero latency, zero API cost, guaranteed variety.
                  </p>
                </div>
              </div>
              <div style={styles.forceItem}>
                <div style={styles.forceNum}>2</div>
                <div>
                  <p style={styles.forceName}>session cache (secondary)</p>
                  <p style={styles.forceDesc}>
                    questions are stored in <code style={styles.inlineCode}>localStorage</code> keyed by <code style={styles.inlineCode}>mode:skillKey:level</code>, max 30 per bucket. the cache grows over time as Venice generates more. session deduplication filters out anything shown in the current session — if a question has been seen, it doesn't count as available, regardless of cache size.
                  </p>
                </div>
              </div>
              <div style={styles.forceItem}>
                <div style={styles.forceNum}>3</div>
                <div>
                  <p style={styles.forceName}>Venice AI (fallback + replenishment)</p>
                  <p style={styles.forceDesc}>
                    only called when both layers are exhausted for a bucket. generates a batch of 5 questions in one call (not one at a time — batching forces self-diversity within the response). the prompt includes recently-seen question texts so Venice avoids near-duplicates. results are cached immediately and the user sees the first unseen one. a background replenishment call also fires whenever cache is served from the bank.
                  </p>
                </div>
              </div>
            </div>

            <p style={styles.body}>
              audio caching works the same way. the first time a question is spoken, ElevenLabs generates the audio and we store it as base64 in IndexedDB, keyed by question text. same question heard again — from cache, replay, or the bank — is instant, no network.
            </p>

            <Callout type="info">
              with the static bank pre-seeded, a new user plays their first session with zero API calls for question generation. Venice only gets called to replenish buckets in the background, and audio is only generated for each unique question text once.
            </Callout>
          </Section>

          <div style={styles.divider} />

          {/* what broke */}
          <Section id="what-broke" title="what broke — and how we fixed it">
            <p style={styles.body}>
              we didn't start with a static bank. the original design was pure on-the-fly generation: call Venice for every question, let the model handle variety. it failed in three distinct ways. documenting them because they're genuinely non-obvious.
            </p>

            <div style={styles.forceList}>
              <div style={styles.forceItem}>
                <div style={styles.forceNum}>1</div>
                <div>
                  <p style={styles.forceName}>the cache was serving seen questions</p>
                  <p style={styles.forceDesc}>
                    the deduplication bug was subtle. when all cached questions for a bucket had been shown in the current session, <code style={styles.inlineCode}>getCachedQuestion</code> was supposed to return <code style={styles.inlineCode}>null</code> so the caller would generate fresh. instead, it returned a random question from the bucket regardless — seen or not. the fix was one line: return null when the unseen pool is empty. but this alone didn't stop repetition.
                  </p>
                </div>
              </div>
              <div style={styles.forceItem}>
                <div style={styles.forceNum}>2</div>
                <div>
                  <p style={styles.forceName}>Venice generates repetitive questions</p>
                  <p style={styles.forceDesc}>
                    even with the null-return fix, separate API calls for the same bucket kept producing near-identical questions. "what is 7 plus 4?" one call, "what is 8 plus 3?" the next. technically different, mentally identical. the root cause: LLMs trained on math data have strong priors toward canonical examples. at low temperature they converge on the same 20–30 questions for simple arithmetic. at high temperature the arithmetic goes wrong. the fix was batch generation — ask for 5 questions in a single call. a single call forces the model to self-diversify because it evaluates all 5 simultaneously against the "no two questions should look similar" instruction in the prompt. single-question calls have no such pressure.
                  </p>
                </div>
              </div>
              <div style={styles.forceItem}>
                <div style={styles.forceNum}>3</div>
                <div>
                  <p style={styles.forceName}>mode leakage</p>
                  <p style={styles.forceDesc}>
                    direct mode was generating word problems. situational mode was generating pure arithmetic. a single shared system prompt with mode as a variable was the cause — the model underweighted the mode instruction against its general math-question training. fix: completely separate system prompts per mode. direct mode's prompt explicitly says "pure arithmetic only. no stories, no real-life context." situational mode's says "real-life scenarios only. no pure arithmetic." the model needs categorical instruction, not a conditional.
                  </p>
                </div>
              </div>
            </div>

            <p style={styles.body}>
              batch generation + separate prompts reduced repetition significantly. but Venice still occasionally produced near-identical questions across separate API calls — different sessions, same bucket. the fundamental constraint is the question space itself: there are only so many distinct "single digit addition" problems, and the model has strong priors toward the common ones.
            </p>

            <Callout type="warn">
              this is the limit of on-the-fly LLM generation for low-complexity math. the model isn't bad at following instructions — the problem space is just small enough that even a good model with good prompts will converge.
            </Callout>

            <p style={styles.body}>
              the static bank solves this at the source. questions are generated once, deduplicated, and curated before they ever reach the app. Venice becomes a background replenishment system that runs while the learner is answering — not a real-time dependency. the bank handles the common case; Venice handles the long tail.
            </p>
          </Section>

          <div style={styles.divider} />

          {/* 7. tech stack */}
          <Section id="stack" title="implementation">
            <p style={styles.body}>
              the adaptive system is a few composable modules. only one external dependency: <code style={styles.inlineCode}>ts-fsrs</code>.
            </p>
            <div style={styles.fileTree}>
              {[
                { file: "src/adaptive/learnerModel.js", desc: "pure data: state shape, update functions, unlock logic. no React." },
                { file: "src/adaptive/selector.js", desc: "pure function — reads learner state, returns {skillKey, level}. no side effects." },
                { file: "src/adaptive/questionBank.json", desc: "static question bank (~900 questions). generated once by scripts/generateQuestionBank.mjs, bundled with the app." },
                { file: "src/adaptive/bankSeeder.js", desc: "seeds localStorage cache from the static bank on app load. only fills buckets below 10 questions." },
                { file: "src/adaptive/questionGenerator.js", desc: "Venice AI integration. cache-first, with avoidTexts passed to the prompt when generating fresh." },
                { file: "src/adaptive/questionCache.js", desc: "localStorage question cache. max 30/bucket, deduplicates by text." },
                { file: "src/adaptive/audioCache.js", desc: "IndexedDB audio cache. stores ElevenLabs output as base64, keyed by question text." },
                { file: "src/adaptive/useLearner.js", desc: "React hook: reads/writes localStorage, exposes recordAttempt()." },
                { file: "src/useAdaptiveSession.js", desc: "orchestration hook used by GameScreen. composes all of the above." },
              ].map(f => (
                <div key={f.file} style={styles.fileRow}>
                  <code style={styles.fileName}>{f.file}</code>
                  <p style={styles.fileDesc}>{f.desc}</p>
                </div>
              ))}
            </div>
            <p style={styles.body}>
              <code style={styles.inlineCode}>GameScreen.jsx</code> barely changes. the static array swaps for <code style={styles.inlineCode}>useAdaptiveSession(mode)</code>, which returns the same <code style={styles.inlineCode}>{`{ currentQuestion, advance }`}</code> interface. streak, pause, timer, audio — all untouched.
            </p>
            <Callout type="success">
              the full learner model fits in under 2 KB of localStorage. no account, no server, no GDPR surface. works offline after the initial load — only question generation needs a network call.
            </Callout>
          </Section>

          <div style={styles.divider} />

          {/* 8. references */}
          <Section id="references" title="references">
            <ol style={styles.refList}>
              {[
                { num: 1, title: "Vygotsky, L.S. — Zone of Proximal Development", url: "https://en.wikipedia.org/wiki/Zone_of_proximal_development" },
                { num: 2, title: "FSRS4Anki — Open Spaced Repetition", url: "https://github.com/open-spaced-repetition/fsrs4anki" },
                { num: 3, title: "fsrs.js — A spaced repetition algorithm which overtakes Anki and catches up with SuperMemo", url: "https://github.com/open-spaced-repetition/fsrs.js" },
                { num: 4, title: "ts-fsrs — TypeScript implementation of FSRS", url: "https://github.com/open-spaced-repetition/ts-fsrs" },
                { num: 5, title: "On the Effectiveness of Prompt-Moderated LLMs for Math Tutoring — EMNLP 2025", url: "https://aclanthology.org/2025.findings-emnlp.605.pdf" },
                { num: 6, title: "MathTutorBench — Benchmark for LLM Tutors, ETH Zürich 2025", url: "https://eth-lre.github.io/mathtutorbench/" },
                { num: 7, title: "Deep Knowledge Tracing — Piech et al., Stanford 2015", url: "https://stanford.edu/~cpiech/bio/papers/deepKnowledgeTracing.pdf" },
                { num: 8, title: "Ebbinghaus, H. — Memory: A Contribution to Experimental Psychology, 1885", url: "https://psychclassics.yorku.ca/Ebbinghaus/memory-intro.htm" },
              ].map(r => (
                <li key={r.num} style={styles.refItem}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" style={styles.refLink}>
                    {r.title}
                    <ArrowSquareOut size={12} weight="bold" style={{ marginLeft: "4px", verticalAlign: "middle", flexShrink: 0 }} />
                  </a>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    flex: 1,
    maxWidth: "1100px",
    width: "100%",
    margin: "0 auto",
    padding: "clamp(24px, 4vw, 48px) clamp(16px, 3vw, 32px)",
    gap: "clamp(32px, 4vw, 64px)",
    alignItems: "flex-start",
  },
  sidebar: {
    position: "sticky",
    top: "calc(64px + 24px)",
    width: "180px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  sidebarLabel: {
    fontSize: "0.6875rem",
    fontWeight: 700,
    color: "var(--text-tertiary)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  sidebarLink: {
    display: "block",
    fontSize: "0.8125rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
    textDecoration: "none",
    padding: "5px 0",
    letterSpacing: "-0.01em",
    transition: "color 0.15s ease",
  },
  main: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0",
  },
  hero: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    paddingBottom: "clamp(24px, 3vw, 40px)",
  },
  badge: {
    fontSize: "0.6875rem",
    fontWeight: 700,
    color: "var(--accent)",
    background: "var(--accent-subtle)",
    padding: "4px 12px",
    borderRadius: "var(--radius-pill)",
    letterSpacing: "-0.01em",
    alignSelf: "flex-start",
  },
  title: {
    fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
    fontWeight: 900,
    color: "var(--text-primary)",
    letterSpacing: "-0.04em",
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: "clamp(0.9375rem, 1.8vw, 1.0625rem)",
    fontWeight: 500,
    color: "var(--text-secondary)",
    lineHeight: 1.65,
    maxWidth: "560px",
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "4px",
  },
  metaTag: {
    fontSize: "0.6875rem",
    fontWeight: 700,
    color: "var(--text-tertiary)",
    background: "var(--bg-subtle)",
    border: "1px solid var(--border)",
    padding: "3px 10px",
    borderRadius: "var(--radius-pill)",
    letterSpacing: "-0.01em",
  },
  divider: {
    height: "1px",
    background: "var(--border)",
    margin: "clamp(24px, 3vw, 40px) 0",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sectionTitle: {
    fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)",
    fontWeight: 800,
    color: "var(--text-primary)",
    letterSpacing: "-0.035em",
    marginBottom: "4px",
  },
  body: {
    fontSize: "clamp(0.875rem, 1.6vw, 0.9375rem)",
    fontWeight: 500,
    color: "var(--text-secondary)",
    lineHeight: 1.75,
    letterSpacing: "-0.01em",
  },
  callout: {
    borderLeft: "3px solid",
    padding: "14px 18px",
    borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "var(--text-secondary)",
    lineHeight: 1.65,
  },
  code: {
    background: "var(--bg-subtle)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: "16px 20px",
    fontSize: "0.8125rem",
    fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
    color: "var(--text-primary)",
    overflowX: "auto",
    lineHeight: 1.6,
    letterSpacing: "0",
    whiteSpace: "pre",
    margin: "4px 0",
  },
  inlineCode: {
    background: "var(--bg-subtle)",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    padding: "1px 6px",
    fontSize: "0.8125rem",
    fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
    color: "var(--text-primary)",
    letterSpacing: "0",
  },
  citeLink: {
    color: "var(--accent)",
    textDecoration: "none",
    fontWeight: 700,
  },
  approachGrid: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  approachCard: {
    flex: 1,
    minWidth: "160px",
    background: "var(--bg-subtle)",
    border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "20px 24px",
    textAlign: "center",
  },
  approachCardTitle: {
    fontSize: "1.125rem",
    fontWeight: 900,
    color: "var(--accent)",
    letterSpacing: "-0.03em",
    marginBottom: "6px",
  },
  approachCardSub: {
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "var(--text-secondary)",
    lineHeight: 1.5,
  },
  approachPlus: {
    fontSize: "1.5rem",
    fontWeight: 900,
    color: "var(--text-tertiary)",
    flexShrink: 0,
  },
  varGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  varCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    background: "var(--bg-subtle)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: "14px 18px",
  },
  varLetter: {
    width: "36px",
    height: "36px",
    borderRadius: "var(--radius-sm)",
    background: "var(--accent-subtle)",
    color: "var(--accent)",
    fontSize: "1.125rem",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  varName: {
    fontSize: "0.875rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
  },
  varDesc: {
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "var(--text-tertiary)",
    letterSpacing: "-0.01em",
  },
  skillTable: {
    display: "flex",
    flexDirection: "column",
    gap: "0",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    overflow: "hidden",
  },
  skillRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "10px 16px",
    borderBottom: "1px solid var(--border)",
    fontSize: "0.875rem",
  },
  skillName: {
    fontWeight: 700,
    color: "var(--text-primary)",
    width: "120px",
    flexShrink: 0,
  },
  skillDesc: {
    fontWeight: 500,
    color: "var(--text-tertiary)",
    flex: 1,
  },
  unlockList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  unlockRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "0.875rem",
  },
  unlockCondition: {
    fontWeight: 600,
    color: "var(--text-secondary)",
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontSize: "0.8125rem",
    width: "200px",
    flexShrink: 0,
  },
  unlockArrow: {
    color: "var(--text-tertiary)",
    fontWeight: 700,
  },
  unlockSkill: {
    fontWeight: 700,
    color: "var(--accent)",
  },
  forceList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  forceItem: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
  },
  forceNum: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "var(--accent)",
    color: "#fff",
    fontSize: "0.8125rem",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "2px",
  },
  forceName: {
    fontSize: "0.9375rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
    marginBottom: "4px",
  },
  forceDesc: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "var(--text-secondary)",
    lineHeight: 1.7,
  },
  thresholdGrid: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  thresholdCard: {
    flex: 1,
    minWidth: "180px",
    border: "1.5px solid",
    borderRadius: "var(--radius-md)",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  thresholdLabel: {
    fontSize: "0.6875rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "4px",
  },
  thresholdRule: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "var(--text-primary)",
    letterSpacing: "-0.01em",
  },
  fileTree: {
    display: "flex",
    flexDirection: "column",
    gap: "0",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    overflow: "hidden",
  },
  fileRow: {
    padding: "12px 16px",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  fileName: {
    fontSize: "0.8125rem",
    fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
    color: "var(--accent)",
    letterSpacing: "0",
  },
  fileDesc: {
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "var(--text-tertiary)",
    letterSpacing: "-0.01em",
  },
  refList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    paddingLeft: "20px",
  },
  refItem: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "var(--text-secondary)",
  },
  refLink: {
    color: "var(--accent)",
    textDecoration: "none",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "2px",
  },
};
