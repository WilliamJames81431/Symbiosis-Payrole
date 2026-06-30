import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { BarChart, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PrintButton from '@/components/ui/print-button';

export default function Reports() {
  return (
    <div className="space-y-6 print-container animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Analytics & Reports</h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Export organizational data and view insights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PrintButton />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { title: 'Employee Turnover', desc: 'Monthly attrition rates', icon: BarChart },
          { title: 'Leave Utilization', desc: 'Accrued vs taken PTO', icon: FileText },
          { title: 'Payroll Summary', desc: 'YTD compensation costs', icon: FileText },
        ].map((report, i) => (
          <motion.div key={report.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}>
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{report.title}</CardTitle>
                <report.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">{report.desc}</p>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
