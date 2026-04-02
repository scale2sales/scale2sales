// Scale2Sales Chat Widget
// This file is loaded on the client's website
(function () {
  const config = window.Scale2SalesConfig || {};
  const projectId = config.projectId;
  const appUrl = config.appUrl || 'https://scale2sales.vercel.app';
  const position = config.position || 'bottom-right';
  const primaryColor = config.primaryColor || '#6366f1';
  const greeting = config.greeting || 'Hi! How can I help you today?';

  if (!projectId) {
    console.warn('Scale2Sales: projectId is required');
    return;
  }

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #s2s-widget-btn {
      position: fixed;
      ${position === 'bottom-right' ? 'right: 24px;' : 'left: 24px;'}
      bottom: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${primaryColor};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999998;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #s2s-widget-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 24px rgba(0,0,0,0.22);
    }
    #s2s-widget-btn svg { width: 26px; height: 26px; }
    #s2s-widget-frame {
      position: fixed;
      ${position === 'bottom-right' ? 'right: 24px;' : 'left: 24px;'}
      bottom: 92px;
      width: 380px;
      height: 560px;
      border-radius: 16px;
      border: none;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      z-index: 999999;
      display: none;
      background: white;
      overflow: hidden;
    }
    #s2s-widget-frame.open { display: block; }
    #s2s-unread-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 18px;
      height: 18px;
      background: #ef4444;
      border-radius: 50%;
      font-size: 10px;
      font-weight: 700;
      color: white;
      display: none;
      align-items: center;
      justify-content: center;
      font-family: sans-serif;
    }
    #s2s-btn-wrap { position: fixed; ${position === 'bottom-right' ? 'right: 24px;' : 'left: 24px;'} bottom: 24px; z-index: 999998; }
    @media (max-width: 480px) {
      #s2s-widget-frame {
        width: 100vw;
        height: 100vh;
        bottom: 0;
        right: 0;
        left: 0;
        border-radius: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Chat button
  const btnWrap = document.createElement('div');
  btnWrap.id = 's2s-btn-wrap';
  btnWrap.innerHTML = `
    <button id="s2s-widget-btn" aria-label="Open chat">
      <svg id="s2s-icon-chat" fill="none" stroke="white" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
      </svg>
      <svg id="s2s-icon-close" style="display:none" fill="none" stroke="white" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
    <div id="s2s-unread-badge">1</div>
  `;
  document.body.appendChild(btnWrap);

  // Iframe for chat
  const frame = document.createElement('iframe');
  frame.id = 's2s-widget-frame';
  frame.title = 'Chat Widget';
  frame.src = `${appUrl}/widget/${projectId}?greeting=${encodeURIComponent(greeting)}&color=${encodeURIComponent(primaryColor)}`;
  document.body.appendChild(frame);

  // Toggle logic
  let isOpen = false;
  let hasOpened = false;

  const btn = document.getElementById('s2s-widget-btn');
  const badge = document.getElementById('s2s-unread-badge');

  // Show unread badge after 3 seconds
  setTimeout(() => {
    if (!hasOpened) {
      badge.style.display = 'flex';
    }
  }, 3000);

  btn.addEventListener('click', () => {
    isOpen = !isOpen;
    frame.classList.toggle('open', isOpen);
    document.getElementById('s2s-icon-chat').style.display = isOpen ? 'none' : 'block';
    document.getElementById('s2s-icon-close').style.display = isOpen ? 'block' : 'none';
    if (isOpen) {
      hasOpened = true;
      badge.style.display = 'none';
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen && !btnWrap.contains(e.target) && !frame.contains(e.target)) {
      isOpen = false;
      frame.classList.remove('open');
      document.getElementById('s2s-icon-chat').style.display = 'block';
      document.getElementById('s2s-icon-close').style.display = 'none';
    }
  });
})();
