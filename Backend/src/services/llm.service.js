import groq from "../config/groq.js";

const GROQ_MODEL = "llama3-70b-8192";

export const generateAIResponseService = async (prompt) => {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: GROQ_MODEL,
  });

  return completion.choices[0].message.content;
};

export const generateStructuredResponseService = async (systemPrompt, userPrompt) => {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    model: GROQ_MODEL,
    temperature: 0.7,
    max_tokens: 2048,
  });

  try {
    const content = completion.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to parse structured response:", error);
    throw new Error("LLM returned invalid JSON");
  }
};

export const generateReplyService = async (emailContext, tone = "professional") => {
  const systemPrompt = `You are a professional customer support AI. Draft a concise, empathetic reply in ${tone} tone.`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: emailContext,
      },
    ],
    model: GROQ_MODEL,
    temperature: 0.5,
    max_tokens: 1024,
  });

  return completion.choices[0].message.content;
};