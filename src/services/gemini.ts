import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const chatModel = "gemini-3-flash-preview";

export interface Message {
  role: "user" | "model";
  text: string;
}

export async function* sendMessageStream(history: Message[], message: string) {
  const chat = ai.chats.create({
    model: chatModel,
    config: {
      systemInstruction: "Вы — профессиональный ассистент куратора. Ваша роль — помогать в организации выставок, исследовании предметов искусства, планировании образовательных программ и управлении коллекциями. Вы должны давать экспертные советы, помогать с написанием текстов для экспликаций и пресс-релизов, а также предлагать идеи для концепций выставок. Отвечайте вежливо, профессионально и структурированно, используя русский язык.",
    },
    history: history.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    })),
  });

  const result = await chat.sendMessageStream({ message });
  
  for await (const chunk of result) {
    yield chunk.text || "";
  }
}
