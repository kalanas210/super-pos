import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CalculatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Calculator = ({ open, onOpenChange }: CalculatorProps) => {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

  const clearDisplay = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = performCalculation();
      setDisplay(String(result));
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (firstOperand === null || operator === null) return inputValue;

    let result = 0;
    switch (operator) {
      case '+':
        result = firstOperand + inputValue;
        break;
      case '-':
        result = firstOperand - inputValue;
        break;
      case '*':
        result = firstOperand * inputValue;
        break;
      case '/':
        result = firstOperand / inputValue;
        break;
      default:
        return inputValue;
    }

    return Number(result.toFixed(8));
  };

  const handleEquals = () => {
    if (!operator || firstOperand === null) return;

    const result = performCalculation();
    setDisplay(String(result));
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[300px]">
        <DialogHeader>
          <DialogTitle>Calculator</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <Input
            value={display}
            readOnly
            className="text-right text-lg mb-4 bg-white dark:bg-slate-800"
          />
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              onClick={clearDisplay}
              className="col-span-2"
            >
              C
            </Button>
            <Button
              variant="outline"
              onClick={handleBackspace}
            >
              ←
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOperator('/')}
            >
              ÷
            </Button>
            {[7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="outline"
                onClick={() => inputDigit(num.toString())}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => handleOperator('*')}
            >
              ×
            </Button>
            {[4, 5, 6].map((num) => (
              <Button
                key={num}
                variant="outline"
                onClick={() => inputDigit(num.toString())}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => handleOperator('-')}
            >
              -
            </Button>
            {[1, 2, 3].map((num) => (
              <Button
                key={num}
                variant="outline"
                onClick={() => inputDigit(num.toString())}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => handleOperator('+')}
            >
              +
            </Button>
            <Button
              variant="outline"
              onClick={() => inputDigit('0')}
              className="col-span-2"
            >
              0
            </Button>
            <Button
              variant="outline"
              onClick={inputDecimal}
            >
              .
            </Button>
            <Button
              variant="default"
              onClick={handleEquals}
            >
              =
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Calculator; 