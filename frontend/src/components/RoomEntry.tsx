import { useState } from 'react'
import { useClipboard } from '../context/ClipboardContext'
import { Button } from './ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Clipboard, Plus, ArrowRight, ArrowLeft, Loader2, Wifi, WifiOff } from 'lucide-react'

export const RoomEntry = () => {
    const { createRoom, joinRoom, connectionState } = useClipboard()
    const [mode, setMode] = useState<'select' | 'join'>('select')
    const [roomCode, setRoomCode] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleCreateRoom = async () => {
        setIsLoading(true)
        setError('')
        try {
            const code = await createRoom()
            if (!code) {
                setError('Failed to create room. Please try again.')
            }
        } catch {
            setError('An error occurred while creating the room.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleJoinRoom = async () => {
        if (!roomCode.trim()) {
            setError('Please enter a room code.')
            return
        }

        setIsLoading(true)
        setError('')
        try {
            const success = await joinRoom(roomCode.toUpperCase())
            if (!success) {
                setError('Invalid room code. Please check and try again.')
            }
        } catch {
            setError('An error occurred while joining the room.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
        if (value.length <= 5) {
            setRoomCode(value)
            setError('')
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && roomCode.length === 5) {
            handleJoinRoom()
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md space-y-4">
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                            <Clipboard className="h-7 w-7 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Live Clipboard
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Share clipboard content across devices in real-time
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {mode === 'select' ? (
                            <div className="space-y-3">
                                <Button
                                    onClick={handleCreateRoom}
                                    disabled={isLoading || connectionState === 'Connecting'}
                                    className="w-full h-12 text-base"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Plus className="h-4 w-4" />
                                    )}
                                    {isLoading ? 'Creating...' : 'Create New Room'}
                                </Button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <Separator className="w-full" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-card px-2 text-muted-foreground">
                                            or
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setMode('join')}
                                    disabled={isLoading}
                                    variant="outline"
                                    className="w-full h-12 text-base"
                                >
                                    <ArrowRight className="h-4 w-4" />
                                    Join Existing Room
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="roomCode" className="text-sm font-medium">
                                        Room Code
                                    </Label>
                                    <Input
                                        id="roomCode"
                                        type="text"
                                        value={roomCode}
                                        onChange={handleCodeChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="XXXXX"
                                        maxLength={5}
                                        className="text-center text-2xl font-mono tracking-[0.4em] uppercase h-14 bg-background/50"
                                        disabled={isLoading || connectionState === 'Connecting'}
                                        autoFocus
                                    />
                                    <p className="text-xs text-muted-foreground text-center">
                                        Enter the 5-character code to join a room
                                    </p>
                                </div>

                                <Button
                                    onClick={handleJoinRoom}
                                    disabled={
                                        isLoading ||
                                        connectionState === 'Connecting' ||
                                        roomCode.length !== 5
                                    }
                                    className="w-full h-12 text-base"
                                >
                                    {isLoading || connectionState === 'Connecting' ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ArrowRight className="h-4 w-4" />
                                    )}
                                    {isLoading || connectionState === 'Connecting'
                                        ? 'Joining...'
                                        : 'Join Room'}
                                </Button>

                                <Button
                                    onClick={() => {
                                        setMode('select')
                                        setRoomCode('')
                                        setError('')
                                    }}
                                    disabled={isLoading}
                                    variant="ghost"
                                    className="w-full text-muted-foreground"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                                <p className="text-sm text-destructive text-center">
                                    {error}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-center">
                    <Badge
                        variant={connectionState === 'Connected' ? 'default' : 'secondary'}
                        className="gap-1.5 text-xs"
                    >
                        {connectionState === 'Connected' ? (
                            <Wifi className="h-3 w-3" />
                        ) : connectionState === 'Connecting' ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <WifiOff className="h-3 w-3" />
                        )}
                        {connectionState}
                    </Badge>
                </div>
            </div>
        </div>
    )
}
