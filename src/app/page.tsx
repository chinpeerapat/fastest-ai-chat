'use client'

import MarkdownRenderer from '@/components/markdown'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useRef, useEffect, useCallback } from 'react'

type Message = {
    id: number
    role: 'user' | 'assistant'
    content: string
    isTyping?: boolean
}

const useStreamHandler = (initialMessages: Message[] = []) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const bufferRef = useRef<string>('');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Function to flush buffer and update state
    const flushBuffer = useCallback((messageId: number) => {
        if (bufferRef.current) {
            setMessages(prev => prev.map(m =>
                m.id === messageId
                    ? {
                        ...m,
                        content: m.content + bufferRef.current
                    }
                    : m
            ));
            bufferRef.current = '';
        }
    }, []);

    const handleOnMessageReceive = useCallback(async (newMessages: Message[]) => {
        setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const messagesToAdd = newMessages.filter(m => !existingIds.has(m.id));
            return [...prev, ...messagesToAdd];
        });

        try {
            const typingMessage = newMessages.find(m => m.isTyping);
            if (!typingMessage) return;

            for await (let chunk of getStreamedMessageResponse(newMessages)) {
                chunk = chunk.replaceAll('0:', '').replace('\n', '');
                bufferRef.current += chunk;

                // Clear any existing timeout
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                if (
                    bufferRef.current.includes('\n\n') ||
                    bufferRef.current.length > 100
                ) {
                    flushBuffer(typingMessage.id);
                } else {
                    timeoutRef.current = setTimeout(() => {
                        flushBuffer(typingMessage.id);
                    }, 50);
                }
            }

            // Final flush and cleanup
            flushBuffer(typingMessage.id);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Mark message as no longer typing
            setMessages(prev =>
                prev.map(m => ({
                    ...m,
                    isTyping: false
                }))
            );
        } catch (error) {
            console.error('Error processing message stream:', error);
            // Handle error appropriately
        }
    }, [flushBuffer]);

    return {
        messages,
        handleOnMessageReceive
    };
};

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
    const [input, setInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const { messages, handleOnMessageReceive } = useStreamHandler();
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
        handleOnMessageReceive(newMessages)
        setInput('')
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    return (
        <div className="flex flex-col h-screen bg-gray-950">
            <header className="bg-gray-900 border-b border-gray-800 py-4 px-4">
                <h1 className="text-xl font-semibold text-center text-gray-100">ChatGPT Clone</h1>
            </header>
            <Card className="flex-grow m-4 flex flex-col bg-gray-900 border-gray-800">
                <CardContent className="flex-grow p-4">
                    <ScrollArea className="h-full pr-4">
                        {messages.map((message) => (
                            <div key={message.id} className="mb-6 flex items-start">
                                <Avatar className="mr-3 w-8 h-8">
                                    <AvatarImage
                                        src={message.role === 'user' ? '/user-avatar.png' : '/ai-avatar.png'}
                                        className="bg-gray-800"
                                    />
                                    <AvatarFallback className="bg-gray-800 text-gray-200">
                                        {message.role === 'user' ? 'U' : 'AI'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <p className="font-medium text-gray-200 mb-1">
                                        {message.role === 'user' ? 'You' : 'AI'}
                                    </p>
                                    <div className="text-gray-300">
                                        <MarkdownRenderer content={message.content} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </ScrollArea>
                </CardContent>
                <CardFooter className="border-t border-gray-800 p-4">
                    <form onSubmit={onSubmit} className="flex w-full space-x-2">
                        <Input
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type your message..."
                            className="flex-grow bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400 focus-visible:ring-gray-700"
                        />
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={!input.trim()}
                        >
                            Send
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    )
}

