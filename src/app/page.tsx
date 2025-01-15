'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useRef, useEffect, useTransition } from 'react'

type Message = {
    id: number
    role: 'user' | 'assistant'
    content: string
    isTyping?: boolean
}

async function* getStreamedMessageResponse(messages: Message[]) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages }),
    })

    if (!response.body) {
        throw new Error('does not work')
    }

    for await (const chunk of response.body) {
        const utf8Content = new TextDecoder('utf-8').decode(chunk)
        yield utf8Content
    }
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [isPending, startTransition] = useTransition()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleOnMessageReceive = async (newMessages: Message[]) => {
        let responseMessages = [...messages]
        for await (const message of getStreamedMessageResponse(newMessages)) {
            responseMessages = newMessages.map((m) => {
                const updatedTypingMessage = m.isTyping ? responseMessages.find(e => e.id == m.id) : null
                if (updatedTypingMessage) {
                    return {
                        ...updatedTypingMessage,
                        content: updatedTypingMessage.content + message,
                    }
                } else {
                    return m
                }
            }) as Message[]
            setMessages(responseMessages)
        }

        setMessages(prev => {
            return prev.map(e => ({
                ...e,
                isTyping: false
            }))
        })
    }

    useEffect(scrollToBottom, [messages])

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const newMessages = [
            ...messages,
            {
                id: Date.now(),
                role: 'user',
                content: input,
                isTyping: false,
            },
            {
                id: Date.now() + 1,
                role: 'assistant',
                content: '',
                isTyping: true,
            }
        ] as Message[]
        startTransition(() => {
            setMessages(newMessages);
            setInput('')
        })
    }

    useEffect(() => {
        if (!isPending) {
            if (messages.length) {
                handleOnMessageReceive(messages)
            }
        }
    }, [isPending])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="bg-white shadow-sm py-4">
                <h1 className="text-xl font-semibold text-center">ChatGPT Clone</h1>
            </header>
            <Card className="flex-grow m-4 flex flex-col">
                <CardContent className="flex-grow p-4">
                    <ScrollArea className="h-full pr-4">
                        {messages.map((message) => (
                            <div key={message.id} className="mb-4 flex items-start">
                                <Avatar className="mr-2">
                                    <AvatarImage src={message.role === 'user' ? '/user-avatar.png' : '/ai-avatar.png'} />
                                    <AvatarFallback>{message.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <p className="font-semibold mb-1">{message.role === 'user' ? 'You' : 'AI'}</p>
                                    <p className="text-gray-700">{message.content}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </ScrollArea>
                </CardContent>
                <CardFooter>
                    <form onSubmit={onSubmit} className="flex w-full space-x-2">
                        <Input
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type your message..."
                            className="flex-grow"
                        />
                        <Button type="submit">Send</Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    )
}

