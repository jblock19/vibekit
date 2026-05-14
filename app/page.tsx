"use client";

import { useMemo, useState } from "react";

type TemplateKey = "product-intake" | "core-loop" | "mvp-boundary";
type PromptType = "Strategy" | "Audit" | "Implementation" | "Fix" | "PR / Merge";

type Field = {
  name: string;
  label: string;
  required?: boolean;
  rows?: number;
  type?: "text" | "textarea";
};

type Template = {
  key: TemplateKey;
  number: string;
  title: string;
  pass: string;
  description: string;
  outputType: string;
  promptType: PromptType;
  intervention: string;
  emptyText: string;
  fields: Field[];
};

const toolNames = ["VS Code", "GitHub", "Supabase", "Netlify", "Vercel", "Figma", "ChatGPT", "Codex", "Claude", "Other"];

const templates: Template[] = [
  {
    key: "product-intake",
    number: "01",
    title: "Product Intake",
    pass: "Pass 1",
    description: "Define the minimum product context needed for the first build conversation.",
    outputType: "Product Brief",
    promptType: "Strategy",
    intervention: "Review extracted draft before applying",
    emptyText: "Your Product Brief v1 will appear here after you generate it.",
    fields: [
      { name: "appName", label: "App name", required: true, type: "text" },
      { name: "description", label: "One-sentence description", required: true, rows: 2 },
      { name: "problem", label: "What problem does this solve?", rows: 2 },
      { name: "audience", label: "Who is it for?", rows: 2 },
      { name: "firstAction", label: "What should users be able to do first?", rows: 2 },
      { name: "notBecome", label: "What should this app not become?", rows: 2 },
      { name: "vibe", label: "What is the emotional or vibe direction?", rows: 2 },
      { name: "references", label: "Comparable apps or references", rows: 2 },
      { name: "different", label: "What makes this different?", rows: 2 }
    ]
  },
  {
    key: "core-loop",
    number: "02",
    title: "Core Loop",
    pass: "Pass 2",
    description: "Define the smallest complete user behavior before adding more features.",
    outputType: "Core User Loop Brief",
    promptType: "Strategy",
    intervention: "Confirm the loop is small enough before using it",
    emptyText: "Your Core User Loop Brief will appear here after you generate it.",
    fields: [
      { name: "primaryUser", label: "Who is the primary user?", required: true, rows: 2 },
      { name: "trigger", label: "What triggers them to open the app?", rows: 2 },
      { name: "firstLoopAction", label: "What do they do first?", rows: 2 },
      { name: "valueMoment", label: "What value do they receive?", rows: 2 },
      { name: "returnTrigger", label: "What makes them come back?", rows: 2 },
      { name: "smallestLoop", label: "What is the smallest complete loop?", required: true, rows: 3 },
      { name: "loopExclusions", label: "What should be intentionally left out of the first loop?", rows: 2 }
    ]
  },
  {
    key: "mvp-boundary",
    number: "03",
    title: "MVP Boundary",
    pass: "Pass 2",
    description: "Separate first-version requirements from later features and intentional exclusions.",
    outputType: "MVP Scope Brief",
    promptType: "Strategy",
    intervention: "Review scope before generating any implementation prompt",
    emptyText: "Your MVP Scope Brief will appear here after you generate it.",
    fields: [
      { name: "mustHave", label: "Must-have for the first working version", required: true, rows: 3 },
      { name: "niceLater", label: "Nice-to-have later", rows: 2 },
      { name: "outOfScope", label: "Explicitly out of scope", required: true, rows: 3 },
      { name: "manualFirst", label: "What can be faked or manual at first?", rows: 2 },
      { name: "realDayOne", label: "What must be real from day one?", rows: 2 },
      { name: "safetyRisks", label: "What would make the app unsafe or confusing if missing?", rows: 2 }
    ]
  }
];

const initialValues: Record<TemplateKey, Record<string, string>> = {
  "product-intake": { appName: "", description: "", problem: "", audience: "", firstAction: "", notBecome: "", vibe: "", references: "", different: "", tools: "" },
  "core-loop": { primaryUser: "", trigger: "", firstLoopAction: "", valueMoment: "", returnTrigger: "", smallestLoop: "", loopExclusions: "" },
  "mvp-boundary": { mustHave: "", niceLater: "", outOfScope: "", manualFirst: "", realDayOne: "", safetyRisks: "" }
};

function fallback(value: string, fallbackText = "Not defined yet.") {
  return value.trim() || fallbackText;
}

function timestamp() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function splitSentences(text: string) {
  return text.replace(/\n+/g, " ").replace(/([.!?])\s+/g, "$1|").split("|").map((s) => s.trim()).filter(Boolean);
}

function findSentence(sentences: string[], patterns: RegExp[]) {
  return sentences.find((sentence) => patterns.some((pattern) => pattern.test(sentence))) || "";
}

function extractLabelValue(text: string, labels: string[]) {
  for (const label of labels) {
    const pattern = new RegExp(`${label}\\s*[:–-]\\s*([^\\n]+)`, "i");
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

function inferAppName(text: string) {
  const labelValue = extractLabelValue(text, ["app name", "name", "working title"]);
  if (labelValue) return labelValue;
  const calledMatch = text.match(/(?:called|named)\s+([A-Z][A-Za-z0-9 ]{2,32})/);
  return calledMatch?.[1]?.trim().replace(/[.!?]$/, "") || "";
}

function inferTools(text: string) {
  const lower = text.toLowerCase();
  return toolNames.filter((tool) => lower.includes(tool.toLowerCase())).join(", ");
}

function extractDraft(templateKey: TemplateKey, text: string) {
  const sentences = splitSentences(text);
  if (templateKey === "product-intake") {
    return {
      appName: inferAppName(text),
      description: extractLabelValue(text, ["one-sentence description", "description"]) || sentences[0] || "",
      problem: extractLabelValue(text, ["problem", "what problem does this solve"]) || findSentence(sentences, [/problem/i, /solve/i, /struggle/i, /pain/i]),
      audience: extractLabelValue(text, ["who is it for", "audience", "target user"]) || findSentence(sentences, [/for\s+(solo|users|founders|teams|builders|designers|developers|people)/i, /target user/i, /audience/i]),
      firstAction: extractLabelValue(text, ["first action", "what should users be able to do first"]) || findSentence(sentences, [/first/i, /start/i, /create/i, /fill/i]),
      notBecome: extractLabelValue(text, ["should not become", "not become", "what should this app not become"]) || findSentence(sentences, [/should not/i, /not become/i, /avoid/i]),
      vibe: extractLabelValue(text, ["vibe", "emotional direction", "design direction"]) || findSentence(sentences, [/vibe/i, /feel/i, /clean/i, /editorial/i, /calm/i]),
      references: extractLabelValue(text, ["references", "comparable apps", "comparables"]) || findSentence(sentences, [/like/i, /reference/i, /similar/i, /notion/i, /linear/i]),
      different: extractLabelValue(text, ["different", "what makes this different", "differentiation"]) || findSentence(sentences, [/different/i, /unique/i, /instead/i]),
      tools: inferTools(text)
    };
  }
  if (templateKey === "core-loop") {
    return {
      primaryUser: extractLabelValue(text, ["primary user", "user", "target user"]) || findSentence(sentences, [/for\s+(solo|users|founders|teams|builders|designers|developers|people)/i, /primary user/i]),
      trigger: extractLabelValue(text, ["trigger", "what triggers them"]) || findSentence(sentences, [/trigger/i, /open the app/i, /when/i]),
      firstLoopAction: extractLabelValue(text, ["first action", "what do they do first"]) || findSentence(sentences, [/first/i, /start/i, /fill/i, /create/i]),
      valueMoment: extractLabelValue(text, ["value moment", "value", "what value do they receive"]) || findSentence(sentences, [/value/i, /receive/i, /generate/i, /output/i]),
      returnTrigger: extractLabelValue(text, ["return trigger", "what makes them come back"]) || findSentence(sentences, [/come back/i, /return/i, /next/i]),
      smallestLoop: extractLabelValue(text, ["smallest complete loop", "core loop"]) || findSentence(sentences, [/loop/i, /create.*generate/i, /fill.*generate/i]),
      loopExclusions: extractLabelValue(text, ["left out", "excluded", "intentionally left out"]) || findSentence(sentences, [/left out/i, /exclude/i, /not include/i])
    };
  }
  return {
    mustHave: extractLabelValue(text, ["must-have", "must have", "first working version"]) || findSentence(sentences, [/must/i, /first working/i, /need/i]),
    niceLater: extractLabelValue(text, ["nice-to-have", "nice to have", "later"]) || findSentence(sentences, [/later/i, /eventually/i, /nice/i]),
    outOfScope: extractLabelValue(text, ["out of scope", "explicitly out of scope"]) || findSentence(sentences, [/out of scope/i, /not include/i, /not build/i]),
    manualFirst: extractLabelValue(text, ["manual", "fakeable", "faked"]) || findSentence(sentences, [/manual/i, /fake/i, /static/i]),
    realDayOne: extractLabelValue(text, ["real from day one", "must be real"]) || findSentence(sentences, [/real from day one/i, /must be real/i]),
    safetyRisks: extractLabelValue(text, ["safety", "confusing", "risks"]) || findSentence(sentences, [/unsafe/i, /confusing/i, /risk/i])
  };
}

function generateOutput(templateKey: TemplateKey, values: Record<string, string>) {
  if (templateKey === "product-intake") {
    return `# Product Brief v1: ${values.appName}\n\n## One-Sentence Description\n${values.description}\n\n## Product Point of View\n${values.appName} should be built through progressive requirements, not one giant specification dump. The product should help its builder define only the context needed for the next useful AI build pass.\n\n## Core Problem\n${fallback(values.problem)}\n\n## Target User\n${fallback(values.audience)}\n\n## First User Action\n${fallback(values.firstAction)}\n\n## What This App Should Not Become\n${fallback(values.notBecome)}\n\n## Vibe Direction\n${fallback(values.vibe)}\n\n## Comparable Apps or References\n${fallback(values.references)}\n\n## Differentiation\n${fallback(values.different)}\n\n## Recommended Helper Tools\n${fallback(values.tools, "No tools selected yet.")}\n\n## Next Recommended Template\nCore Loop Template\n\n## Suggested Next Prompt\nUse this product brief as context. Do not build the whole app yet. Help me define the smallest complete user loop for ${values.appName}, including the trigger, first action, value moment, and reason to return.`;
  }
  if (templateKey === "core-loop") {
    return `# Core User Loop Brief\n\n## Primary User\n${values.primaryUser}\n\n## Trigger\n${fallback(values.trigger)}\n\n## First Action\n${fallback(values.firstLoopAction)}\n\n## Value Moment\n${fallback(values.valueMoment)}\n\n## Return Trigger\n${fallback(values.returnTrigger)}\n\n## Smallest Complete Loop\n${values.smallestLoop}\n\n## Intentionally Excluded From First Loop\n${fallback(values.loopExclusions)}\n\n## Next Recommended Template\nMVP Boundary Template\n\n## Prompt Quality Note\nThis is a strategy artifact, not an implementation prompt. Review it before using it as input for the next template.\n\n## Suggested Next Prompt\nUse this Core User Loop Brief to define the MVP boundary. Separate must-have features, later features, out-of-scope items, fakeable/manual items, must-be-real items, and safety risks.`;
  }
  return `# MVP Scope Brief\n\n## Must-Have For First Working Version\n${values.mustHave}\n\n## Nice-To-Have Later\n${fallback(values.niceLater)}\n\n## Explicitly Out Of Scope\n${values.outOfScope}\n\n## Fakeable Or Manual At First\n${fallback(values.manualFirst)}\n\n## Must Be Real From Day One\n${fallback(values.realDayOne)}\n\n## Safety Or Confusion Risks\n${fallback(values.safetyRisks)}\n\n## Next Recommended Template\nDesign and Vibe System\n\n## Prompt Quality Note\nThis is a scope artifact, not an implementation prompt. Use it to decide the next build pass before writing implementation instructions.\n\n## Suggested Next Prompt\nUse this MVP Scope Brief to create a Design and Vibe System. Define visual references, typography, color, layout, mobile behavior, desktop behavior, interaction principles, and UI anti-patterns.`;
}

export default function Home() {
  const [activeKey, setActiveKey] = useState<TemplateKey>("product-intake");
  const [values, setValues] = useState(initialValues);
  const [importText, setImportText] = useState("");
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [outputs, setOutputs] = useState<Record<TemplateKey, string>>({ "product-intake": "", "core-loop": "", "mvp-boundary": "" });
  const [message, setMessage] = useState("");
  const [log, setLog] = useState<string[]>(["Ready — choose a template, paste notes, or generate output."]);

  const activeTemplate = useMemo(() => templates.find((template) => template.key === activeKey)!, [activeKey]);
  const activeValues = values[activeKey];

  function addLog(entry: string) {
    setLog((current) => [`${timestamp()} — ${entry}`, ...current].slice(0, 12));
  }

  function updateValue(name: string, value: string) {
    setValues((current) => ({ ...current, [activeKey]: { ...current[activeKey], [name]: value } }));
  }

  function changeTemplate(nextKey: TemplateKey) {
    setActiveKey(nextKey);
    setDraft(null);
    setMessage("");
    addLog(`Switched to ${templates.find((template) => template.key === nextKey)?.title}`);
  }

  function handleExtract() {
    if (!importText.trim()) {
      setMessage("Paste a rough idea or prompt before extracting a draft.");
      return;
    }
    const nextDraft = extractDraft(activeKey, importText);
    setDraft(nextDraft);
    setMessage("Draft extracted. Review it before applying.");
    addLog(`Extracted draft for ${activeTemplate.title}`);
  }

  function handleApplyDraft() {
    if (!draft) {
      setMessage("Extract a draft before applying it.");
      return;
    }
    setValues((current) => ({ ...current, [activeKey]: { ...current[activeKey], ...draft } }));
    setMessage("Draft applied. Review and edit fields before generating output.");
    addLog(`Applied draft to ${activeTemplate.title}`);
  }

  function handleGenerate() {
    const missing = activeTemplate.fields.filter((field) => field.required && !activeValues[field.name]?.trim());
    if (missing.length) {
      setMessage(`Add ${missing.map((field) => field.label.toLowerCase()).join(" and ")} before generating this output.`);
      return;
    }
    const nextOutput = generateOutput(activeKey, activeValues);
    setOutputs((current) => ({ ...current, [activeKey]: nextOutput }));
    setMessage(`${activeTemplate.outputType} generated. Review before using externally.`);
    addLog(`Generated ${activeTemplate.outputType}`);
  }

  async function handleCopy() {
    const currentOutput = outputs[activeKey];
    if (!currentOutput) {
      setMessage("Generate output before copying it.");
      return;
    }
    try {
      await navigator.clipboard.writeText(currentOutput);
      setMessage("Output copied. Use only after reviewing it.");
      addLog(`Copied ${activeTemplate.outputType}`);
    } catch {
      setMessage("Copy failed. Select the output and copy manually.");
    }
  }

  function clearActiveTemplate() {
    setValues((current) => ({ ...current, [activeKey]: initialValues[activeKey] }));
    setOutputs((current) => ({ ...current, [activeKey]: "" }));
    setMessage("");
    addLog(`Cleared ${activeTemplate.title}`);
  }

  return (
    <main className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">VibeKit</p>
          <h1>Sequential requirements for vibe-coded apps.</h1>
        </div>
        <p>AI-generated drafts, clear user steps, and human review before the next build action.</p>
      </header>

      <nav className="template-nav" aria-label="Template navigation">
        {templates.map((template) => (
          <button key={template.key} className={template.key === activeKey ? "active" : ""} onClick={() => changeTemplate(template.key)} type="button">
            <span>{template.number}</span> {template.title}
          </button>
        ))}
      </nav>

      <section className="workspace">
        <section className="left-pane">
          <div className="status-grid two">
            <div><span>Current step</span><strong>{activeTemplate.title}</strong></div>
            <div><span>User intervention</span><strong>{activeTemplate.intervention}</strong></div>
          </div>

          <div className="left-scroll">
            <section className="card import-card">
              <div className="card-heading">
                <p className="eyebrow">Input assist</p>
                <h2>Paste a rough idea</h2>
                <p>VibeKit extracts a draft. Review it before applying it to the form.</p>
              </div>
              <label>Prompt or notes</label>
              <textarea className="import-box" value={importText} onChange={(event) => setImportText(event.target.value)} placeholder="Paste a rough idea, notes, or prior output..." />
              <div className="button-row">
                <button type="button" onClick={handleExtract}>Extract Draft</button>
                <button type="button" onClick={handleApplyDraft}>Apply Draft</button>
                <button type="button" onClick={() => { setImportText(""); setDraft(null); addLog("Cleared import draft"); }}>Clear Import</button>
              </div>
              <pre className="draft-preview">{draft ? JSON.stringify(draft, null, 2) : "Draft values will appear here before they are applied."}</pre>
            </section>

            <section className="template-section">
              <div className="section-title">
                <p className="eyebrow">{activeTemplate.pass}</p>
                <h2>{activeTemplate.title} Template</h2>
                <p>{activeTemplate.description}</p>
              </div>
              <div className="form-grid">
                {activeTemplate.fields.map((field) => (
                  <label key={field.name}>
                    <span>{field.label} {field.required && <em>required</em>}</span>
                    {field.type === "text" ? (
                      <input value={activeValues[field.name] || ""} onChange={(event) => updateValue(field.name, event.target.value)} />
                    ) : (
                      <textarea rows={field.rows || 2} value={activeValues[field.name] || ""} onChange={(event) => updateValue(field.name, event.target.value)} />
                    )}
                  </label>
                ))}
                {activeKey === "product-intake" && (
                  <label>
                    <span>Preferred helper tools</span>
                    <input value={activeValues.tools || ""} onChange={(event) => updateValue("tools", event.target.value)} placeholder="VS Code, GitHub, Supabase..." />
                  </label>
                )}
              </div>
            </section>
          </div>

          <p className="message">{message}</p>
          <div className="button-row footer-actions">
            <button className="primary" type="button" onClick={handleGenerate}>Generate Output</button>
            <button type="button" onClick={clearActiveTemplate}>Clear Active Template</button>
          </div>
        </section>

        <section className="right-pane">
          <div className="status-grid three">
            <div><span>Output type</span><strong>{activeTemplate.outputType}</strong></div>
            <div><span>Prompt type</span><strong>{activeTemplate.promptType}</strong></div>
            <div><span>Status</span><strong>Needs user review</strong></div>
          </div>

          <div className="output-heading">
            <div>
              <p className="eyebrow">Output</p>
              <h2>Generated Template Output</h2>
              <p>Generated outputs are drafts until reviewed and approved by the user.</p>
            </div>
            <button type="button" onClick={handleCopy}>Copy Output</button>
          </div>

          <pre className="output-box">{outputs[activeKey] || activeTemplate.emptyText}</pre>

          <aside className="activity-card">
            <div>
              <p className="eyebrow">Activity log</p>
              <h2>What VibeKit did</h2>
            </div>
            <ol>
              {log.map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}
            </ol>
          </aside>
        </section>
      </section>
    </main>
  );
}
