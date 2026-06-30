import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          This module is part of Phase 7 backend integration and will be connected to the database soon.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>{title} Module</CardTitle>
            <CardDescription>
              Check back later! You can test the Interactive Prototype features on the Directory and Settings pages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 rounded-md border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground bg-muted/10">
              Future Content Area
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
