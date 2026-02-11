---
title: bivvy config
description: Show resolved configuration
---

Displays the fully resolved configuration after merging all sources.

## Usage

```bash
bivvy config           # Show as YAML
bivvy config --json    # Output as JSON
bivvy config --yaml    # Output as YAML (default)
bivvy config --merged  # Show fully merged config
```

## Configuration Sources

Configuration is merged in this order:

1. `extends:` (remote base config)
2. `~/.bivvy/config.yml` (user global)
3. `.bivvy/config.yml` (project)
4. `.bivvy/config.local.yml` (local overrides)

## Example Output

```yaml
app_name: "MyApp"

settings:
  default_output: verbose

steps:
  brew:
    template: brew
  mise:
    template: mise
    depends_on: [brew]
  ruby_deps:
    template: bundler
    depends_on: [mise]

workflows:
  default:
    steps: [brew, mise, ruby_deps]
```

## JSON Output

```bash
bivvy config --json
```

```json
{
  "app_name": "MyApp",
  "steps": {
    "brew": {
      "template": "brew"
    }
  },
  "workflows": {
    "default": {
      "steps": ["brew", "mise", "ruby_deps"]
    }
  }
}
```
