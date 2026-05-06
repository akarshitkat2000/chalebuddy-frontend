// src/components/BuddyBot.jsx
import { useState } from "react";
import { BOT_RESPONSES } from "../data";

const QUICK_QUESTIONS = [
  "Guide kaise dhundhu?",
  "Local food?",
  "Stay tips?",
  "Ticket price?",
  "Route suggest karo",
];

export default function BuddyBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { type: "bot", text: "Namaste! 🙏 Kuch poochna hai? Guide dhundna, trip plan, ya stay/transport?" },
  ]);
  const [input, setInput] = useState("");

  const send = (text) => {
    const q = text || input;
    if (!q.trim()) return;
    const key = q.toLowerCase();
    const reply = BOT_RESPONSES[key] || BOT_RESPONSES.default;
    setMsgs((m) => [...m, { type: "user", text: q }, { type: "bot", text: reply }]);
    setInput("");
  };

  return (
    <>
      <button className="bot-fab" onClick={() => setOpen((o) => !o)} aria-label="Open Buddy Bot">
        🤖
      </button>

      {open && (
        <div className="bot-window">
          <div className="bot-header">
            <div className="bot-header-left">
              <div className="bot-avatar">🧭</div>
              <div>
                <div className="bot-name">Buddy Bot</div>
                <div className="bot-status">Online — yahan hun!</div>
              </div>
            </div>
            <button className="bot-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="bot-messages">
            {msgs.map((m, i) => (
              <div key={i} className={m.type === "bot" ? "bot-msg-bot" : "bot-msg-user"}>
                <div className="bot-bubble">{m.text}</div>
              </div>
            ))}
          </div>

          <div className="bot-quick">
            {QUICK_QUESTIONS.map((q) => (
              <button key={q} className="bot-qbtn" onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>

          <div className="bot-input-row">
            <input
              className="bot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Kuch poocho..."
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="bot-send" onClick={() => send()}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}
