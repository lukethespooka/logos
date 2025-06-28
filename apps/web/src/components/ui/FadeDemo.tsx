import * as React from 'react'
import { Fade } from './fade-transition'
import { Button } from './button'

export function FadeDemo() {
  const [showFast, setShowFast] = React.useState(true)
  const [showNormal, setShowNormal] = React.useState(true)
  const [showSlow, setShowSlow] = React.useState(true)

  return (
    <div className="space-y-8 p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Fast Transition</h3>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFast(!showFast)}
          >
            Toggle Fast
          </Button>
          <Fade show={showFast} duration="fast" className="rounded-md bg-primary/10 p-4">
            <p>Fast fade transition (150ms)</p>
          </Fade>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Normal Transition</h3>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowNormal(!showNormal)}
          >
            Toggle Normal
          </Button>
          <Fade show={showNormal} duration="normal" className="rounded-md bg-secondary/10 p-4">
            <p>Normal fade transition (200ms)</p>
          </Fade>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Slow Transition</h3>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowSlow(!showSlow)}
          >
            Toggle Slow
          </Button>
          <Fade show={showSlow} duration="slow" className="rounded-md bg-destructive/10 p-4">
            <p>Slow fade transition (300ms)</p>
          </Fade>
        </div>
      </div>
    </div>
  )
} 