import { Bell, Search, Menu, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';

export default function TopBar() {
  const { logout } = useAuthStore();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 md:px-6 z-10 sticky top-0 supports-[backdrop-filter]:bg-background/60 shadow-sm shadow-black/5 dark:shadow-black/20">
      <div className="flex items-center flex-1 gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="max-w-md w-full hidden md:flex relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="search"
            placeholder="Search employees, reports, or settings..."
            className="block w-full h-10 pl-10 pr-12 rounded-lg border-0 bg-muted/50 py-1.5 text-foreground shadow-sm ring-1 ring-inset ring-border/50 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all duration-200"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="inline-flex items-center gap-1 rounded border border-border/50 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <Command className="w-3 h-3" />K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background animate-pulse" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              <Avatar className="h-9 w-9 border border-border/50 shadow-sm">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">John Doe</p>
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  john.doe@company.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem className="cursor-pointer">Profile Settings</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Theme Preferences</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer font-medium">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
