import * as React from 'react'
import { Badge } from './badge'

export function BadgeDemo() {
  const [count, setCount] = React.useState(1)
  const [manualPulse, setManualPulse] = React.useState(false)
  const [pulseCount, setPulseCount] = React.useState(0)

  // Automatically increment count every 3 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => prev + 1)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const handlePulse = () => {
    setPulseCount(prev => prev + 1)
    setManualPulse(true)
    setTimeout(() => setManualPulse(false), 100)
  }

  return (
    <div className="space-y-4 p-4">
      <div className="space-x-2">
        <span className="text-sm text-gray-500">Auto-updating badge:</span>
        <Badge>{count} notifications</Badge>
      </div>

      <div className="space-x-2">
        <span className="text-sm text-gray-500">Different variants:</span>
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>

      <div className="space-x-2">
        <span className="text-sm text-gray-500">Manual pulse:</span>
        <Badge shouldPulse={manualPulse}>Pulse count: {pulseCount}</Badge>
        <button 
          onClick={handlePulse}
          className="rounded-md bg-gray-100 px-2 py-1 text-sm hover:bg-gray-200"
        >
          Trigger Pulse
        </button>
      </div>
    </div>
  )
} 