import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';
import { useMockDataStore } from '@/store/useMockDataStore';
import { motion } from 'framer-motion';
import { Search, Lock } from 'lucide-react';
import PrintButton from '@/components/ui/print-button';

export default function Payroll() {
  const { userRole } = useAuthStore();
  const { payroll } = useMockDataStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayroll = payroll.filter(p => 
    p.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canEdit = userRole === 'Admin' || userRole === 'HR';

  return (
    <div className="space-y-6 print-container animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Payroll Processing</h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage salary runs and employee compensation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button className="no-print gap-2" variant="default">
              <Lock className="w-4 h-4" /> Lock Current Run
            </Button>
          )}
          <PrintButton />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center no-print">
              <CardTitle className="text-lg">May 2026 Run</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  className="pl-8 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border/50">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Employee</th>
                    <th className="px-4 py-3 font-semibold">Period</th>
                    <th className="px-4 py-3 font-semibold">Gross Pay</th>
                    <th className="px-4 py-3 font-semibold">Net Pay</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayroll.map((record) => (
                    <tr key={record.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{record.employeeName}</td>
                      <td className="px-4 py-3">{record.period}</td>
                      <td className="px-4 py-3">{record.grossPay}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">{record.netPay}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
