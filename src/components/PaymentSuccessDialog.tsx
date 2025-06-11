import { Download, Printer } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PaymentSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownloadPDF: () => void;
  onPrint: () => void;
  invoiceId: string;
  amount: number;
}

export const PaymentSuccessDialog = ({
  open,
  onOpenChange,
  onDownloadPDF,
  onPrint,
  invoiceId,
  amount,
}: PaymentSuccessDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Payment Successful!</DialogTitle>
          <DialogDescription className="text-center">
            <div className="mt-2 text-2xl font-bold text-green-600">
              Rs. {amount.toFixed(2)}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Invoice #{invoiceId}
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button onClick={onDownloadPDF} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={onPrint} variant="outline" className="w-full">
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 