import { useState, useEffect, useRef } from "react";

const BASE_URL = "https://shopzone-server-hisq.onrender.com/api";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! 👋 I'm ShopZone's AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I'm having trouble connecting. Please try again!" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: "1.5rem", right: "1.5rem",
          width: 56, height: 56, borderRadius: "50%",
          background: open ? "#374151" : "#f97316",
          color: "white", border: "none", cursor: "pointer",
          fontSize: "1.5rem", display: "flex", alignItems: "center",
          justifyContent: "center", boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
          zIndex: 1000, transition: "all 0.3s"
        }}
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat Window */}
      {open && (
        <div style={{
          position: "fixed", bottom: "5rem", right: "1.5rem",
          width: 340, height: 480, background: "white",
          borderRadius: "1rem", boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", zIndex: 999,
          overflow: "hidden", border: "1px solid #f0f0f0"
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(to right, #f97316, #facc15)",
            padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem"
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.2rem"
            }}>🤖</div>
            <div>
              <p style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", margin: 0 }}>ShopZone AI</p>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.7rem", margin: 0 }}>● Online</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "1rem",
            display: "flex", flexDirection: "column", gap: "0.75rem"
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
              }}>
                <div style={{
                  maxWidth: "80%",
                  background: msg.role === "user" ? "#f97316" : "#f3f4f6",
                  color: msg.role === "user" ? "white" : "#1a1a1a",
                  padding: "0.6rem 0.9rem",
                  borderRadius: msg.role === "user" ? "1rem 1rem 0.2rem 1rem" : "1rem 1rem 1rem 0.2rem",
                  fontSize: "0.82rem",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap"
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  background: "#f3f4f6", padding: "0.6rem 0.9rem",
                  borderRadius: "1rem 1rem 1rem 0.2rem", fontSize: "0.82rem"
                }}>
                  <span style={{ animation: "pulse 1s infinite" }}>Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div style={{ padding: "0 1rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {["📦 Products", "💳 Payments", "🚚 Shipping", "📞 Help"].map(s => (
                <button key={s} onClick={() => {
                  setInput(s.split(" ").slice(1).join(" "));
                }} style={{
                  background: "#fff7ed", border: "1px solid #fed7aa",
                  color: "#f97316", padding: "0.3rem 0.6rem",
                  borderRadius: "1rem", fontSize: "0.72rem",
                  cursor: "pointer", fontWeight: 600
                }}>{s}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={sendMessage} style={{
            padding: "0.75rem", borderTop: "1px solid #f0f0f0",
            display: "flex", gap: "0.5rem"
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..."
              style={{
                flex: 1, border: "1px solid #e5e7eb",
                borderRadius: "2rem", padding: "0.5rem 1rem",
                fontSize: "0.82rem", outline: "none"
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: input.trim() ? "#f97316" : "#e5e7eb",
                color: "white", border: "none",
                borderRadius: "50%", width: 36, height: 36,
                cursor: input.trim() ? "pointer" : "not-allowed",
                fontSize: "1rem", transition: "all 0.2s"
              }}
            >→</button>
          </form>
        </div>
      )}
    </>
  );
}
