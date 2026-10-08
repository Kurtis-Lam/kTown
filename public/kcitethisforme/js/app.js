    // kTown uses the dark nebula background everywhere, so this page is always in dark mode.
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');

    let currentData = { author: '', dateStr: '', title: '', siteName: '', url: '' };
    let history = JSON.parse(localStorage.getItem('cite_history') || '[]');

    const form = document.getElementById('citeForm');
    const urlInput = document.getElementById('urlInput');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const errorMessage = document.getElementById('errorMessage');
    
    const outputContainer = document.getElementById('outputContainer');
    const formattedCitation = document.getElementById('formattedCitation');
    const copyBtn = document.getElementById('copyBtn');
    const copyBtnText = document.getElementById('copyBtnText');

    const editAuthor = document.getElementById('editAuthor');
    const editDate = document.getElementById('editDate');
    const editTitle = document.getElementById('editTitle');
    const editSiteName = document.getElementById('editSiteName');

    const historySection = document.getElementById('historySection');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    renderHistory();

    function formatDateString(rawDate) {
      if (!rawDate) return null;
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return null;
      const year = d.getFullYear();
      const month = d.toLocaleString('en-US', { month: 'long' });
      const day = d.getDate();
      return `${year}, ${month} ${day}`;
    }

    function extractDateFromUrl(url) {
      const fullDateMatch = url.match(/\/(20\d{2})[\/\-_](0[1-9]|1[0-2])[\/\-_](0[1-9]|[12]\d|3[01])/);
      if (fullDateMatch) {
        const [_, year, month, day] = fullDateMatch;
        const dateObj = new Date(year, month - 1, day);
        return `${year}, ${dateObj.toLocaleString('en-US', { month: 'long' })} ${parseInt(day)}`;
      }
      const yearMonthMatch = url.match(/\/(20\d{2})\/(0[1-9]|1[0-2])\//);
      if (yearMonthMatch) {
        const [_, year, month] = yearMonthMatch;
        const dateObj = new Date(year, month - 1, 1);
        return `${year}, ${dateObj.toLocaleString('en-US', { month: 'long' })}`;
      }
      return null;
    }

    async function fetchMetadataFromRawHtml(targetUrl) {
      let extracted = { author: null, date: null, title: null, siteName: null };
      try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) return extracted;
        const data = await res.json();
        const htmlText = data.contents;
        const doc = new DOMParser().parseFromString(htmlText, 'text/html');

        const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
        for (const script of jsonLdScripts) {
          try {
            const parsed = JSON.parse(script.textContent);
            const items = Array.isArray(parsed) ? parsed : [parsed];
            for (const item of items) {
              if (item['@graph']) items.push(...item['@graph']);
              if (!extracted.date && (item.datePublished || item.dateCreated || item.dateModified)) {
                extracted.date = item.datePublished || item.dateCreated || item.dateModified;
              }
              if (!extracted.author && item.author) {
                if (typeof item.author === 'string') extracted.author = item.author;
                else if (item.author.name) extracted.author = item.author.name;
                else if (Array.isArray(item.author) && item.author[0].name) extracted.author = item.author[0].name;
              }
              if (!extracted.siteName && item.publisher && item.publisher.name) {
                extracted.siteName = item.publisher.name;
              }
            }
          } catch (e) {}
        }

        if (!extracted.date) {
          const metaDate = doc.querySelector('meta[property="article:published_time"], meta[name="publication_date"], meta[name="date"], meta[name="DC.date.issued"]');
          if (metaDate) extracted.date = metaDate.content;
          else {
            const timeEl = doc.querySelector('time[datetime]');
            if (timeEl) extracted.date = timeEl.getAttribute('datetime');
          }
        }
        if (!extracted.author) {
          const metaAuthor = doc.querySelector('meta[name="author"], meta[property="article:author"], meta[name="byl"]');
          if (metaAuthor) extracted.author = metaAuthor.content;
        }
        if (!extracted.title) {
          const metaTitle = doc.querySelector('meta[property="og:title"], meta[name="twitter:title"]');
          if (metaTitle) extracted.title = metaTitle.content;
          else {
            const titleEl = doc.querySelector('title');
            if (titleEl) extracted.title = titleEl.textContent;
          }
        }
        if (!extracted.siteName) {
          const metaSite = doc.querySelector('meta[property="og:site_name"]');
          if (metaSite) extracted.siteName = metaSite.content;
        }
      } catch (err) { console.warn("Raw scraping failed", err); }
      return extracted;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const targetUrl = urlInput.value.trim();
      if (!targetUrl) return;

      setLoading(true);
      errorMessage.classList.add('hidden');

      let siteName = '', author = '', title = '', dateStr = null;
      const urlObj = new URL(targetUrl);

      try {
        const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}`);
        const json = await response.json();
        if (json.status === 'success' && json.data) {
          siteName = json.data.publisher || '';
          author = json.data.author || '';
          title = json.data.title || '';
          if (json.data.date) dateStr = formatDateString(json.data.date);
        }
      } catch (err) {}

      if (!dateStr || !author || !title) {
        const rawMeta = await fetchMetadataFromRawHtml(targetUrl);
        if (!author && rawMeta.author) author = rawMeta.author;
        if (!dateStr && rawMeta.date) dateStr = formatDateString(rawMeta.date);
        if (!title && rawMeta.title) title = rawMeta.title;
        if (!siteName && rawMeta.siteName) siteName = rawMeta.siteName;
      }

      if (!dateStr) dateStr = extractDateFromUrl(targetUrl);
      if (!siteName) siteName = urlObj.hostname.replace('www.', '').split('.')[0];
      if (!title) title = urlObj.pathname.split('/').filter(Boolean).pop()?.replace(/[-_]/g, ' ') || 'Homepage';

      currentData = {
        author: author ? formatAuthorName(author) : '',
        dateStr: dateStr || 'n.d.',
        title: toSentenceCase(title),
        siteName: capitalizeWords(siteName),
        url: targetUrl
      };

      updateUI();
      saveToHistory();
      setLoading(false);
    });

    function renderAPA7() {
      const { author, dateStr, title, siteName, url } = currentData;
      let html = '';
      if (author) {
        html += `${escapeHtml(author)} `;
        html += `(${escapeHtml(dateStr)}). `;
        html += `<i>${escapeHtml(title)}</i>. `;
        if (siteName.toLowerCase() !== author.toLowerCase()) html += `${escapeHtml(siteName)}. `;
      } else {
        html += `<i>${escapeHtml(title)}</i>. `;
        html += `(${escapeHtml(dateStr)}). `;
        html += `${escapeHtml(siteName)}. `;
      }
      html += `<a href="${escapeHtml(url)}" target="_blank" class="underline text-purple-300 hover:text-purple-200">${escapeHtml(url)}</a>`;

      formattedCitation.innerHTML = html;
      editAuthor.value = currentData.author;
      editDate.value = currentData.dateStr;
      editTitle.value = currentData.title;
      editSiteName.value = currentData.siteName;
      outputContainer.classList.remove('hidden');
    }

    [editAuthor, editDate, editTitle, editSiteName].forEach(input => {
      input.addEventListener('input', () => {
        currentData.author = editAuthor.value.trim();
        currentData.dateStr = editDate.value.trim() || 'n.d.';
        currentData.title = editTitle.value.trim();
        currentData.siteName = editSiteName.value.trim();
        renderAPA7();
      });
    });

    function updateUI() { renderAPA7(); }

    function formatAuthorName(rawName) {
      if (!rawName || typeof rawName !== 'string') return '';
      if (rawName.includes(',') || rawName.split(' ').length === 1) return rawName;
      const parts = rawName.trim().split(/\s+/);
      const lastName = parts.pop();
      const initials = parts.map(p => p.charAt(0).toUpperCase() + '.').join(' ');
      return `${lastName}, ${initials}`;
    }

    function toSentenceCase(str) {
      if (!str) return '';
      return str.toLowerCase().replace(/(^\s*|[.:?!\b]\s*)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
    }

    function capitalizeWords(str) { return str.replace(/\b\w/g, l => l.toUpperCase()); }
    function escapeHtml(str) { return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

    function setLoading(isLoading) {
      if (isLoading) {
        submitBtn.disabled = true;
        btnText.textContent = 'Fetching...';
        spinner.classList.remove('hidden');
      } else {
        submitBtn.disabled = false;
        btnText.textContent = 'Cite Website';
        spinner.classList.add('hidden');
      }
    }

    function showError(msg) {
      const span = errorMessage.querySelector('span');
      if (span) span.textContent = msg;
      errorMessage.classList.remove('hidden');
    }

    copyBtn.addEventListener('click', async () => {
      const htmlContent = formattedCitation.innerHTML;
      const plainTextContent = formattedCitation.innerText;
      try {
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        const textBlob = new Blob([plainTextContent], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob })
        ]);
        copyBtnText.textContent = 'Copied with Formatting!';
        copyBtn.classList.add('bg-emerald-600');
        setTimeout(() => {
          copyBtnText.textContent = 'Copy Citation';
          copyBtn.classList.remove('bg-emerald-600');
        }, 2000);
      } catch (err) {
        navigator.clipboard.writeText(plainTextContent).then(() => {
          copyBtnText.textContent = 'Copied!';
          setTimeout(() => { copyBtnText.textContent = 'Copy Citation'; }, 2000);
        });
      }
    });

    function saveToHistory() {
      const plainText = formattedCitation.innerText;
      history = history.filter(item => item.url !== currentData.url);
      history.unshift({ ...currentData, citationText: plainText });
      if (history.length > 5) history.pop();
      localStorage.setItem('cite_history', JSON.stringify(history));
      renderHistory();
    }

    function renderHistory() {
      if (history.length === 0) {
        historySection.classList.add('hidden');
        return;
      }
      historySection.classList.remove('hidden');
      historyList.innerHTML = history.map((item, idx) => `
        <div class="bg-[#121826]/90 light:bg-white border border-white/10 light:border-slate-200 p-4 rounded-2xl flex items-start justify-between gap-4">
          <p class="text-xs sm:text-sm font-serif text-slate-200 light:text-slate-800 leading-relaxed">${escapeHtml(item.citationText)}</p>
          <button onclick="loadFromHistory(${idx})" class="text-xs text-purple-400 light:text-purple-600 font-semibold hover:underline whitespace-nowrap cursor-pointer">Load</button>
        </div>
      `).join('');
    }

    window.loadFromHistory = function(index) {
      currentData = history[index];
      urlInput.value = currentData.url;
      updateUI();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    clearHistoryBtn.addEventListener('click', () => {
      history = [];
      localStorage.removeItem('cite_history');
      renderHistory();
    });
  
