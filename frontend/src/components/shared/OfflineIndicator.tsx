import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { Wifi, WifiOff } from 'lucide-react'

export function OfflineIndicator() {
  const { isOnline } = useOnlineStatus()

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">You're offline</span>
      </div>
    </div>
  )
}

