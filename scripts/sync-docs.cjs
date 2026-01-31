#!/usr/bin/env node

/**
 * Syncs documentation from the main bivvy repo (bivvy-dev/bivvy)
 * to this site's content directory.
 *
 * Usage:
 *   GITHUB_TOKEN=xxx node scripts/sync-docs.js
 *
 * Or with a .env file:
 *   node --env-file=.env scripts/sync-docs.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OWNER = 'bivvy-dev';
const REPO = 'bivvy';
const DOCS_PATH = 'docs';
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'content', 'docs', 'docs');
const BRANCH = 'main';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.warn('⚠️  GITHUB_TOKEN not set. Public repos work without it, but rate limits apply.');
}

function githubRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: endpoint,
      method: 'GET',
      headers: {
        'User-Agent': 'bivvy-site-sync',
        'Accept': 'application/vnd.github.v3+json',
        ...(GITHUB_TOKEN && { 'Authorization': `Bearer ${GITHUB_TOKEN}` }),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`GitHub API error ${res.statusCode}: ${data}`));
        } else {
          resolve(JSON.parse(data));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function fetchRawFile(filePath) {
  return new Promise((resolve, reject) => {
    const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${filePath}`;

    https.get(url, {
      headers: {
        'User-Agent': 'bivvy-site-sync',
        ...(GITHUB_TOKEN && { 'Authorization': `Bearer ${GITHUB_TOKEN}` }),
      }
    }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Follow redirect
        https.get(res.headers.location, (redirectRes) => {
          let data = '';
          redirectRes.on('data', chunk => data += chunk);
          redirectRes.on('end', () => resolve(data));
        }).on('error', reject);
      } else if (res.statusCode >= 400) {
        reject(new Error(`Failed to fetch ${filePath}: ${res.statusCode}`));
      } else {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }
    }).on('error', reject);
  });
}

async function getContents(repoPath) {
  const endpoint = `/repos/${OWNER}/${REPO}/contents/${repoPath}?ref=${BRANCH}`;
  return githubRequest(endpoint);
}

/**
 * Ensures markdown content has YAML frontmatter required by Starlight.
 * Also removes the first h1 heading if it matches the title to avoid duplicates.
 */
function ensureFrontmatter(content, filename) {
  let processedContent = content;
  let title;

  // Check if frontmatter already exists
  if (content.trimStart().startsWith('---')) {
    // Extract existing title from frontmatter
    const titleMatch = content.match(/^---[\s\S]*?title:\s*["']?([^"'\n]+)["']?[\s\S]*?---/m);
    title = titleMatch ? titleMatch[1].trim() : null;
  } else {
    // Extract title from first heading
    const headingMatch = content.match(/^#\s+(.+)$/m);
    title = headingMatch ? headingMatch[1] : filename.replace('.md', '');

    // Build frontmatter
    const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
---

`;
    processedContent = frontmatter + content;
  }

  // Remove the first h1 heading if it matches the title (to avoid duplicate)
  if (title) {
    // Match the first h1 that appears after frontmatter
    processedContent = processedContent.replace(
      /^(---[\s\S]*?---\s*\n+)#\s+.+\n+/m,
      '$1'
    );
  }

  return processedContent;
}

async function syncDirectory(repoPath, localPath) {
  console.log(`📂 Syncing ${repoPath}...`);

  const contents = await getContents(repoPath);

  // Ensure local directory exists
  fs.mkdirSync(localPath, { recursive: true });

  for (const item of contents) {
    const localItemPath = path.join(localPath, item.name);

    if (item.type === 'dir') {
      await syncDirectory(item.path, localItemPath);
    } else if (item.type === 'file' && item.name.endsWith('.md')) {
      console.log(`  📄 ${item.path}`);
      const content = await fetchRawFile(item.path);
      const processedContent = ensureFrontmatter(content, item.name);
      fs.writeFileSync(localItemPath, processedContent);
    }
  }
}

async function main() {
  console.log('🔄 Syncing docs from bivvy-dev/bivvy...\n');

  try {
    // Check if docs directory exists in the source repo
    const contents = await getContents(DOCS_PATH);

    if (!Array.isArray(contents)) {
      console.log('ℹ️  No docs/ directory found in source repo yet.');
      console.log('   Creating placeholder structure...\n');

      // Create placeholder
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      fs.writeFileSync(
        path.join(OUTPUT_DIR, 'index.md'),
        `---
title: Documentation
description: Bivvy CLI documentation
---

# Bivvy Documentation

Documentation is coming soon. Check back later!
`
      );
      console.log('✅ Created placeholder docs/index.md');
      return;
    }

    // Clear existing docs
    if (fs.existsSync(OUTPUT_DIR)) {
      fs.rmSync(OUTPUT_DIR, { recursive: true });
    }

    await syncDirectory(DOCS_PATH, OUTPUT_DIR);

    // Create landing page for /docs/ if it doesn't exist
    const indexPath = path.join(OUTPUT_DIR, 'index.md');
    if (!fs.existsSync(indexPath)) {
      console.log('  📄 Creating docs landing page...');
      fs.writeFileSync(indexPath, `---
title: Bivvy Documentation
description: Learn how to use Bivvy CLI to streamline your development environment setup
---

# Bivvy Documentation

Welcome to the Bivvy documentation. Bivvy is a CLI tool that helps you automate development environment setup.

## Getting Started

- [Configuration](/docs/configuration/) - Learn how to configure Bivvy
- [Templates](/docs/templates/) - Explore available templates
`);
    }

    console.log('\n✅ Docs synced successfully!');

  } catch (error) {
    if (error.message.includes('404')) {
      console.log('ℹ️  No docs/ directory found in source repo yet.');
      console.log('   Run this script again after adding docs to bivvy-dev/bivvy.\n');

      // Create placeholder
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      fs.writeFileSync(
        path.join(OUTPUT_DIR, 'index.md'),
        `---
title: Documentation
description: Bivvy CLI documentation
---

# Bivvy Documentation

Documentation is coming soon. Check back later!
`
      );
      console.log('✅ Created placeholder docs/index.md');
    } else {
      console.error('❌ Error syncing docs:', error.message);
      process.exit(1);
    }
  }
}

main();
