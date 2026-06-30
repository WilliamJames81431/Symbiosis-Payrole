import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';
import { useMockDataStore } from '@/store/useMockDataStore';
import { motion } from 'framer-motion';
import { Search, CheckCircle } from 'lucide-react';
import PrintButton from '@/components/ui/print-button';

export default function LeaveManagement() {
  const { userRole } = useAuthStore();
  const { leaves, approveLeave } = useMockDataStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeaves = leaves.filter(l => 
    l.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canEdit = userRole === 'Admin' || userRole === 'HR';

  return (
    <div className="space-y-6 print-container animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Leave Management</h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Review and approve employee time off requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {userRole === 'Employee' && (
            <Button className="no-print gap-2">
              Request Time Off
            </Button>
          )}
          <PrintButton />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center no-print">
              <CardTitle className="text-lg">Recent Requests</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
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
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Duration</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    {canEdit && <th className="px-4 py-3 font-semibold text-right no-print">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{leave.employeeName}</td>
                      <td className="px-4 py-3">{leave.type}</td>
                      <td className="px-4 py-3">{leave.startDate} to {leave.endDate}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3 text-right no-print">
                          {leave.status === 'Pending' && (
                            <Button variant="ghost" size="sm" className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10" onClick={() => approveLeave(leave.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" /> Approve
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                  {filteredLeaves.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No leave requests found matching "{searchTerm}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
