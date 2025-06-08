import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDatabase } from '@/contexts/DatabaseContext';

interface SyncContextType {
  isOnline: boolean;
  lastSyncTime: Date | null;
  pendingChanges: number;
  syncNow: () => Promise<void>;
  syncStatus: 'idle' | 'syncing' | 'error';
}

const SyncContext = createContext<SyncContextType>({
  isOnline: navigator.onLine,
  lastSyncTime: null,
  pendingChanges: 0,
  syncNow: async () => {},
  syncStatus: 'idle',
});

export const useSync = () => useContext(SyncContext);

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const { toast } = useToast();
  const { isInitialized } = useDatabase();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'Back online',
        description: 'Your connection has been restored.',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'You are offline',
        description: 'Changes will be synced when you reconnect.',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate pending changes for demo
    const interval = setInterval(() => {
      if (!isOnline) {
        setPendingChanges((prev) => prev + Math.floor(Math.random() * 3));
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline, toast]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingChanges > 0 && isInitialized) {
      syncNow();
    }
  }, [isOnline, pendingChanges, isInitialized]);

  const syncNow = useCallback(async () => {
    if (!isOnline || !isInitialized) {
      toast({
        title: 'Sync failed',
        description: !isOnline 
          ? 'You are offline. Please connect to the internet and try again.'
          : 'Database not initialized. Please wait and try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSyncStatus('syncing');
      
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would sync with MongoDB Atlas
      setLastSyncTime(new Date());
      setPendingChanges(0);
      setSyncStatus('idle');
      
      toast({
        title: 'Sync completed',
        description: `All changes have been synchronized to the cloud.`,
      });
    } catch (error) {
      setSyncStatus('error');
      toast({
        title: 'Sync failed',
        description: error instanceof Error ? error.message : 'An error occurred during sync',
        variant: 'destructive',
      });
    }
  }, [isOnline, isInitialized, toast]);

  return (
    <SyncContext.Provider
      value={{
        isOnline,
        lastSyncTime,
        pendingChanges,
        syncNow,
        syncStatus,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};