import { useEffect } from 'react'

export function ToastHost({
  messages,
  onDismiss,
}: {
  messages: { id: number; text: string }[]
  onDismiss: (id: number) => void
}) {
  return (
    <div className="toast-host" aria-live="polite">
      {messages.map((m) => (
        <ToastItem key={m.id} id={m.id} text={m.text} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({
  id,
  text,
  onDismiss,
}: {
  id: number
  text: string
  onDismiss: (id: number) => void
}) {
  useEffect(() => {
    const t = window.setTimeout(() => onDismiss(id), 2800)
    return () => window.clearTimeout(t)
  }, [id, onDismiss])
  return <div className="toast">{text}</div>
}
