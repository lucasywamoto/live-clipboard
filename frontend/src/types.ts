export interface ClipboardItem {
    id: string
    content: string
    timestamp: Date
}

export type ConnectionState = 'Disconnected' | 'Connecting' | 'Connected'
