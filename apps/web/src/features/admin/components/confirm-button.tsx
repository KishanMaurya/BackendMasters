'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import type { ReactNode } from 'react';
import { buttonVariants } from '@/components/ui/button-variants';

/** Asks before anything that can't be undone. */
export function ConfirmButton({
  label,
  title,
  description,
  confirmLabel,
  disabled,
  onConfirm,
}: {
  label: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  disabled?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger
        disabled={disabled}
        className={buttonVariants({ variant: 'destructive', size: 'sm' })}
      >
        {label}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-(--motion-fast) data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-xl border bg-card p-6 transition-opacity duration-(--motion-fast) data-ending-style:opacity-0 data-starting-style:opacity-0">
          <AlertDialog.Title className="font-heading text-lg font-semibold">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground">
            {description}
          </AlertDialog.Description>
          <div className="flex justify-end gap-2">
            <AlertDialog.Close className={buttonVariants({ variant: 'outline' })}>
              Cancel
            </AlertDialog.Close>
            <AlertDialog.Close
              onClick={onConfirm}
              className={buttonVariants({ variant: 'destructive' })}
            >
              {confirmLabel}
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
