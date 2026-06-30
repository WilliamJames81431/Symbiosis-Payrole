import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Settings() {
  const { userRole, setRole } = useAuthStore();

  return (
    <div className="space-y-6 print-container animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Interactive Prototype Settings</h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Use these controls to simulate different user roles and test security features.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-border/50 shadow-sm max-w-2xl">
          <CardHeader>
            <CardTitle>Role-Based Access Control (RBAC) Simulator</CardTitle>
            <CardDescription>
              Toggle the active role below to see the sidebar and dashboard adapt instantly.
              Currently viewing as: <strong className="text-primary">{userRole}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button 
                variant={userRole === 'Admin' ? 'default' : 'outline'} 
                onClick={() => setRole('Admin')}
                className="flex-1"
              >
                Switch to Admin
              </Button>
              <Button 
                variant={userRole === 'HR' ? 'default' : 'outline'} 
                onClick={() => setRole('HR')}
                className="flex-1"
              >
                Switch to HR Manager
              </Button>
              <Button 
                variant={userRole === 'Employee' ? 'default' : 'outline'} 
                onClick={() => setRole('Employee')}
                className="flex-1"
              >
                Switch to Employee
              </Button>
            </div>
            
            <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-semibold text-sm mb-2">What changes?</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                <li><strong>Admin:</strong> Has full CRUD access. Can lock payroll and access all settings.</li>
                <li><strong>HR:</strong> Cannot access global settings. Only manages employees and runs payroll.</li>
                <li><strong>Employee:</strong> Sidebar collapses to only show personal profile, leaves, and payslips. No editing allowed.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
