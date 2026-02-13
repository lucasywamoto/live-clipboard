import { createContext, useContext, useState, type ReactNode } from 'react'
import connection from '../services/signalrService'
import { type ClipboardItem, type ConnectionState } from '../types'

interface ClipboardContextType {
    roomCode: string | null
    clipboardItems: ClipboardItem[]
    connectionState: ConnectionState
    createRoom: () => Promise<string | null>
    joinRoom: (code: string) => Promise<boolean>
    sendClipboard: (content: string) => Promise<void>
    leaveRoom: () => void
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(
    undefined,
)

export const ClipboardProvider = ({ children }: { children: ReactNode }) => {
    const [roomCode, setRoomCode] = useState<string | null>(null)
    const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>([])
    const [connectionState, setConnectionState] =
        useState<ConnectionState>('Disconnected')
    const [handlersRegistered, setHandlersRegistered] = useState(false)

    const registerHandlers = () => {
        if (handlersRegistered) return
        setHandlersRegistered(true)

        connection.onreconnecting(() => {
            console.log('SignalR reconnecting...')
            setConnectionState('Connecting')
        })

        connection.onreconnected(() => {
            console.log('SignalR reconnected')
            setConnectionState('Connected')
        })

        connection.onclose(() => {
            console.log('SignalR closed')
            setConnectionState('Disconnected')
        })

        connection.on('ReceiveClipboardContent', (content: string) => {
            const newItem: ClipboardItem = {
                id: Date.now().toString(),
                content,
                timestamp: new Date(),
            }
            setClipboardItems((prev) => [...prev, newItem])
        })
    }

    const ensureConnection = async () => {
        registerHandlers()

        const currentState = connection.state
        console.log('Current SignalR state:', currentState)

        if (currentState === 'Connected') {
            console.log('SignalR already connected')
            return
        }

        if (currentState === 'Connecting' || currentState === 'Reconnecting') {
            console.log('SignalR is connecting, waiting for completion...')
            const maxWait = 10000
            const startTime = Date.now()
            while (
                connection.state === 'Connecting' ||
                connection.state === 'Reconnecting'
            ) {
                if (Date.now() - startTime > maxWait) {
                    throw new Error('Connection timeout')
                }
                await new Promise((resolve) => setTimeout(resolve, 100))
            }
            if (connection.state === 'Connected') {
                setConnectionState('Connected')
                console.log('SignalR connection completed')
            }
            return
        }

        if (currentState === 'Disconnected') {
            console.log('Starting SignalR connection...')
            setConnectionState('Connecting')
            await connection.start()
            setConnectionState('Connected')
            console.log('SignalR Connected successfully')
        }
    }

    const createRoom = async (): Promise<string | null> => {
        try {
            await ensureConnection()
            const code = await connection.invoke<string>('CreateRoom')
            setRoomCode(code)
            await connection.invoke('JoinRoom', code)

            const history = await connection.invoke<string[]>(
                'GetRoomHistory',
                code,
            )
            const items: ClipboardItem[] = history.map((content, index) => ({
                id: `history-${index}`,
                content,
                timestamp: new Date(),
            }))
            setClipboardItems(items)

            return code
        } catch (err) {
            console.error('Error creating room:', err)
            setConnectionState('Disconnected')
            return null
        }
    }

    const joinRoom = async (code: string): Promise<boolean> => {
        try {
            await ensureConnection()
            const success = await connection.invoke<boolean>('JoinRoom', code)
            if (success) {
                setRoomCode(code)

                const history = await connection.invoke<string[]>(
                    'GetRoomHistory',
                    code,
                )
                const items: ClipboardItem[] = history.map(
                    (content, index) => ({
                        id: `history-${index}`,
                        content,
                        timestamp: new Date(),
                    }),
                )
                setClipboardItems(items)
            }
            return success
        } catch (err) {
            console.error('Error joining room:', err)
            setConnectionState('Disconnected')
            return false
        }
    }

    const sendClipboard = async (content: string): Promise<void> => {
        if (!roomCode) return
        try {
            await connection.invoke('SendClipboardContent', roomCode, content)
        } catch (err) {
            console.error('Error sending clipboard:', err)
        }
    }

    const leaveRoom = () => {
        setRoomCode(null)
        setClipboardItems([])
    }

    return (
        <ClipboardContext.Provider
            value={{
                roomCode,
                clipboardItems,
                connectionState,
                createRoom,
                joinRoom,
                sendClipboard,
                leaveRoom,
            }}
        >
            {children}
        </ClipboardContext.Provider>
    )
}

export const useClipboard = () => {
    const context = useContext(ClipboardContext)
    if (context === undefined) {
        throw new Error('useClipboard must be used within a ClipboardProvider')
    }
    return context
}
