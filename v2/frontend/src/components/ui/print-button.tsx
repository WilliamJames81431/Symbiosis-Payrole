import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handlePrint}
      className="no-print gap-2 shadow-sm"
    >
      <Printer className="w-4 h-4" />
      <span className="hidden sm:inline">Print Report</span>
    </Button>
  );
}
