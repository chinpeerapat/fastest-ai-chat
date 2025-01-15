export const dynamic = 'force-dynamic'; // always run dynamically

const DEFAULT_MODEL = "gpt-4o-mini"

type Message = {
    id?: number,
    role: 'assistant' | 'user' | 'system' | 'developer',
    content: string
    name?: string
}


const mainPropmpt = {
    role: 'developer',
    name: 'Sonic',
    content: 'Your name is Sonic and you are the fastest AI on the planet, make sure to always response with proper markdown.'
} as const

const apiUrl = 'https://api.openai.com/v1/chat/completions'

export async function POST(request: Request) {
    const body = await request.json()
    const messages = body.messages as unknown as Message[]
    const fullMessages = [mainPropmpt, ...messages]

    const apiDataBody = {
        model: DEFAULT_MODEL,
        messages: fullMessages,
        stream: true
    }

    const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify(apiDataBody),
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        }
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
                            try {
                                const jsonData = JSON.parse(jsonString);
                                const content = jsonData.choices[0].delta.content;

                                if (content) {
                                    const chunks = content.match(/[\w]+|\s+|[^\w\s]/g) || [];
                                    chunks.forEach((chunk: string) => {
                                        const formattedChunk = `0:"${chunk}"\n`;
                                        controller.enqueue(encoder.encode(formattedChunk));
                                    });
                                }
                            } catch (e) {
                                console.error('Error parsing JSON: ', e);
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
