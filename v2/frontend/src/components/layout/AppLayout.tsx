import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="no-print h-full">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="no-print">
          <TopBar />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-zinc-950 print:bg-white print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
