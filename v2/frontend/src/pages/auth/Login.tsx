import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle2, ShieldCheck, Wallet, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { useAuthStore, type Role } from '@/store/useAuthStore';

const stats = [
  { icon: Users, label: "Employees Managed", value: "2M+" },
  { icon: Wallet, label: "Payroll Processed", value: "$4B+" },
  { icon: ShieldCheck, label: "Compliant In", value: "15+ Countries" }
];

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('Admin');
  const navigate = useNavigate();
  const { login, setRole } = useAuthStore();

  const handleLogin = (e?: React.FormEvent, isGoogle = false) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    if (isGoogle) {
      // Simulate Google OAuth Popup Flow
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        '', 
        'Google Sign In', 
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (popup) {
        popup.document.write(`
          <div style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #fff;">
            <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; margin-bottom: 20px;">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <h2>Sign in with Google</h2>
            <p style="color: #5f6368;">Connecting to Symbiosis HRMS...</p>
            <div style="margin-top: 20px; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #4285F4; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
          </div>
        `);
      }

      setTimeout(() => {
        if (popup) popup.close();
        setIsLoading(false);
        setRole(selectedRole);
        login();
        navigate('/dashboard');
      }, 2000);
      return;
    }

    // Standard Magic Link delay
    setTimeout(() => {
      setIsLoading(false);
      setRole(selectedRole);
      login(); // Sets isAuthenticated to true
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex w-full bg-background overflow-hidden">
      {/* Left Panel - Branding & Visuals */}
      <div className="hidden lg:flex w-[55%] relative flex-col justify-between p-12 overflow-hidden bg-[#0A0D47]">
        {/* Animated background gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/20 blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#4F5FFF]/20 blur-[150px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        {/* Logo & Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-xl">
            S
          </div>
          <span className="text-white text-xl font-semibold tracking-tight">Symbiosis Enterprise</span>
        </div>

        {/* Center content - Floating UI elements */}
        <div className="relative z-10 flex-1 flex items-center justify-center mt-12">
          <div className="relative w-full max-w-lg aspect-square">
            {/* Main Floating Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 m-auto w-[80%] h-[60%] glass rounded-2xl p-6 flex flex-col gap-4 animate-float"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
                <div className="h-6 w-16 bg-emerald-500/30 rounded-full border border-emerald-500/50" />
              </div>
              <div className="flex gap-4 mt-4">
                <div className="h-20 flex-1 bg-white/10 rounded-lg border border-white/5" />
                <div className="h-20 flex-1 bg-white/10 rounded-lg border border-white/5" />
              </div>
              <div className="mt-auto h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[70%] bg-blue-400 rounded-full" />
              </div>
            </motion.div>

            {/* Smaller Floating Elements */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="absolute top-[15%] left-[5%] w-48 glass rounded-xl p-4 flex items-center gap-3 animate-float"
              style={{ animationDelay: '1s', animationDuration: '7s' }}
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="h-2 w-16 bg-white/30 rounded mb-2" />
                <div className="h-2 w-10 bg-white/20 rounded" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="absolute bottom-[20%] right-[0%] w-56 glass rounded-xl p-4 animate-float"
              style={{ animationDelay: '2.5s', animationDuration: '8s' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-4 h-4 text-blue-300" />
                <div className="h-2 w-20 bg-white/30 rounded" />
              </div>
              <div className="h-6 w-32 bg-white/40 rounded" />
            </motion.div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + (idx * 0.1), duration: 0.5 }}
              className="flex flex-col gap-1"
            >
              <div className="flex items-center gap-2 text-blue-200">
                <stat.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <span className="text-white font-semibold text-lg">{stat.value}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-8 sm:p-12 relative bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px] space-y-8"
        >
          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your enterprise account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-medium text-foreground">Select Prototype Role</Label>
                <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
                  {(['Admin', 'HR', 'Employee'] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${selectedRole === role ? 'bg-background shadow-sm text-foreground scale-100 ring-1 ring-border/50' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium text-foreground">Work Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  required 
                  className="h-11 bg-muted/30 focus-visible:ring-primary focus-visible:border-primary transition-all" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-medium text-foreground">Password</Label>
                  <a href="#" className="text-sm text-primary hover:underline font-medium hover:text-primary/80 transition-colors">Forgot password?</a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  className="h-11 bg-muted/30 focus-visible:ring-primary focus-visible:border-primary transition-all" 
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium transition-all active:scale-[0.98] shadow-[0_0_20px_-5px_rgba(79,95,255,0.4)] hover:shadow-[0_0_25px_-5px_rgba(79,95,255,0.6)]" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Authenticating...
                </div>
              ) : 'Sign in'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button onClick={(e) => handleLogin(e, true)} variant="outline" type="button" className="w-full h-11 font-medium bg-transparent hover:bg-muted/50 transition-colors gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>
          
          <Button onClick={(e) => handleLogin(e, false)} variant="ghost" type="button" className="w-full h-11 font-medium hover:bg-muted/50 transition-colors mt-2">
            Continue with Magic Link
          </Button>
          
          <p className="text-center text-sm text-muted-foreground px-4">
            By signing in, you agree to our{' '}
            <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
