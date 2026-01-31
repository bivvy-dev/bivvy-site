// ========================================
// SEARCH MODAL
// ========================================

const searchOverlay = document.getElementById('search-overlay');
const searchModal = document.getElementById('search-modal');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const searchTrigger = document.getElementById('search-trigger');

let selectedIndex = -1;

function getSearchResults() {
  return searchResults.querySelectorAll('.search-result');
}

function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

const nav = document.querySelector('nav');
const atmosphere = document.querySelector('.atmosphere');
const navOriginalPadding = nav ? getComputedStyle(nav).paddingRight : '0px';

// FIX #4: Update modal state based on whether there are results
function updateModalState(hasContent) {
  if (hasContent) {
    searchModal.classList.add('has-results');
    searchModal.classList.remove('collapsed');
  } else {
    searchModal.classList.remove('has-results');
    searchModal.classList.add('collapsed');
  }
}

function openSearch() {
  const scrollbarWidth = getScrollbarWidth();
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = `${scrollbarWidth}px`;
  if (nav) {
    const currentPadding = parseFloat(navOriginalPadding);
    nav.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
  }
  if (atmosphere) {
    atmosphere.style.width = `calc(100% - ${scrollbarWidth}px)`;
  }

  searchOverlay.classList.add('open');

  // FIX #2: Clear the placeholder text on open
  searchResults.replaceChildren();

  // FIX #4: Start collapsed (no results showing)
  updateModalState(false);

  // FIX #1: Delay focus to ensure modal is visible and interactive
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      searchInput.focus();
    });
  });

  selectedIndex = -1;
  updateSelection();
}

function closeSearch() {
  searchOverlay.classList.remove('open');
  searchInput.value = '';
  searchResults.replaceChildren();
  selectedIndex = -1;
  updateSelection();
  updateModalState(false); // Reset to collapsed state
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  if (nav) nav.style.paddingRight = '';
  if (atmosphere) atmosphere.style.width = '';
}

function updateSelection() {
  const results = getSearchResults();
  results.forEach((result, index) => {
    result.classList.toggle('selected', index === selectedIndex);
  });
  if (selectedIndex >= 0 && results[selectedIndex]) {
    results[selectedIndex].scrollIntoView({ block: 'nearest' });
  }
}

function navigateResults(direction) {
  const results = getSearchResults();
  if (results.length === 0) return;

  if (direction === 'down') {
    selectedIndex = selectedIndex < results.length - 1 ? selectedIndex + 1 : 0;
  } else {
    selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : results.length - 1;
  }
  updateSelection();
}

function selectResult() {
  const results = getSearchResults();
  if (selectedIndex >= 0 && results[selectedIndex]) {
    results[selectedIndex].click();
    closeSearch();
  }
}

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    if (searchOverlay.classList.contains('open')) {
      closeSearch();
    } else {
      openSearch();
    }
  }

  if (e.key === 'Escape' && searchOverlay.classList.contains('open')) {
    closeSearch();
  }

  if (searchOverlay.classList.contains('open')) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateResults('down');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateResults('up');
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      selectResult();
    }
  }
});

searchTrigger.addEventListener('click', openSearch);

searchOverlay.addEventListener('click', (e) => {
  if (e.target === searchOverlay) {
    closeSearch();
  }
});

searchResults.addEventListener('mousemove', (e) => {
  const result = e.target.closest('.search-result');
  if (result) {
    const results = getSearchResults();
    selectedIndex = Array.from(results).indexOf(result);
    updateSelection();
  }
});

// ========================================
// PAGEFIND SEARCH INTEGRATION
// ========================================

let pagefind = null;

async function initPagefind() {
  if (pagefind) return pagefind;

  try {
    pagefind = await import('/pagefind/pagefind.js');
    if (pagefind.options) {
      await pagefind.options({ excerptLength: 20 });
    }
    return pagefind;
  } catch (e) {
    // FIX #3: Better error handling - show user-friendly message
    console.error('Pagefind not available:', e);
    return null;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderSearchResults(results) {
  searchResults.replaceChildren();

  if (!results || results.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'search-no-results';
    noResults.textContent = 'No results found';
    searchResults.appendChild(noResults);
    updateModalState(true); // Still show expanded for "no results" message
    return;
  }

  const group = document.createElement('div');
  group.className = 'search-results-group';

  const label = document.createElement('div');
  label.className = 'search-results-label';
  label.textContent = 'Documentation';
  group.appendChild(label);

  results.forEach((result, i) => {
    const link = document.createElement('a');
    link.href = result.url;
    link.className = 'search-result' + (i === 0 ? ' selected' : '');

    const icon = document.createElement('div');
    icon.className = 'search-result-icon';
    icon.textContent = '📄';

    const content = document.createElement('div');
    content.className = 'search-result-content';

    const title = document.createElement('div');
    title.className = 'search-result-title';
    title.textContent = result.title || 'Untitled';

    const desc = document.createElement('div');
    desc.className = 'search-result-description';
    desc.innerHTML = result.excerpt || '';

    content.appendChild(title);
    content.appendChild(desc);
    link.appendChild(icon);
    link.appendChild(content);
    group.appendChild(link);
  });

  searchResults.appendChild(group);
  selectedIndex = 0;

  // FIX #4: Expand modal when results are shown
  updateModalState(true);
}

function showSearchPlaceholder(message) {
  searchResults.replaceChildren();
  const placeholder = document.createElement('div');
  placeholder.className = 'search-no-results';
  placeholder.textContent = message;
  searchResults.appendChild(placeholder);
  updateModalState(true); // Show expanded for error/placeholder messages
}

let searchTimeout;

searchInput.addEventListener('input', async (e) => {
  const query = e.target.value.trim();

  if (!query) {
    // FIX #2 & #4: Clear results and collapse when input is empty
    searchResults.replaceChildren();
    updateModalState(false);
    selectedIndex = -1;
    return;
  }

  // Debounce search
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const pf = await initPagefind();

    if (!pf) {
      // FIX #3: Show helpful error message when Pagefind isn't available
      showSearchPlaceholder('Search index not available. Run: npx pagefind --site dist');
      return;
    }

    const search = await pf.search(query);
    const results = await Promise.all(
      search.results.slice(0, 8).map(async r => {
        const data = await r.data();
        return {
          url: data.url,
          title: data.meta?.title || data.url,
          excerpt: data.excerpt
        };
      })
    );

    renderSearchResults(results);
  }, 150);
});
