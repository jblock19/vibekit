const form = document.querySelector('#product-intake-form');
const output = document.querySelector('#brief-output');
const copyButton = document.querySelector('#copy-button');
const clearButton = document.querySelector('#clear-button');
const formMessage = document.querySelector('#form-message');

const emptyBriefText = 'Your Product Brief v1 will appear here after you generate it.';
let currentBrief = '';

function getFieldValue(formData, key) {
  return String(formData.get(key) || '').trim();
}

function getSelectedTools() {
  return Array.from(document.querySelectorAll('input[name="tools"]:checked'))
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

function generateBrief(formData) {
  const appName = getFieldValue(formData, 'appName');
  const description = getFieldValue(formData, 'description');
  const problem = getFieldValue(formData, 'problem');
  const audience = getFieldValue(formData, 'audience');
  const firstAction = getFieldValue(formData, 'firstAction');
  const notBecome = getFieldValue(formData, 'notBecome');
  const vibe = getFieldValue(formData, 'vibe');
  const references = getFieldValue(formData, 'references');
  const different = getFieldValue(formData, 'different');
  const tools = getSelectedTools();

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

function handleGenerate(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const appName = getFieldValue(formData, 'appName');
  const description = getFieldValue(formData, 'description');

  if (!appName || !description) {
    setMessage('Add an app name and one-sentence description before generating the brief.');
    return;
  }

  currentBrief = generateBrief(formData);
  output.textContent = currentBrief;
  setMessage('Product Brief v1 generated.', 'success');
}

async function handleCopy() {
  if (!currentBrief) {
    setMessage('Generate a brief before copying it.');
    return;
  }

  try {
    await navigator.clipboard.writeText(currentBrief);
    setMessage('Brief copied to clipboard.', 'success');
  } catch (error) {
    console.error('Could not copy brief:', error);
    setMessage('Could not copy automatically. Select the brief text and copy it manually.');
  }
}

function handleClear() {
  form.reset();
  currentBrief = '';
  output.textContent = emptyBriefText;
  setMessage('');
}

form?.addEventListener('submit', handleGenerate);
copyButton?.addEventListener('click', handleCopy);
clearButton?.addEventListener('click', handleClear);
