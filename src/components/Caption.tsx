import React from "react";

export const Caption: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      backgroundColor: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: 16,
      padding: "18px 32px",
      color: "#f8fafc",
      fontSize: 30,
      fontWeight: 600,
      fontFamily: "Inter, Arial, sans-serif",
      textAlign: "center",
      maxWidth: 800,
    }}
  >
    {text}
  </div>
);
