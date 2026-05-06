import { useState, useCallback } from "react";
import type { ChatMessage } from "@/types";

const API_URL = "/api/chat";

interface UseChatReturn {
  messages: ChatMessage[];
  isGenerating: boolean;
  sendMessage: (text: string) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const currentMessages = [...messages, userMessage];

    setMessages(currentMessages);
    setIsGenerating(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        role: "ai",
        content: data.chat_response || "",
        data: {
          itinerary: data.itinerary_data,
          discoveryData: data.enriched_data,
          carbonData: data.carbon_data,
          ecoActivity: data.eco_activity,
          ecoComparisons: data.eco_comparisons,
          recommendedActivities: data.recommended_activities,
        },
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Maaf, terjadi kesalahan. Silakan coba lagi.",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }, [messages]);

  return {
    messages,
    isGenerating,
    sendMessage,
    setMessages,
  };
}