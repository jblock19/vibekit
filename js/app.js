const tabs = Array.from(document.querySelectorAll('[data-template-tab]'));
const panels = Array.from(document.querySelectorAll('[data-template-panel]'));
const forms = Array.from(document.querySelectorAll('[data-template-form]'));
const output = document.querySelector('#brief-output');
const outputDescription = document.querySelector('#output-description');
const copyButton = document.querySelector('#copy-button');
const clearButton = document.querySelector('#clear-button');
const generateButton = document.querySelector('#generate-button');
const formMessage = document.querySelector('#form-message');

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

let activeTemplate = 'product-intake';
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

switchTemplate(activeTemplate);
