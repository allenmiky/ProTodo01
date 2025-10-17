// src/components/TaskDescription.jsx
import React, { useState } from "react";

export default function TaskDescription({ desc }) {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 80; // ✅ ek line approx.

  if (!desc) return null;

  const isLong = desc.length > maxLength;
  const displayText = expanded ? desc : desc.slice(0, maxLength) + (isLong ? "..." : "");

  return (
    <div className="mt-1 text-sm text-gray-400">
      <p className="break-words whitespace-pre-wrap">{displayText}</p>
      {isLong && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // 🔒 prevent parent click (edit modal open)
            setExpanded(!expanded);
          }}
          className="text-indigo-400 text-xs font-medium hover:underline mt-1"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
}
