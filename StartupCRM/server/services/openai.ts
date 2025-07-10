import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "sk-default" 
});

export interface MessageGenerationRequest {
  clientName: string;
  company?: string;
  channel: "email" | "linkedin";
  messageType: "follow-up" | "introduction" | "proposal" | "check-in";
  context: string;
  tone: "professional" | "formal" | "casual" | "direct";
  lastInteraction?: string;
}

export interface GeneratedMessage {
  subject?: string;
  content: string;
  tone: string;
  suggestions?: string[];
}

export async function generateMessage(request: MessageGenerationRequest): Promise<GeneratedMessage> {
  try {
    const systemPrompt = `You are an expert sales and relationship management assistant. Generate personalized business messages based on the provided context. Always maintain professionalism while adapting to the specified tone and channel.

For email messages, include a subject line. For LinkedIn messages, focus on being concise and engaging.

Respond with JSON in this exact format:
{
  "subject": "subject line for emails only",
  "content": "the message content",
  "tone": "description of the tone used",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

    const userPrompt = `Generate a ${request.messageType} message for ${request.channel} with the following details:

Client: ${request.clientName}${request.company ? ` from ${request.company}` : ''}
Message Type: ${request.messageType}
Channel: ${request.channel}
Tone: ${request.tone}
Context: ${request.context}
${request.lastInteraction ? `Last Interaction: ${request.lastInteraction}` : ''}

Guidelines:
- ${request.channel === 'email' ? 'Include a compelling subject line and professional email format' : 'Keep it concise (under 300 characters) and LinkedIn-appropriate'}
- Tone should be ${request.tone} but always professional
- Personalize based on the context provided
- Include a clear call-to-action
- Make it engaging and likely to get a response`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      subject: request.channel === 'email' ? result.subject : undefined,
      content: result.content,
      tone: result.tone,
      suggestions: result.suggestions || []
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate message: ' + (error as Error).message);
  }
}

export async function optimizeMessage(
  originalMessage: string, 
  channel: "email" | "linkedin",
  targetTone?: string
): Promise<{ optimizedContent: string; improvements: string[] }> {
  try {
    const systemPrompt = `You are an expert in optimizing business communications. Improve the given message for better engagement and response rates while maintaining the core message.

Respond with JSON in this format:
{
  "optimizedContent": "the improved message",
  "improvements": ["list of improvements made"]
}`;

    const userPrompt = `Optimize this ${channel} message${targetTone ? ` for a ${targetTone} tone` : ''}:

Original Message:
${originalMessage}

Guidelines:
- ${channel === 'email' ? 'Optimize for email best practices' : 'Keep under 300 characters for LinkedIn'}
- Improve clarity and engagement
- Enhance call-to-action
- Maintain professional tone
- Make it more likely to get a response`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      optimizedContent: result.optimizedContent,
      improvements: result.improvements || []
    };
  } catch (error) {
    console.error('OpenAI optimization error:', error);
    throw new Error('Failed to optimize message: ' + (error as Error).message);
  }
}
