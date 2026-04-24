import { useState } from "react";
import api from "../services/api";

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const userId = localStorage.getItem("userId");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.toLowerCase();
    let botReply = "I didn't understand.";

    try {
      if (userMsg.includes("total")) {
        const res = await api.get(`/dashboard/${userId}`);
        botReply = `Total spent: ₹${res.data.totalAmount}`;
      } 
      else if (userMsg.includes("budget")) {
        const res = await api.get(`/budgets/user/${userId}?month=2026-04`);
        botReply = res.data.map(b =>
          `${b.category}: ₹${b.spent} / ₹${b.monthlyLimit}`
        ).join("\n");
      } 
      else if (userMsg.includes("top")) {
        const res = await api.get(`/dashboard/top-expenses/${userId}`);
        botReply = "Top expenses fetched (check dashboard)";
      }
    } catch {
      botReply = "Error fetching data.";
    }

    setMessages(prev => [
      ...prev,
      { sender: "user", text: input },
      { sender: "bot", text: botReply }
    ]);

    setInput("");
  };

  return (
    <>
      {/* 🔵 Floating Button */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "#4f7cff",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "24px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          zIndex: 999
        }}
      >
        💬
      </div>

      {/* 💬 Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "300px",
            height: "400px",
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            zIndex: 999
          }}
        >
          <div style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
            <b>Budget Assistant</b>
          </div>

          <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: "8px" }}>
                <b>{msg.sender}:</b> {msg.text}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", borderTop: "1px solid #eee" }}>
            <input
              style={{ flex: 1, padding: "8px", border: "none" }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBot;