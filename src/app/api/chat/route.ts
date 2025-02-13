import { FastJson } from 'fast-json'

export const dynamic = 'force-dynamic'; // always run dynamically

const DEFAULT_MODEL = "gpt-4o-mini"

type Message = {
    id?: number,
    role: 'assistant' | 'user' | 'system' | 'developer',
    content: string
    name?: string
}


const mainPropmpt = {
    role: 'system',
    name: 'Sonic',
    content: 'Please complete the tasks or answer the questions provided with a focus on demonstrating general intelligence. Utilize reasoning, knowledge, and language skills to provide clear, logical, and well-structured responses.\n\n# Steps\n\n1. **Understand the Inquiry**: Carefully read and comprehend the question or task to ensure an accurate and relevant response.\n2. **Apply Knowledge**: Use your general knowledge base to inform your explanation or answer, drawing from multiple areas if applicable.\n3. **Logical Reasoning**: Analyze the question or task logically, considering different aspects or perspectives before arriving at a conclusion.\n4. **Response Construction**: Clearly articulate your response, using proper grammar and structure to convey your messages effectively.\n\n# Output Format\n\nProvide responses in a coherent paragraph format unless otherwise specified. Ensure to maintain clarity, logic, and conciseness in your response. \n\n# Notes\n\n- Provide reasoning and explanations before delivering a final conclusion.\n- Focus on clarity and logical coherence in all responses.\n- Avoid inserting unnecessary information that does not directly contribute to answering the main inquiry.'
} as const

const apiUrl = 'https://api.openai.com/v1/chat/completions'

export async function POST(request: Request) {
    const body = await request.json()
    const messages = body.messages as unknown as Message[]
    const fullMessages = [mainPropmpt, ...messages]

    const apiDataBody = {
        model: DEFAULT_MODEL,
        messages: fullMessages,
        stream: true,
        temperature: 0.7
    }

    const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify(apiDataBody),
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'Connection': 'keep-alive'
        },
        keepalive: true
    })

    const reader = apiResponse.body!.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;

    const encoder = new TextEncoder();

    const responseStream = new ReadableStream({
        async start(controller) {
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;

                if (done) {
                    controller.close()
                    return;
                }

                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    chunk.split('\n').forEach(line => {
                        if (line.startsWith('data:')) {
                            const jsonString = line.replace('data:', '').trim();
                            if (jsonString === '[DONE]') {
                                return
                            }
                            const jsonData = JSON.parse(jsonString);
                            const content = jsonData.choices[0].delta.content;

                            if (content) {
                                const chunks = content.match(/[\w]+|\s+|[^\w\s]/g) || [];
                                chunks.forEach((chunk: string) => {
                                    const formattedChunk = `0:"${chunk}"\n`;
                                    controller.enqueue(encoder.encode(formattedChunk));
                                });
                            }
                        }
                    });
                }
            }
        }
    })

    return new Response(responseStream, {
        headers: {
            'content-type': 'text/html; charset=utf-8'
        }
    })
}
