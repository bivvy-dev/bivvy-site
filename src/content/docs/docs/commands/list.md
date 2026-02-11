---
title: bivvy list
description: List steps and workflows
---

Lists all available steps and workflows in your configuration.

## Usage

```bash
bivvy list                 # Show both steps and workflows
bivvy list --steps-only    # Show only steps
bivvy list --workflows-only  # Show only workflows
bivvy list --json          # Output as JSON
```

## Example Output

```
Steps:
  hello (template: greet) ->
  world -> hello

Workflows:
  default: [hello, world]
  ci: [hello, world, ...]
```

## Output Format

### Steps

Each step shows:
- Step name
- Template (if using a template)
- Dependencies (steps it depends on)

### Workflows

Each workflow shows:
- Workflow name
- List of steps (truncated if more than 5)
