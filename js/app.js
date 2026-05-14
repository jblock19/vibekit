const tabs = Array.from(document.querySelectorAll('[data-template-tab]'));
const panels = Array.from(document.querySelectorAll('[data-template-panel]'));
const forms = Array.from(document.querySelectorAll('[data-template-form]'));
const output = document.querySelector('#brief-output');
const outputDescription = document.querySelector('#output-description');
const copyButton = document.querySelector('#copy-button');
const clearButton = document.querySelector('#clear-button');
const generateButton = document.querySelector('#generate-button');
const formMessage = document.querySelector('#form-message');
const importInput = document.querySelector('#import-input');
const importPreview = document.querySelector('#import-preview');
const extractButton = document.querySelector('#extract-button');
const applyDraftButton = document.querySelector('#apply-draft-button');
const clearImportButton = document.querySelector('#clear-import-button');

const templates = {
  'product-intake': {
    emptyText: 'Your Product Brief v1 will appear here after you generate it.',
    successMessage: 'Product Brief v1 generated.',
    copyEmptyMessage: 'Generate a Product Brief before copying it.',
    outputDescription: 'Copy this into ChatGPT, Codex, Claude, or your coding assistant as the first structured context block.',
    requiredFields: [
      { key: 'appName', label: 'app name' },
      { key: 'description', label: 'one-sentence description' }
    ],
    generate: generateProductBrief
  },
  'core-loop': {
    emptyText: 'Your Core User Loop Brief will appear here after you generate it.',
    successMessage: 'Core User Loop Brief generated.',
    copyEmptyMessage: 'Generate a Core User Loop Brief before copying it.',
    outputDescription: 'Use this output to keep the first real product loop focused before adding more features.',
    requiredFields: [
      { key: 'primaryUser', label: 'primary user' },
      { key: 'smallestLoop', label: 'smallest complete loop' }
    ],
    generate: generateCoreLoopBrief
  },
  'mvp-boundary': {
    emptyText: 'Your MVP Scope Brief will appear here after you generate it.',
    successMessage: 'MVP Scope Brief generated.',
    copyEmptyMessage: 'Generate an MVP Scope Brief before copying it.',
    outputDescription: 'Use this output to prevent scope explosion and define what belongs in the first working version.',
    requiredFields: [
      { key: 'mustHave', label: 'must-have features' },
      { key: 'outOfScope', label: 'out-of-scope items' }
    ],
    generate: generateMvpBoundaryBrief
  }
};

const toolNames = ['VS Code', 'GitHub', 'Supabase', 'Netlify', 'Vercel', 'Figma', 'ChatGPT', 'Codex', 'Claude', 'Other'];

let activeTemplate = 'product-intake';
let currentDraft = null;
const generatedOutputs = {
  'product-intake': '',
  'core-loop': '',
  'mvp-boundary': ''
};

function getActiveTemplateConfig() {
  return templates[activeTemplate];
}

function getActiveForm() {
  return document.querySelector(`[data-template-form="${activeTemplate}"]`);
}

function getFieldValue(formData, key) {
  return String(formData.get(key) || '').trim();
}

function getSelectedTools(form = document) {
  return Array.from(form.querySelectorAll('input[name="tools"]:checked'))
    .map(input => input.value)
    .join(', ');
}

function valueOrPlaceholder(value, placeholder = 'Not defined yet.') {
  return value || placeholder;
}

function setMessage(message, tone = 'error') {
  if (!formMessage) return;
  formMessage.textContent = message;
  formMessage.dataset.tone = tone;
}

function validateRequiredFields(formData, requiredFields) {
  const missing = requiredFields.filter(field => !getFieldValue(formData, field.key));

  if (!missing.length) return '';

  if (missing.length === 1) {
    return `Add ${missing[0].label} before generating this output.`;
  }

  return `Add ${missing.map(field => field.label).join(' and ')} before generating this output.`;
}

function switchTemplate(templateName) {
  if (!templates[templateName]) return;

  activeTemplate = templateName;
  const config = getActiveTemplateConfig();

  tabs.forEach(tab => {
    const isActive = tab.dataset.templateTab === templateName;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  panels.forEach(panel => {
    const isActive = panel.dataset.templatePanel === templateName;
    panel.classList.toggle('active', isActive);
    panel.hidden = !isActive;
  });

  output.textContent = generatedOutputs[templateName] || config.emptyText;
  outputDescription.textContent = config.outputDescription;
  currentDraft = null;
  renderImportPreview(null);
  setMessage('');
}

function generateProductBrief(formData, form) {
  const appName = getFieldValue(formData, 'appName');
  const description = getFieldValue(formData, 'description');
  const problem = getFieldValue(formData, 'problem');
  const audience = getFieldValue(formData, 'audience');
  const firstAction = getFieldValue(formData, 'firstAction');
  const notBecome = getFieldValue(formData, 'notBecome');
  const vibe = getFieldValue(formData, 'vibe');
  const references = getFieldValue(formData, 'references');
  const different = getFieldValue(formData, 'different');
  const tools = getSelectedTools(form);

  return `# Product Brief v1: ${appName}\n\n` +
`## One-Sentence Description\n${description}\n\n` +
`## Product Point of View\n${appName} should be built through progressive requirements, not one giant specification dump. The product should help its builder define only the context needed for the next useful AI build pass.\n\n` +
`## Core Problem\n${valueOrPlaceholder(problem)}\n\n` +
`## Target User\n${valueOrPlaceholder(audience)}\n\n` +
`## First User Action\n${valueOrPlaceholder(firstAction)}\n\n` +
`## What This App Should Not Become\n${valueOrPlaceholder(notBecome)}\n\n` +
`## Vibe Direction\n${valueOrPlaceholder(vibe)}\n\n` +
`## Comparable Apps or References\n${valueOrPlaceholder(references)}\n\n` +
`## Differentiation\n${valueOrPlaceholder(different)}\n\n` +
`## Recommended Helper Tools\n${valueOrPlaceholder(tools, 'No tools selected yet.')}\n\n` +
`## Next Recommended Template\nCore Loop Template\n\n` +
`## Suggested Next Prompt\nUse this product brief as context. Do not build the whole app yet. Help me define the smallest complete user loop for ${appName}, including the trigger, first action, value moment, and reason to return.`;
}

function generateCoreLoopBrief(formData) {
  const primaryUser = getFieldValue(formData, 'primaryUser');
  const trigger = getFieldValue(formData, 'trigger');
  const firstLoopAction = getFieldValue(formData, 'firstLoopAction');
  const valueMoment = getFieldValue(formData, 'valueMoment');
  const returnTrigger = getFieldValue(formData, 'returnTrigger');
  const smallestLoop = getFieldValue(formData, 'smallestLoop');
  const loopExclusions = getFieldValue(formData, 'loopExclusions');

  return `# Core User Loop Brief\n\n` +
`## Primary User\n${primaryUser}\n\n` +
`## Trigger\n${valueOrPlaceholder(trigger)}\n\n` +
`## First Action\n${valueOrPlaceholder(firstLoopAction)}\n\n` +
`## Value Moment\n${valueOrPlaceholder(valueMoment)}\n\n` +
`## Return Trigger\n${valueOrPlaceholder(returnTrigger)}\n\n` +
`## Smallest Complete Loop\n${smallestLoop}\n\n` +
`## Intentionally Excluded From First Loop\n${valueOrPlaceholder(loopExclusions)}\n\n` +
`## Next Recommended Template\nMVP Boundary Template\n\n` +
`## Suggested Next Prompt\nUse this Core User Loop Brief to define the MVP boundary. Separate must-have features, later features, out-of-scope items, fakeable/manual items, must-be-real items, and safety risks.`;
}

function generateMvpBoundaryBrief(formData) {
  const mustHave = getFieldValue(formData, 'mustHave');
  const niceLater = getFieldValue(formData, 'niceLater');
  const outOfScope = getFieldValue(formData, 'outOfScope');
  const manualFirst = getFieldValue(formData, 'manualFirst');
  const realDayOne = getFieldValue(formData, 'realDayOne');
  const safetyRisks = getFieldValue(formData, 'safetyRisks');

  return `# MVP Scope Brief\n\n` +
`## Must-Have For First Working Version\n${mustHave}\n\n` +
`## Nice-To-Have Later\n${valueOrPlaceholder(niceLater)}\n\n` +
`## Explicitly Out Of Scope\n${outOfScope}\n\n` +
`## Fakeable Or Manual At First\n${valueOrPlaceholder(manualFirst)}\n\n` +
`## Must Be Real From Day One\n${valueOrPlaceholder(realDayOne)}\n\n` +
`## Safety Or Confusion Risks\n${valueOrPlaceholder(safetyRisks)}\n\n` +
`## Next Recommended Template\nDesign and Vibe System\n\n` +
`## Suggested Next Prompt\nUse this MVP Scope Brief to create a Design and Vibe System. Define visual references, typography, color, layout, mobile behavior, desktop behavior, interaction principles, and UI anti-patterns.`;
}

function handleGenerate() {
  const form = getActiveForm();
  const config = getActiveTemplateConfig();

  if (!form || !config) return;

  const formData = new FormData(form);
  const validationMessage = validateRequiredFields(formData, config.requiredFields);

  if (validationMessage) {
    setMessage(validationMessage);
    return;
  }

  const generatedOutput = config.generate(formData, form);
  generatedOutputs[activeTemplate] = generatedOutput;
  output.textContent = generatedOutput;
  setMessage(config.successMessage, 'success');
}

async function handleCopy() {
  const config = getActiveTemplateConfig();
  const currentOutput = generatedOutputs[activeTemplate];

  if (!currentOutput) {
    setMessage(config.copyEmptyMessage);
    return;
  }

  try {
    await navigator.clipboard.writeText(currentOutput);
    setMessage('Output copied to clipboard.', 'success');
  } catch (error) {
    console.error('Could not copy output:', error);
    setMessage('Could not copy automatically. Select the output text and copy it manually.');
  }
}

function handleClear() {
  const form = getActiveForm();
  const config = getActiveTemplateConfig();

  form?.reset();
  generatedOutputs[activeTemplate] = '';
  output.textContent = config.emptyText;
  setMessage('');
}

function getSentences(text) {
  return text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);
}

function findSentence(sentences, patterns) {
  return sentences.find(sentence => patterns.some(pattern => pattern.test(sentence))) || '';
}

function extractLabelValue(text, labels) {
  for (const label of labels) {
    const pattern = new RegExp(`${label}\\s*[:–-]\\s*([^\\n]+)`, 'i');
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return '';
}

function inferAppName(text) {
  const labelValue = extractLabelValue(text, ['app name', 'name', 'working title']);
  if (labelValue) return labelValue;

  const calledMatch = text.match(/(?:called|named)\s+([A-Z][A-Za-z0-9 ]{2,32})/);
  if (calledMatch?.[1]) return calledMatch[1].trim().replace(/[.!?]$/, '');

  return '';
}

function inferTools(text) {
  const lowerText = text.toLowerCase();
  return toolNames.filter(tool => lowerText.includes(tool.toLowerCase()));
}

function extractDraftForActiveTemplate(text) {
  const sentences = getSentences(text);

  if (activeTemplate === 'product-intake') {
    return {
      appName: inferAppName(text),
      description: extractLabelValue(text, ['one-sentence description', 'description']) || sentences[0] || '',
      problem: extractLabelValue(text, ['problem', 'what problem does this solve']) || findSentence(sentences, [/problem/i, /solve/i, /struggle/i, /pain/i]),
      audience: extractLabelValue(text, ['who is it for', 'audience', 'target user']) || findSentence(sentences, [/for\s+(solo|users|founders|teams|builders|designers|developers|people)/i, /target user/i, /audience/i]),
      firstAction: extractLabelValue(text, ['first action', 'what should users be able to do first']) || findSentence(sentences, [/first/i, /start/i, /create/i, /fill/i]),
      notBecome: extractLabelValue(text, ['should not become', 'not become', 'what should this app not become']) || findSentence(sentences, [/should not/i, /not become/i, /avoid/i]),
      vibe: extractLabelValue(text, ['vibe', 'emotional direction', 'design direction']) || findSentence(sentences, [/vibe/i, /feel/i, /clean/i, /editorial/i, /calm/i]),
      references: extractLabelValue(text, ['references', 'comparable apps', 'comparables']) || findSentence(sentences, [/like/i, /reference/i, /similar/i, /notion/i, /linear/i]),
      different: extractLabelValue(text, ['different', 'what makes this different', 'differentiation']) || findSentence(sentences, [/different/i, /unique/i, /instead/i]),
      tools: inferTools(text)
    };
  }

  if (activeTemplate === 'core-loop') {
    return {
      primaryUser: extractLabelValue(text, ['primary user', 'user', 'target user']) || findSentence(sentences, [/for\s+(solo|users|founders|teams|builders|designers|developers|people)/i, /primary user/i]),
      trigger: extractLabelValue(text, ['trigger', 'what triggers them']) || findSentence(sentences, [/trigger/i, /open the app/i, /when/i]),
      firstLoopAction: extractLabelValue(text, ['first action', 'what do they do first']) || findSentence(sentences, [/first/i, /start/i, /fill/i, /create/i]),
      valueMoment: extractLabelValue(text, ['value moment', 'value', 'what value do they receive']) || findSentence(sentences, [/value/i, /receive/i, /generate/i, /output/i]),
      returnTrigger: extractLabelValue(text, ['return trigger', 'what makes them come back']) || findSentence(sentences, [/come back/i, /return/i, /next/i]),
      smallestLoop: extractLabelValue(text, ['smallest complete loop', 'core loop']) || findSentence(sentences, [/loop/i, /create.*generate/i, /fill.*generate/i]),
      loopExclusions: extractLabelValue(text, ['left out', 'excluded', 'intentionally left out']) || findSentence(sentences, [/left out/i, /exclude/i, /not include/i])
    };
  }

  return {
    mustHave: extractLabelValue(text, ['must-have', 'must have', 'first working version']) || findSentence(sentences, [/must/i, /first working/i, /need/i]),
    niceLater: extractLabelValue(text, ['nice-to-have', 'nice to have', 'later']) || findSentence(sentences, [/later/i, /eventually/i, /nice/i]),
    outOfScope: extractLabelValue(text, ['out of scope', 'explicitly out of scope']) || findSentence(sentences, [/out of scope/i, /not include/i, /not build/i]),
    manualFirst: extractLabelValue(text, ['manual', 'fakeable', 'faked']) || findSentence(sentences, [/manual/i, /fake/i, /static/i]),
    realDayOne: extractLabelValue(text, ['real from day one', 'must be real']) || findSentence(sentences, [/real from day one/i, /must be real/i]),
    safetyRisks: extractLabelValue(text, ['safety', 'confusing', 'risks']) || findSentence(sentences, [/unsafe/i, /confusing/i, /risk/i])
  };
}

function renderImportPreview(draft) {
  if (!importPreview) return;

  if (!draft) {
    importPreview.textContent = 'Draft values will appear here before they are applied.';
    return;
  }

  importPreview.textContent = JSON.stringify(draft, null, 2);
}

function handleExtractDraft() {
  const text = importInput?.value.trim() || '';

  if (!text) {
    currentDraft = null;
    renderImportPreview(null);
    setMessage('Paste a rough idea or prompt before extracting a draft.');
    return;
  }

  currentDraft = extractDraftForActiveTemplate(text);
  renderImportPreview(currentDraft);
  setMessage('Draft extracted. Review it, then apply it to the active template.', 'success');
}

function applyDraftToActiveTemplate() {
  const form = getActiveForm();

  if (!form || !currentDraft) {
    setMessage('Extract a draft before applying it.');
    return;
  }

  Object.entries(currentDraft).forEach(([key, value]) => {
    if (key === 'tools' && Array.isArray(value)) {
      form.querySelectorAll('input[name="tools"]').forEach(input => {
        input.checked = value.includes(input.value);
      });
      return;
    }

    const field = form.elements[key];
    if (field && value) field.value = value;
  });

  setMessage('Draft applied to the active template. Review the fields before generating output.', 'success');
}

function clearImportDraft() {
  if (importInput) importInput.value = '';
  currentDraft = null;
  renderImportPreview(null);
  setMessage('');
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    switchTemplate(tab.dataset.templateTab);
  });
});

forms.forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    handleGenerate();
  });
});

generateButton?.addEventListener('click', handleGenerate);
copyButton?.addEventListener('click', handleCopy);
clearButton?.addEventListener('click', handleClear);
extractButton?.addEventListener('click', handleExtractDraft);
applyDraftButton?.addEventListener('click', applyDraftToActiveTemplate);
clearImportButton?.addEventListener('click', clearImportDraft);

switchTemplate(activeTemplate);
