---
title: Installation
description: How to install Bivvy
---

Bivvy can be installed via several methods. All methods install the same
native binary -- choose whichever fits your workflow.

## Quick Install (Recommended)

```bash
curl -fsSL https://bivvy.dev/install | sh
```

See [curl install docs](./curl.md) for options and troubleshooting.

## Other Methods

| Method | Command | Notes |
|--------|---------|-------|
| [Homebrew](./homebrew.md) | `brew install bivvy-dev/bivvy/bivvy` | macOS/Linux, auto-updates |
| [Cargo](./cargo.md) | `cargo install bivvy` | Requires Rust 1.93+ |
| [npm](./npm.md) | `npm install -g bivvy-cli` | Node.js 14+ |
| [gem](./gem.md) | `gem install bivvy-cli` | Ruby 2.7+ |
| [pip](./pip.md) | `pip install bivvy-cli` | Python 3.8+ |

## Supported Platforms

| Platform | Architecture |
|----------|--------------|
| Linux | x64, arm64 |
| macOS | x64 (Intel), arm64 (Apple Silicon) |
| Windows | x64 |

## Verify Installation

After installing, verify it works:

```bash
bivvy --version
```

## Next Steps

```bash
cd my-project
bivvy init       # Initialize configuration
bivvy run        # Run setup
```
