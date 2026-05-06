"use client";

import { useState } from "react";
import { Send, Mic, Waves, Zap } from "lucide-react";
import { cn } from "@/utils";
import type { ChatMessage } from "@/types";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  inputValue: string;
  isGenerating: boolean;
  onSendMessage: (text: string) => void;
  onInputChange: (value: string) => void;
}

export function ChatInterface({
  messages,
  inputValue,
  isGenerating,
  onSendMessage,
  onInputChange,
}: ChatInterfaceProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] px-4 py-3 rounded-2xl",
                msg.role === "user"
                  ? "bg-primary text-white rounded-br-md"
                  : "bg-surface text-text-primary rounded-bl-md"
              )}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-surface px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-text-secondary/40 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-text-secondary/40 rounded-full animate-bounce delay-75" />
                <span className="w-2 h-2 bg-text-secondary/40 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button className="p-2 text-text-secondary hover:text-primary transition-colors">
              <Mic size={20} />
            </button>
            <button className="p-2 text-text-secondary hover:text-primary transition-colors">
              <Waves size={20} />
            </button>
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSendMessage(inputValue)}
            placeholder="Tulis pesan..."
            className="flex-1 bg-surface px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={() => onSendMessage(inputValue)}
            disabled={!inputValue.trim() || isGenerating}
            className={cn(
              "p-2.5 rounded-xl transition-all",
              inputValue.trim()
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary"
            )}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}