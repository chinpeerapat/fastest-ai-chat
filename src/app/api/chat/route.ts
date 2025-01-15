import OpenAI from 'openai'
import { z } from 'zod'

export const dynamic = 'force-dynamic'; // always run dynamically

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    project: process.env.OPENAI_PROJECT_ID,
})

const DEFAULT_MODEL = "gpt-4o-mini"

const messageSchema = z.object({
    id: z.number(),
    role: z.enum(["user", "assistant"]),
    content: z.string(),
})

// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const messagesSchema = z.array(messageSchema)

export async function POST(request: Request) {
    const body = await request.json()
    const messages = body.messages

    const parsedMessages = messagesSchema.parse(messages)

    const stream = await openai.chat.completions.create({
        stream: true,
        model: DEFAULT_MODEL,
        messages: parsedMessages
    })

    const encoder = new TextEncoder();

    const responseStream = new ReadableStream({
        async start(controller) {
            for await (const chunk of stream) {
                const content = chunk.choices[0].delta.content
                if (content) {
                    controller.enqueue(encoder.encode(content))
                }
            }
            controller.close()
        }
    })

    return new Response(responseStream, {
        headers: {
            'content-type': 'text/html; charset=utf-8'
        }
    })
}
