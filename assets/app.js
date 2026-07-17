const i18n = {
  en: {
    nav: { home: 'Home', announcements: 'Announcements' },
    home: { title: 'Server Info', version: 'Version:', uptime: 'Uptime:', quick: 'Quick Links', gotoAnnouncements: 'View Announcements' },
    // chat removed
    ann: { title: 'Announcements' },
    messages: { title: 'Messages', submit: 'Submit', none: 'No messages yet' }
  },
  zh: {
    nav: { home: '主页', announcements: '公告', messages: '留言' },
    home: { title: '服务器信息', version: '版本：', uptime: '运行时间：', quick: '快速链接', gotoAnnouncements: '查看公告' },
    ann: { title: '公告' },
    messages: { title: '留言板', submit: '提交', none: '暂无留言' }
  }
};

// add placeholders keys
i18n.en.messages.namePlaceholder = 'Your name';
i18n.en.messages.contentPlaceholder = 'Your message';
i18n.zh.messages.namePlaceholder = '姓名';
i18n.zh.messages.contentPlaceholder = '留言';

// add english nav messages
i18n.en.nav.messages = 'Messages';

const App = (function(){
  let lang = localStorage.getItem('lang') || 'zh';

  function translatePage(){
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      const parts = key.split('.');
      let cur = i18n[lang];
      for (let p of parts){ if (cur) cur = cur[p]; }
      if (cur) el.textContent = cur;
    });
    // placeholders translation (use data-i18n-placeholder)
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
      const key = el.getAttribute('data-i18n-placeholder');
      const parts = key.split('.');
      let cur = i18n[lang];
      for (let p of parts){ if (cur) cur = cur[p]; }
      if (cur) el.placeholder = cur;
    });
  }

  function initLangButtons(){
    document.getElementById('lang-zh').addEventListener('click', ()=>{ lang='zh'; localStorage.setItem('lang', 'zh'); translatePage(); });
    document.getElementById('lang-en').addEventListener('click', ()=>{ lang='en'; localStorage.setItem('lang', 'en'); translatePage(); });
    translatePage();
  }

  function initTheme(){
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label','Toggle theme');
    btn.innerHTML = `<span class="icon icon-sun" aria-hidden="true">\n      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4V2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 22v-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.93 4.93L3.51 3.51" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.49 20.49l-1.42-1.42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12H4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 12h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.93 19.07L3.51 20.49" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.49 3.51l-1.42 1.42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </span><span class="icon icon-moon" aria-hidden="true">\n      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </span>`;
    // place the button next to language switch if available
    const langWrap = document.querySelector('.lang-switch');
    if (langWrap){ langWrap.parentNode.insertBefore(btn, langWrap); }
    else { document.querySelector('nav').appendChild(btn); }
    const saved = localStorage.getItem('theme')||'dark';
    if (saved==='light'){
      document.documentElement.setAttribute('data-theme','light');
      btn.classList.add('is-light');
      btn.setAttribute('aria-pressed','true');
    }
    btn.addEventListener('click', ()=>{
      const isLight = document.documentElement.getAttribute('data-theme')==='light';
      // animate
      btn.classList.add('animating');
      setTimeout(()=>btn.classList.remove('animating'),350);
      if (isLight){
        document.documentElement.removeAttribute('data-theme');
        btn.classList.remove('is-light');
        btn.setAttribute('aria-pressed','false');
        localStorage.setItem('theme','dark');
      } else {
        document.documentElement.setAttribute('data-theme','light');
        btn.classList.add('is-light');
        btn.setAttribute('aria-pressed','true');
        localStorage.setItem('theme','light');
      }
    });
  }

  function loadServerInfo(){
    // Mocked data - in real use replace with fetch to API
    document.getElementById('server-version').textContent = '1.20.1 Forge';
    document.getElementById('server-uptime').textContent = '3小时';
  }

  return { init: function(){ initLangButtons(); initTheme(); }, loadServerInfo, translate: translatePage };
})();

// Messages feature removed as requested

// Chat page removed as requested

const Announcements = (function(){
  const perPage = 5;
  let page = 1;
  let data = [];

  // load announcement list (index.json should contain array of filenames)
  async function loadData(){
    try{
      const idxRes = await fetch('data/announcements/index.json');
      if (!idxRes.ok) throw new Error('index.json not found');
      const files = await idxRes.json();
      // fetch each file in parallel
      const promises = files.map(f=>fetch('data/announcements/'+f).then(r=>{ if(!r.ok) throw new Error(f+' not found'); return r.json(); }));
      const items = await Promise.all(promises);
      data = items.filter(Boolean).map(it=>({ ...it }));
      // ensure id is number
      data.forEach(d=>{ d.id = Number(d.id); });
      // if no pinned specified, leave as-is
    }catch(err){
      console.error('Failed to load announcements:', err);
      // fallback: empty list
      data = [];
    }
  }

  function render(){
    const list = document.getElementById('ann-list');
    if (!list) return;
    // sort so pinned items appear first, then by id desc (newest first)
    const sorted = data.slice().sort((a,b)=>{ const ap = a.pinned?1:0; const bp = b.pinned?1:0; if (bp - ap !==0) return bp - ap; return (b.id||0) - (a.id||0); });
    const start = (page-1)*perPage; const items = sorted.slice(start,start+perPage);
    list.innerHTML = '';
    items.forEach(a=>{
      const div = document.createElement('div');
      div.className = 'ann-item';
      const badge = a.pinned?` <span class="badge" data-i18n="ann.pinned">置顶</span>`:'';
      div.innerHTML = `<h3>${escapeHtml(a.title||'')}</h3>${badge}<p>${escapeHtml(a.content||'')}</p>`;
      list.appendChild(div);
    });
    // also render preview if exists
    const preview = document.getElementById('ann-preview');
    if (preview){
      preview.innerHTML = '';
      const previewItems = sorted.slice(0,3);
      previewItems.forEach(a=>{
        const d = document.createElement('div'); d.className='ann-item'; const badge = a.pinned?` <span class="badge" data-i18n="ann.pinned">置顶</span>`:''; d.innerHTML = `<h3>${escapeHtml(a.title||'')}</h3>${badge}<p>${escapeHtml(a.content||'')}</p>`; preview.appendChild(d);
      });
    }
    renderPagination();
  }

  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function renderPagination(){
    const total = Math.ceil(data.length/perPage) || 1;
    const pg = document.getElementById('pagination');
    if (!pg) return;
    pg.innerHTML = '';
    for (let i=1;i<=total;i++){
      const btn = document.createElement('button');
      btn.textContent = i; if (i===page) btn.disabled = true;
      btn.addEventListener('click', ()=>{ page=i; render(); });
      pg.appendChild(btn);
    }
  }

  async function init(){
    await loadData();
    render();
  }
  return { init };
})();
