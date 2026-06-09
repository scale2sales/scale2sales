(function () {
  const config = window.Scale2SalesConfig || {};
  const projectId = config.projectId;
  const appUrl = config.appUrl || 'https://scale2sales.com';
  const position = config.position || 'right';
  const primaryColor = config.primaryColor || '#6366f1';
  const greeting = config.greeting || 'Hi! How can I help you today?';
  const widgetName = config.widgetName || 'AI Assistant';
  const widgetSubtitle = config.widgetSubtitle || 'Online · replies instantly';

  if (!projectId) { console.warn('Scale2Sales: projectId is required'); return; }

  const isRight = position === 'right' || position === 'bottom-right';

  const style = document.createElement('style');
  style.textContent = [
    '#s2s-btn-wrap { position: fixed; ' + (isRight ? 'right: 24px' : 'left: 24px') + '; bottom: 24px; z-index: 999998; }',
    '#s2s-widget-btn { width: 56px; height: 56px; border-radius: 50%; background: ' + primaryColor + '; border: none; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.18); display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }',
    '#s2s-widget-btn:hover { transform: scale(1.08); }',
    '#s2s-widget-btn svg { width: 26px; height: 26px; }',
    '#s2s-chat-box { position: fixed; ' + (isRight ? 'right: 24px' : 'left: 24px') + '; bottom: 92px; width: 360px; height: 520px; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.18); z-index: 999999; display: none; background: white; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, sans-serif; flex-direction: column; }',
    '#s2s-chat-box.open { display: flex; }',
    '#s2s-chat-header { padding: 14px 16px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }',
    '#s2s-chat-header .avatar { width: 36px; height: 36px; border-radius: 50%; background: ' + primaryColor + '22; display: flex; align-items: center; justify-content: center; }',
    '#s2s-chat-header h3 { font-size: 14px; font-weight: 600; color: #111; margin: 0; }',
    '#s2s-chat-header p { font-size: 12px; color: #888; margin: 2px 0 0; }',
    '#s2s-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }',
    '.s2s-msg { display: flex; gap: 8px; align-items: flex-end; }',
    '.s2s-msg.user { flex-direction: row-reverse; }',
    '.s2s-bubble { max-width: 80%; padding: 10px 14px; border-radius: 18px; font-size: 13px; line-height: 1.6; }',
    '.s2s-msg.bot .s2s-bubble { background: #f4f4f5; color: #111; border-bottom-left-radius: 4px; }',
    '.s2s-msg.user .s2s-bubble { background: ' + primaryColor + '; color: white; border-bottom-right-radius: 4px; }',
    '.s2s-bot-av { width: 28px; height: 28px; border-radius: 50%; background: ' + primaryColor + '; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }',
    '#s2s-input-area { padding: 12px; border-top: 1px solid #f0f0f0; display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0; }',
    '#s2s-input-wrap { flex: 1; background: #f4f4f5; border-radius: 20px; padding: 8px 14px; }',
    '#s2s-textarea { width: 100%; border: none; background: transparent; resize: none; font-size: 13px; font-family: inherit; outline: none; max-height: 80px; color: #111; display: block; }',
    '#s2s-send { width: 36px; height: 36px; border-radius: 50%; border: none; background: ' + primaryColor + '; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }',
    '#s2s-send:disabled { opacity: 0.4; cursor: not-allowed; }',
    '#s2s-send svg { width: 16px; height: 16px; }',
    '.s2s-dot { width: 6px; height: 6px; background: #aaa; border-radius: 50%; animation: s2sBounce 1.2s infinite; display: inline-block; margin: 0 2px; }',
    '.s2s-dot:nth-child(2) { animation-delay: 0.2s; }',
    '.s2s-dot:nth-child(3) { animation-delay: 0.4s; }',
    '@keyframes s2sBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }',
    '#s2s-powered { text-align: center; font-size: 10px; color: #ccc; padding: 4px 0 8px; flex-shrink: 0; }',
    '#s2s-powered a { color: #ccc; text-decoration: none; }',
    '#s2s-unread { position: absolute; top: -2px; right: -2px; width: 18px; height: 18px; background: #ef4444; border-radius: 50%; font-size: 10px; font-weight: 700; color: white; display: none; align-items: center; justify-content: center; }',
    '@media(max-width:480px){#s2s-chat-box{width:100vw;height:100vh;bottom:0;right:0;left:0;border-radius:0;}}'
  ].join('\n');
  document.head.appendChild(style);

  const btnWrap = document.createElement('div');
  btnWrap.id = 's2s-btn-wrap';
  btnWrap.innerHTML = '<button id="s2s-widget-btn" aria-label="Open chat"><svg id="s2s-ic-chat" fill="none" stroke="white" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg><svg id="s2s-ic-close" style="display:none" fill="none" stroke="white" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button><div id="s2s-unread">1</div>';
  document.body.appendChild(btnWrap);

  const chatBox = document.createElement('div');
  chatBox.id = 's2s-chat-box';
  chatBox.innerHTML = '<div id="s2s-chat-header"><div class="avatar"><svg width="20" height="20" fill="none" stroke="' + primaryColor + '" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg></div><div><h3>' + widgetName + '</h3><p>&#9679; ' + widgetSubtitle + '</p></div></div><div id="s2s-messages"></div><div id="s2s-input-area"><div id="s2s-input-wrap"><textarea id="s2s-textarea" rows="1" placeholder="Type a message..."></textarea></div><button id="s2s-send" disabled><svg fill="none" stroke="white" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></button></div><div id="s2s-powered">Powered by <a href="https://scale2sales.com" target="_blank">Scale2Sales</a></div>';
  document.body.appendChild(chatBox);

  const messagesEl = document.getElementById('s2s-messages');
  const textarea = document.getElementById('s2s-textarea');
  const sendBtn = document.getElementById('s2s-send');
  const unread = document.getElementById('s2s-unread');
  let conversationId = null;
  let isLoading = false;
  let isOpen = false;

  function renderMarkdown(text) {
    if (!text) return '';
    var t = text;
    t = t.replace(/^## \*\*(.+?)\*\*$/gm, '<h3 style="font-size:13px;font-weight:700;margin:10px 0 4px;color:#111;display:block;">$1</h3>');
    t = t.replace(/^## (.+)$/gm, '<h3 style="font-size:13px;font-weight:700;margin:10px 0 4px;color:#111;display:block;">$1</h3>');
    t = t.replace(/^### (.+)$/gm, '<h4 style="font-size:12px;font-weight:700;margin:8px 0 3px;color:#111;display:block;">$1</h4>');
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
    t = t.replace(/^- (.+)$/gm, '<li style="margin:3px 0;padding-left:4px;">$1</li>');
    t = t.replace(/^\d+\. (.+)$/gm, '<li style="margin:3px 0;padding-left:4px;list-style:decimal;">$1</li>');
    t = t.replace(/\n\n/g, '<br>');
    t = t.replace(/\n/g, ' ');
    return t;
  }

  addMsg('bot', greeting);
  setTimeout(function() { if (!isOpen) { unread.style.display = 'flex'; } }, 3000);

  document.getElementById('s2s-widget-btn').addEventListener('click', function() {
    isOpen = !isOpen;
    chatBox.classList.toggle('open', isOpen);
    document.getElementById('s2s-ic-chat').style.display = isOpen ? 'none' : 'block';
    document.getElementById('s2s-ic-close').style.display = isOpen ? 'block' : 'none';
    if (isOpen) { unread.style.display = 'none'; textarea.focus(); }
  });

  textarea.addEventListener('input', function() {
    sendBtn.disabled = !textarea.value.trim() || isLoading;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px';
  });

  textarea.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!sendBtn.disabled) send(); }
  });

  sendBtn.addEventListener('click', send);

  function addMsg(role, content) {
    var wrap = document.createElement('div');
    wrap.className = 's2s-msg ' + role;
    var botAv = '<div class="s2s-bot-av"><svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg></div>';
    if (role === 'bot') {
      wrap.innerHTML = botAv + '<div class="s2s-bubble">' + renderMarkdown(content) + '</div>';
    } else {
      wrap.innerHTML = '<div class="s2s-bubble">' + content.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div>';
    }
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrap.querySelector('.s2s-bubble');
  }

  function addTyping() {
    var wrap = document.createElement('div');
    wrap.className = 's2s-msg bot';
    wrap.id = 's2s-typing';
    var botAv = '<div class="s2s-bot-av"><svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg></div>';
    wrap.innerHTML = botAv + '<div class="s2s-bubble"><span class="s2s-dot"></span><span class="s2s-dot"></span><span class="s2s-dot"></span></div>';
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrap;
  }

  async function send() {
    var text = textarea.value.trim();
    if (!text || isLoading) return;
    isLoading = true;
    textarea.value = '';
    textarea.style.height = 'auto';
    sendBtn.disabled = true;
    addMsg('user', text);
    var typing = addTyping();

    try {
      var res = await fetch(appUrl + '/api/widget/' + projectId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversationId: conversationId }),
      });
      typing.remove();
      if (!res.ok) { addMsg('bot', 'Sorry, something went wrong. Please try again.'); isLoading = false; return; }
      var newConvId = res.headers.get('X-Conversation-Id');
      if (newConvId) conversationId = newConvId;
      var bubble = addMsg('bot', '');
      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var full = '';
      while (true) {
        var result = await reader.read();
        if (result.done) break;
        var lines = decoder.decode(result.value, { stream: true }).split('\n');
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          if (line.indexOf('data: ') === 0) {
            var data = line.slice(6);
            if (data === '[DONE]') break;
            try { var p = JSON.parse(data); if (p.delta) { full += p.delta; bubble.innerHTML = renderMarkdown(full); messagesEl.scrollTop = messagesEl.scrollHeight; } } catch(e) {}
          }
        }
      }
    } catch(err) { typing.remove(); addMsg('bot', 'Connection error. Please try again.'); }
    isLoading = false;
    sendBtn.disabled = !textarea.value.trim();
  }
})();
