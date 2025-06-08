import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import AppRoutes from '@/routes/AppRoutes';
import { AuthProvider } from '@/contexts/AuthContext';
import { DatabaseProvider } from '@/contexts/DatabaseContext';
import { SyncProvider } from '@/contexts/SyncContext';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="pos-theme">
      <DatabaseProvider>
        <SyncProvider>
          <AuthProvider>
            <AppRoutes />
            <Toaster />
          </AuthProvider>
        </SyncProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
}

export default App;