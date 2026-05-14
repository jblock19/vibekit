# VibeKit Sequential Build System

VibeKit is an app-building system that uses its own process to build itself.

The core principle is simple:

> Progressive requirements, not giant specs.

A user should not give AI one huge requirements dump. Instead, VibeKit should guide the user through small, ordered templates that produce the right context for the next AI build pass.

## Product thesis

VibeKit turns vibe coding from a chaotic chat process into a structured build workflow.

It helps a user:

1. Define what they are building.
2. Capture the product vibe and intent.
3. Scope the smallest useful version.
4. Generate one focused AI prompt at a time.
5. Build externally in tools like ChatGPT, Codex, VS Code, GitHub, Supabase, Netlify, or Vercel.
6. Review the result.
7. Feed the next template with what was learned.
8. Continue sequentially.

## Prompt types

VibeKit should generate three kinds of prompts. They should not be mixed together unless explicitly needed.

### 1. Strategy prompts

Purpose: think before building.

Use when the user needs product direction, scope, architecture, template order, prioritization, or tradeoff analysis.

A strategy prompt should ask AI to:

- Clarify the goal.
- Identify the current stage.
- Recommend the next build pass.
- Define what should and should not be included.
- Avoid implementation until the strategy is approved.

Example use:

> Help me decide the next VibeKit template to build after Product Intake.

### 2. Audit prompts

Purpose: inspect the current app before changing it.

Use when the app already has code and the next step depends on understanding what exists.

An audit prompt should ask AI to:

- Inspect relevant files.
- Identify ownership of current behavior.
- Find duplication or drift.
- Explain risks.
- Recommend a safe implementation plan.
- Avoid editing unless explicitly requested.

Example use:

> Audit the current Product Intake implementation and recommend how to add Core Loop and MVP Boundary templates without creating duplicated form logic.

### 3. Implementation prompts

Purpose: make a scoped code change.

Use only after strategy and/or audit are clear.

An implementation prompt should ask AI to:

- Confirm repo, branch, and current files.
- Make one scoped change.
- Avoid unrelated edits.
- Preserve existing behavior.
- Report files changed.
- Include testing steps.

Example use:

> Add Core Loop and MVP Boundary templates to the current static VibeKit app.

## Template sequence

VibeKit should build apps through these templates in order.

### Template 1: Product Intake

Goal: define the app idea.

Output:

- Product Brief v1
- Product point of view
- Target user
- Core problem
- Vibe direction
- Recommended helper tools
- Next recommended template

Status: built in Pass 1.

### Template 2: Core Loop

Goal: identify the smallest complete user behavior.

Fields:

- Who is the primary user?
- What triggers them to open the app?
- What do they do first?
- What value do they receive?
- What makes them come back?
- What is the smallest complete loop?
- What should be intentionally left out of the first loop?

Output:

- Core User Loop Brief
- First buildable path
- Value moment
- Return trigger
- Next recommended template

### Template 3: MVP Boundary

Goal: prevent scope explosion.

Fields:

- Must-have for the first working version
- Nice-to-have later
- Explicitly out of scope
- What can be faked or manual at first?
- What must be real from day one?
- What would make the app unsafe or confusing if missing?

Output:

- MVP Scope Brief
- First-pass feature boundary
- Out-of-scope list
- Build risk notes
- Next recommended template

### Template 4: Design and Vibe System

Goal: turn aesthetic intent into usable UI constraints.

Fields:

- Visual references
- Words that describe the product
- Words that should not describe it
- Typography direction
- Color direction
- Layout direction
- Mobile behavior
- Desktop behavior
- Interaction principles
- Examples of wrong UI

Output:

- Design Direction Brief
- UI rules
- Component principles
- Anti-patterns

### Template 5: Stack and Integrations

Goal: choose the build environment and helper tools.

Fields:

- Frontend preference
- Backend preference
- Database
- Auth
- Storage
- Hosting
- Editor
- Repo
- AI coding tool
- Testing tools
- What should stay simple?
- What might need to scale later?

Output:

- Technical Setup Brief
- Recommended tools
- Setup checklist
- Integration sequence

### Template 6: Data and Permissions

Goal: define backend objects and access rules before code.

Fields:

- Main entities
- Who owns each entity?
- Who can create each entity?
- Who can read each entity?
- Who can update each entity?
- Who can delete each entity?
- Public vs private data
- Safety/security rules
- Admin needs

Output:

- Data Model Brief
- Supabase schema prompt
- RLS policy prompt
- Privacy and safety notes

### Template 7: Build Pass Generator

Goal: convert the current project state into the next scoped AI implementation prompt.

Fields:

- Current state
- What works
- What is broken
- Next goal
- Files involved
- Rules for this pass
- What not to change
- Acceptance criteria
- Testing steps

Output:

- Implementation Prompt
- Audit Prompt if needed
- Testing checklist
- Handoff summary

## How templates feed into each other

Each template should consume the outputs of previous templates, but only the parts needed for the current stage.

Example sequence:

1. Product Intake creates the Product Brief.
2. Core Loop uses the Product Brief to define the first real user path.
3. MVP Boundary uses the Product Brief and Core Loop to limit scope.
4. Design and Vibe uses the Product Brief and MVP Boundary to define UI rules.
5. Stack and Integrations uses the MVP Boundary to recommend tools.
6. Data and Permissions uses the Core Loop and MVP Boundary to define backend needs.
7. Build Pass Generator uses all previous outputs plus current code state to create the next implementation prompt.

The app should store these outputs as project memory later. For now, in the static version, each template can generate copyable markdown.

## How users populate forms in VibeKit

VibeKit should not ask the user to know everything upfront.

Each form should have:

- A short explanation of why this template exists.
- Plain-language fields.
- Helpful placeholder examples.
- Required fields only when necessary.
- A generated output preview.
- A copy button.
- A next recommended template.

A form should produce a structured markdown output that can be pasted into AI.

## Pass 2 implementation prompt

Use this prompt to move from Pass 1 to Pass 2.

```text
We are working in the GitHub repo jblock19/vibekit on the main branch.

Goal:
Implement Pass 2 of VibeKit by adding two new sequential templates to the existing static app:
1. Core Loop Template
2. MVP Boundary Template

Context:
VibeKit is a guided requirements and prompt-generation workspace for people building apps with AI. The product principle is: progressive requirements, not giant specs.

Current state:
The app currently has a static Product Intake Template in index.html, styles in css/style.css, behavior in js/app.js, and a README. The existing Product Intake form generates a Product Brief v1 and lets the user copy it.

Important rules:
- Keep this as a static HTML/CSS/JS app.
- Do not add auth.
- Do not add Supabase.
- Do not add OpenAI API.
- Do not add routing or a framework.
- Do not build the whole app.
- Preserve the existing Product Intake behavior.
- Avoid duplicated JavaScript where reasonable.
- Keep the interface calm, editorial, structured, and serious.

Pass 2 requirements:
Add a simple template navigation area near the top of the app with three template options:
- Product Intake
- Core Loop
- MVP Boundary

The user should be able to switch between templates without leaving the page.

Template 1: Product Intake
- Keep the existing fields and generated Product Brief behavior.

Template 2: Core Loop
Fields:
- Who is the primary user?
- What triggers them to open the app?
- What do they do first?
- What value do they receive?
- What makes them come back?
- What is the smallest complete loop?
- What should be intentionally left out of the first loop?

Generated output:
- Core User Loop Brief
- Primary user
- Trigger
- First action
- Value moment
- Return trigger
- Smallest complete loop
- Intentionally excluded items
- Next Recommended Template: MVP Boundary Template

Template 3: MVP Boundary
Fields:
- Must-have for the first working version
- Nice-to-have later
- Explicitly out of scope
- What can be faked or manual at first?
- What must be real from day one?
- What would make the app unsafe or confusing if missing?

Generated output:
- MVP Scope Brief
- Must-have features
- Later features
- Out-of-scope items
- Manual/fakeable items
- Must-be-real items
- Safety/confusion risks
- Next Recommended Template: Design and Vibe System

Behavior:
- Each template should generate its own markdown-style output.
- The existing Copy Brief button may become a more general Copy Output button.
- Clear Form should clear the active template only.
- If required fields are missing, show a simple inline message.
- Product Intake should still require app name and one-sentence description.
- Core Loop should require primary user and smallest complete loop.
- MVP Boundary should require must-have and out-of-scope fields.

Suggested implementation approach:
- Keep one page.
- Use data attributes or a small state object to track the active template.
- Reuse shared output/copy/clear behavior where possible.
- Avoid writing three totally separate systems.

Acceptance criteria:
- index.html opens directly in a browser.
- User can switch between Product Intake, Core Loop, and MVP Boundary.
- Each template has its own fields.
- Each template generates a coherent markdown output.
- Copy Output copies the active generated output.
- Clear Form clears the active template only.
- Existing Product Intake behavior still works.
- Desktop layout remains two-column.
- Mobile layout stacks cleanly.

Report back with:
- Files inspected
- Files changed
- Summary of implementation
- Manual testing steps
```

## Next recommended build pass

After Pass 2, the next pass should not be AI integration yet.

Pass 3 should add:

- Generated Prompt Type selector: Strategy, Audit, Implementation
- A Build Pass Generator template
- Prompt history stored temporarily in browser localStorage

This keeps the app focused on sequencing before adding backend or embedded AI.
