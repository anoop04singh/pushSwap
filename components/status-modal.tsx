'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "./ui/button"

type Status = "loading" | "success" | "error"

interface StatusModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  status: Status
  title: string
  description: React.ReactNode
  onAction?: () => void
  actionLabel?: string
}

const statusConfig = {
  loading: {
    icon: <Loader2 className="h-12 w-12 animate-spin text-primary" />,
  },
  success: {
    icon: <CheckCircle className="h-12 w-12 text-green-500" />,
  },
  error: {
    icon: <XCircle className="h-12 w-12 text-destructive" />,
  },
}

export function StatusModal({
  isOpen,
  onOpenChange,
  status,
  title,
  description,
  onAction,
  actionLabel,
}: StatusModalProps) {
  const { icon } = statusConfig[status]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/60 backdrop-blur-lg border-primary/20 sm:max-w-md text-center">
        <DialogHeader className="items-center">
          <div className="mb-4">{icon}</div>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-center px-4 py-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        {status !== 'loading' && (
          <div className="flex justify-center gap-4 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            {onAction && actionLabel && (
              <Button onClick={onAction}>{actionLabel}</Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}