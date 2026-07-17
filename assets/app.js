const i18n = {
  en: {
    nav: { home: 'Home', chat: 'Chat', announcements: 'Announcements' },
    home: { title: 'Server Info', version: 'Version:', uptime: 'Uptime:', quick: 'Quick Links', gotoChat: 'Go to Chat', gotoAnnouncements: 'View Announcements' },
    chat: { title: 'Group Chat', send: 'Send' },
    ann: { title: 'Announcements' },
    messages: { title: 'Messages', submit: 'Submit', none: 'No messages yet' }
  },
  zh: {
    nav: { home: '主页', chat: '群聊', announcements: '公告', messages: '留言' },
    home: { title: '服务器信息', version: '版本：', uptime: '运行时间：', quick: '快速链接', gotoChat: '进入群聊', gotoAnnouncements: '查看公告' },
    chat: { title: '群聊', send: '发送' },
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

  function loadServerInfo(){
    // Mocked data - in real use replace with fetch to API
    document.getElementById('server-version').textContent = '1.2.3';
    document.getElementById('server-uptime').textContent = '3 days 4 hours';
  }

  return { init: initLangButtons, loadServerInfo, translate: translatePage };
})();

// Messages feature removed as requested

const Chat = (function(){
  const messagesEl = document.getElementById('messages');
  function addMessage(user, msg){
    const li = document.createElement('li');
    li.textContent = `${user}: ${msg}`;
    messagesEl.appendChild(li);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function init(){
    const form = document.getElementById('chat-form');
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const user = document.getElementById('username').value.trim();
      const msg = document.getElementById('message').value.trim();
      if (!user || !msg) return;
      addMessage(user, msg);
      form.reset();
    });
  }

  return { init };
})();

const Announcements = (function(){
  const perPage = 5;
  let page = 1;
  const data = Array.from({length:23}).map((_,i)=>({id:i+1,title:`公告 #${i+1}`,content:`这是第 ${i+1} 条公告` }));

  function render(){
    const list = document.getElementById('ann-list');
    const start = (page-1)*perPage; const items = data.slice(start,start+perPage);
    list.innerHTML = '';
    items.forEach(a=>{
      const div = document.createElement('div');
      div.className = 'ann-item';
      div.innerHTML = `<h3>${a.title}</h3><p>${a.content}</p>`;
      list.appendChild(div);
    });
    // also render preview if exists
    const preview = document.getElementById('ann-preview');
    if (preview){
      preview.innerHTML = '';
      data.slice(0,3).forEach(a=>{
        const d = document.createElement('div'); d.className='ann-item'; d.innerHTML = `<h3>${a.title}</h3><p>${a.content}</p>`; preview.appendChild(d);
      });
    }
    renderPagination();
  }

  function renderPagination(){
    const total = Math.ceil(data.length/perPage);
    const pg = document.getElementById('pagination');
    pg.innerHTML = '';
    for (let i=1;i<=total;i++){
      const btn = document.createElement('button');
      btn.textContent = i; if (i===page) btn.disabled = true;
      btn.addEventListener('click', ()=>{ page=i; render(); });
      pg.appendChild(btn);
    }
  }

  function init(){ render(); }
  return { init };
})();
