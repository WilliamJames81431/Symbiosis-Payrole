import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, CreditCard, Clock, TrendingUp, TrendingDown, AlertCircle, FileCheck, ShieldCheck } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import PrintButton from '@/components/ui/print-button';

const stats = [
  {
    title: "Total Employees",
    value: "2,543",
    description: "+12% from last month",
    icon: Users,
    trend: "up"
  },
  {
    title: "Active Departments",
    value: "24",
    description: "Across 4 regions",
    icon: Building2,
    trend: "neutral"
  },
  {
    title: "Monthly Payroll",
    value: "$1.2M",
    description: "Estimated for next run",
    icon: CreditCard,
    trend: "up"
  },
  {
    title: "On Leave Today",
    value: "45",
    description: "2% of total workforce",
    icon: Clock,
    trend: "down"
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  return (
    <div className="space-y-6 print-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Welcome back. Here's an overview of your organization today.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <PrintButton />
        </motion.div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="bg-card border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
                <div className="flex items-center mt-2">
                  {stat.trend === 'up' && <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" />}
                  {stat.trend === 'down' && <TrendingDown className="w-4 h-4 mr-1 text-rose-500" />}
                  <p className={`text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-500' : stat.trend === 'down' ? 'text-rose-500' : 'text-muted-foreground'}`}>
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-4"
        >
          <Card className="h-full border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Payroll History</CardTitle>
              <CardDescription>Monthly salary disbursement across all branches.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center border-t border-border/10 bg-muted/5 rounded-b-xl mx-6 mb-6 mt-2">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  <CreditCard className="w-8 h-8" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Chart Visualization Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-3 space-y-4"
        >
          {/* Compliance Card */}
          <Card className="border-l-4 border-l-rose-500 border-y-border/50 border-r-border/50 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertCircle className="w-24 h-24 -mt-8 -mr-8 text-rose-500" />
             </div>
             <CardHeader className="pb-3">
               <CardTitle className="text-base flex items-center gap-2">
                 <AlertCircle className="w-4 h-4 text-rose-500" />
                 Compliance Action Required
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="flex justify-between items-end">
                 <div>
                   <p className="text-sm font-semibold text-foreground">EPF ECR Due — June 15</p>
                   <p className="text-xs text-rose-500 font-medium mt-1">3 days left</p>
                 </div>
                 <div className="text-xs font-semibold text-primary hover:text-primary/80 cursor-pointer">
                   File Now &rarr;
                 </div>
               </div>
             </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 border-y-border/50 border-r-border/50 shadow-sm">
             <CardContent className="p-4 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <FileCheck className="w-5 h-5 text-amber-500" />
                 <div>
                   <p className="text-sm font-semibold text-foreground">PT Challan — MH June 30</p>
                   <p className="text-xs text-muted-foreground mt-0.5">15 days left</p>
                 </div>
               </div>
             </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 border-y-border/50 border-r-border/50 shadow-sm">
             <CardContent className="p-4 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <ShieldCheck className="w-5 h-5 text-emerald-500" />
                 <div>
                   <p className="text-sm font-semibold text-foreground">ESI Payment</p>
                   <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">May Filed Successfully</p>
                 </div>
               </div>
             </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
