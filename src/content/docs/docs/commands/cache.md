---
title: bivvy cache
description: Manage cached templates
---

Manage the template cache used for remote template sources.

## Subcommands

### `bivvy cache list`

List all cached template entries.

```bash
# List all cached entries
bivvy cache list

# Show detailed information
bivvy cache list --verbose

# Output as JSON
bivvy cache list --json
```

### `bivvy cache clear`

Clear the template cache.

```bash
# Clear all cached entries (prompts for confirmation)
bivvy cache clear

# Clear without confirmation
bivvy cache clear --force

# Clear only expired entries
bivvy cache clear --expired
```

### `bivvy cache stats`

Show cache statistics.

```bash
bivvy cache stats
```

Output:
```
Cache Statistics:

  Total entries: 5
  Fresh: 3
  Expired: 2
  Total size: 12847 bytes
  Location: /Users/you/.cache/bivvy/templates
```

## Cache Location

The template cache is stored in:

- **macOS**: `~/Library/Caches/bivvy/templates/`
- **Linux**: `~/.cache/bivvy/templates/`
- **Windows**: `%LOCALAPPDATA%\bivvy\cache\templates\`

## See Also

- [Remote Template Sources](../templates/remote-sources.md)
- [Configuration](../configuration/schema.md)
