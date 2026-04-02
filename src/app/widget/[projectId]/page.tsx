// @ts-nocheck
import { getProject } from '@/lib/actions/projects'
import { notFound } from 'next/navigation'

export default async function WidgetPage({
  params,
  searchParams,
}: {
  params: { projectId: string }
  searchParams: { greeting?: string; color?: string }
}) {
  const project = await getProject(params.projectId)
  if (!project) notFound()

  const greeting = searchParams.greeting || `Hi! I'm the ${project.name} assistant. How can I help you?`
  const color = searchParams.color || '#6366f1'

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{project.name} Chat</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; height: 100vh; display: flex; flex-direction: column; background: white; }
          .header { padding: 14px 16px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0; }
          .avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${color}20; flex-shrink: 0; }
          .avatar svg { width: 20px; height: 20px; }
          .header-info h3 { font-size: 14px; font-weight: 600; color: #111; }
          .header-info p { font-size: 12px; color: #888; margin-top: 1px; }
          .online-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block; margin-right: 4px; }
          .messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
          .msg { display: flex; gap: 8px; align-items: flex-end; }
          .msg.user { flex-direction: row-reverse; }
          .bubble { max-width: 80%; padding: 10px 14px; border-radius: 18px; font-size: 13px; line-height: 1.5; }
          .msg.bot .bubble { background: #f4f4f5; color: #111; border-bottom-left-radius: 4px; }
          .msg.user .bubble { color: white; border-bottom-right-radius: 4px; background: ${color}; }
          .bot-avatar { width: 28px; height: 28px; border-radius: 50%; background: ${color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .bot-avatar svg { width: 16px; height: 16px; }
          .input-area { padding: 12px; border-top: 1px solid #f0f0f0; display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0; }
          .input-wrap { flex: 1; background: #f4f4f5; border-radius: 20px; padding: 8px 14px; display: flex; align-items: center; }
          textarea { flex: 1; border: none; background: transparent; resize: none; font-size: 13px; font-family: inherit; outline: none; max-height: 80px; color: #111; }
          textarea::placeholder { color: #aaa; }
          .send-btn { width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: ${color}; transition: opacity 0.2s; }
          .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
          .send-btn svg { width: 16px; height: 16px; }
          .typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px; }
          .dot { width: 6px; height: 6px; background: #aaa; border-radius: 50%; animation: bounce 1.2s infinite; }
          .dot:nth-child(2) { animation-delay: 0.2s; }
          .dot:nth-child(3) { animation-delay: 0.4s; }
          @keyframes bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
          .powered { text-align: center; font-size: 10px; color: #ccc; padding: 6px 0 10px; flex-shrink: 0; }
          .powered a { color: #ccc; text-decoration: none; }
          .powered a:hover { color: #999; }
        `}</style>
      </head>
      <body>
        <div class="header">
          <div class="avatar">
            <svg fill="none" stroke="${color}" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
          </div>
          <div class="header-info">
            <h3>{project.name}</h3>
            <p><span class="online-dot"></span>Online · replies instantly</p>
          </div>
        </div>

        <div class="messages" id="messages">
          <div class="msg bot">
            <div class="bot-avatar">
              <svg fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
            </div>
            <div class="bubble" id="greeting-bubble">{greeting}</div>
          </div>
        </div>

        <div class="input-area">
          <div class="input-wrap">
            <textarea id="input" rows="1" placeholder="Type a message…"></textarea>
          </div>
          <button class="send-btn" id="send-btn" disabled>
            <svg fill="none" stroke="white" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>

        <div class="powered">
          Powered by <a href="https://scale2sales.vercel.app" target="_blank">Scale2Sales</a>
        </div>

        <script>{`
          const projectId = '${params.projectId}';
          const appUrl = '${process.env.NEXT_PUBLIC_APP_URL || 'https://scale2sales.vercel.app'}';
          const messagesEl = document.getElementById('messages');
          const input = document.getElementById('input');
          const sendBtn = document.getElementById('send-btn');
          let conversationId = null;
          let isLoading = false;

          input.addEventListener('input', () => {
            sendBtn.disabled = !input.value.trim() || isLoading;
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 80) + 'px';
          });

          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!sendBtn.disabled) sendMessage();
            }
          });

          sendBtn.addEventListener('click', sendMessage);

          function addMessage(role, content, streaming) {
            const wrap = document.createElement('div');
            wrap.className = 'msg ' + role;
            if (role === 'bot') {
              wrap.innerHTML = '<div class="bot-avatar"><svg fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg></div><div class="bubble"></div>';
            } else {
              wrap.innerHTML = '<div class="bubble">' + escHtml(content) + '</div>';
            }
            messagesEl.appendChild(wrap);
            messagesEl.scrollTop = messagesEl.scrollHeight;
            return wrap.querySelector('.bubble');
          }

          function addTyping() {
            const wrap = document.createElement('div');
            wrap.className = 'msg bot';
            wrap.id = 'typing-indicator';
            wrap.innerHTML = '<div class="bot-avatar"><svg fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg></div><div class="bubble"><div class="typing"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>';
            messagesEl.appendChild(wrap);
            messagesEl.scrollTop = messagesEl.scrollHeight;
            return wrap;
          }

          function escHtml(str) {
            return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
          }

          async function sendMessage() {
            const text = input.value.trim();
            if (!text || isLoading) return;
            isLoading = true;
            input.value = '';
            input.style.height = 'auto';
            sendBtn.disabled = true;
            addMessage('user', text);
            const typing = addTyping();

            try {
              const res = await fetch(appUrl + '/api/widget/' + projectId, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, conversationId }),
              });

              typing.remove();

              if (!res.ok) {
                addMessage('bot', 'Sorry, something went wrong. Please try again.');
                isLoading = false;
                return;
              }

              const newConvId = res.headers.get('X-Conversation-Id');
              if (newConvId) conversationId = newConvId;

              const bubble = addMessage('bot', '');
              const reader = res.body.getReader();
              const decoder = new TextDecoder();
              let full = '';

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const lines = decoder.decode(value, { stream: true }).split('\\n');
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') break;
                    try {
                      const parsed = JSON.parse(data);
                      if (parsed.delta) {
                        full += parsed.delta;
                        bubble.textContent = full;
                        messagesEl.scrollTop = messagesEl.scrollHeight;
                      }
                    } catch {}
                  }
                }
              }
            } catch (err) {
              typing.remove();
              addMessage('bot', 'Connection error. Please try again.');
            }

            isLoading = false;
            sendBtn.disabled = !input.value.trim();
          }
        `}</script>
      </body>
    </html>
  )
}
