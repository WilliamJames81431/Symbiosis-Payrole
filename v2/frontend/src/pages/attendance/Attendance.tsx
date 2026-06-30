import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMockDataStore } from '@/store/useMockDataStore';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import PrintButton from '@/components/ui/print-button';

export default function Attendance() {
  const { attendance } = useMockDataStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAttendance = attendance.filter(a => 
    a.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 print-container animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Daily Attendance</h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Track employee clock-ins and clock-outs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PrintButton />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center no-print">
              <CardTitle className="text-lg">Today's Logs</CardTitle>
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
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Check In</th>
                    <th className="px-4 py-3 font-semibold">Check Out</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((record) => (
                    <tr key={record.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{record.employeeName}</td>
                      <td className="px-4 py-3">{record.date}</td>
                      <td className="px-4 py-3">{record.checkIn}</td>
                      <td className="px-4 py-3">{record.checkOut}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
                          record.status === 'Late' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                          'bg-rose-500/10 text-rose-600 dark:text-rose-400'
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
