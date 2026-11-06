import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AlertDialogProps {
    trigger: React.ReactNode;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AlertDialog({ trigger, title, description, onConfirm, onCancel, open, onOpenChange }: AlertDialogProps) {
    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Trigger asChild>
                {trigger}
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
                    <div className="flex flex-col space-y-2 text-center sm:text-left">
                        <DialogPrimitive.Title className="text-lg font-semibold text-ink">
                            {title}
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Description className="text-sm text-ink-muted">
                            {description}
                        </DialogPrimitive.Description>
                    </div>
                    <div className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                        <DialogPrimitive.Close asChild>
                            <Button variant="outline" onClick={onCancel} className="cursor-pointer">
                                Cancel
                            </Button>
                        </DialogPrimitive.Close>
                        <Button onClick={onConfirm} className="cursor-pointer bg-red-600 text-white hover:bg-red-700">
                            Proceed
                        </Button>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    )
}