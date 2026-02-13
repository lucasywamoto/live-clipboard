import { useState, useRef, useEffect } from 'react'
import { useClipboard } from '../context/ClipboardContext'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { toast } from 'sonner'
import {
    Copy,
    Check,
    Send,
    LogOut,
    Clipboard,
    ClipboardList,
} from 'lucide-react'

export const ClipboardView = () => {
    const { roomCode, clipboardItems, sendClipboard, leaveRoom } =
        useClipboard()
    const [content, setContent] = useState('')
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [clipboardItems])

    const handleSend = async () => {
        if (!content.trim()) return
        await sendClipboard(content)
        setContent('')
        toast.success('Content sent to room')
    }

    const handleCopy = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedId(id)
            toast.success('Copied to clipboard')
            setTimeout(() => setCopiedId(null), 2000)
        } catch {
            toast.error('Failed to copy')
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                            <Clipboard className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-semibold leading-none">
                                Live Clipboard
                            </h1>
                            <div className="flex items-center ">
                                <span className="font-mono text-base font-bold px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary tracking-widest select-all">
                                    {roomCode}
                                </span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon-xs"
                                            variant="ghost"
                                            className="ml-1 text-primary hover:bg-primary/10"
                                            onClick={() =>
                                                handleCopy(
                                                    roomCode!,
                                                    'roomCode',
                                                )
                                            }
                                        >
                                            {copiedId === 'roomCode' ? (
                                                <Check className="h-3 w-3 text-emerald-500" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        {copiedId === 'roomCode'
                                            ? 'Copied!'
                                            : 'Copy room code'}
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="secondary"
                            className="gap-1 hidden sm:flex"
                        >
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Connected
                        </Badge>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={leaveRoom}
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Leave
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Leave room</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full p-4 gap-4">
                {/* Input area (no Card wrapper) */}
                <div className="pt-4 pb-3 bg-transparent">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type or paste content to share..."
                        className="min-h-25 resize-none bg-background/50 border-border/50 focus:border-primary/50"
                    />
                    <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-muted-foreground">
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                Ctrl
                            </kbd>
                            {' + '}
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                Enter
                            </kbd>
                            {' to send'}
                        </span>
                        <Button
                            onClick={handleSend}
                            disabled={!content.trim()}
                            size="sm"
                        >
                            <Send className="h-3.5 w-3.5" />
                            Send
                        </Button>
                    </div>
                </div>

                {/* Clipboard history */}
                <Card className="flex-1 overflow-hidden flex flex-col border-border/50 bg-card/80">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-base">
                                    History
                                </CardTitle>
                            </div>
                            <Badge
                                variant="secondary"
                                className="text-xs font-mono"
                            >
                                {clipboardItems.length}{' '}
                                {clipboardItems.length === 1 ? 'item' : 'items'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="flex-1 overflow-hidden p-0">
                        {clipboardItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 mb-3">
                                    <Clipboard className="h-6 w-6 text-muted-foreground/50" />
                                </div>
                                <p className="text-sm text-muted-foreground text-center">
                                    No items yet
                                </p>
                                <p className="text-xs text-muted-foreground/60 text-center mt-1">
                                    Send something to get started
                                </p>
                            </div>
                        ) : (
                            <ScrollArea className="h-full" ref={scrollRef}>
                                <div className="p-4 space-y-2">
                                    {clipboardItems.map((item) => (
                                        <Tooltip key={item.id}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className="relative rounded-lg border border-border/40 bg-background/40 p-3 transition-colors hover:border-primary/30 hover:bg-background/60 flex items-start justify-between gap-3 cursor-pointer"
                                                    onClick={() =>
                                                        handleCopy(
                                                            item.content,
                                                            item.id,
                                                        )
                                                    }
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <pre className="text-sm whitespace-pre-wrap wrap-break-word font-mono leading-relaxed text-foreground/90">
                                                            {item.content}
                                                        </pre>
                                                        <p className="text-[11px] text-muted-foreground/60 mt-2 font-mono">
                                                            {new Date(
                                                                item.timestamp,
                                                            ).toLocaleTimeString(
                                                                [],
                                                                {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    second: '2-digit',
                                                                },
                                                            )}
                                                        </p>
                                                    </div>
                                                    <span className="flex items-center ml-2">
                                                        {copiedId ===
                                                        item.id ? (
                                                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                        ) : (
                                                            <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                                        )}
                                                    </span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="left">
                                                {copiedId === item.id
                                                    ? 'Copied!'
                                                    : 'Copy to clipboard'}
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
