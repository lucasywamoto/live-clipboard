import { ClipboardProvider, useClipboard } from './context/ClipboardContext'
import { RoomEntry } from './components/RoomEntry'
import { ClipboardView } from './components/ClipboardView'
import { TooltipProvider } from './components/ui/tooltip'
import { Toaster } from './components/ui/sonner'

function AppContent() {
    const { roomCode } = useClipboard()

    return roomCode ? <ClipboardView /> : <RoomEntry />
}

function App() {
    return (
        <TooltipProvider delayDuration={300}>
            <ClipboardProvider>
                <AppContent />
                <Toaster
                    theme="dark"
                    position="bottom-right"
                    richColors
                    closeButton
                />
            </ClipboardProvider>
        </TooltipProvider>
    )
}

export default App
