import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';
import { useMockDataStore } from '@/store/useMockDataStore';
import { motion } from 'framer-motion';
import { Search, Plus, Trash2 } from 'lucide-react';
import PrintButton from '@/components/ui/print-button';

export default function Directory() {
  const { userRole } = useAuthStore();
  const { employees, deleteEmployee } = useMockDataStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canEdit = userRole === 'Admin' || userRole === 'HR';

  return (
    <div className="space-y-6 print-container animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Employee Directory</h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage your organization's staff.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button className="no-print gap-2">
              <Plus className="w-4 h-4" /> Add Employee
            </Button>
          )}
          <PrintButton />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center no-print">
              <CardTitle className="text-lg">All Employees</CardTitle>
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
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    {canEdit && <th className="px-4 py-3 font-semibold text-right no-print">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{emp.name}<br/><span className="text-xs text-muted-foreground font-normal">{emp.email}</span></td>
                      <td className="px-4 py-3">{emp.role}</td>
                      <td className="px-4 py-3">{emp.department}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          emp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3 text-right no-print">
                          <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={() => deleteEmployee(emp.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No employees found matching "{searchTerm}"
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
