import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Mock database functions
const initializeDatabase = async () => {
  // In a real app, this would initialize SQLite
  console.log('Initializing local database...');
  return true;
};

interface DatabaseContextType {
  isInitialized: boolean;
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isInitialized: false,
  error: null,
});

export const useDatabase = () => useContext(DatabaseContext);

export const DatabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeDatabase();
        setIsInitialized(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize database';
        setError(errorMessage);
        toast({
          title: 'Database Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    };

    initialize();
  }, [toast]);

  return (
    <DatabaseContext.Provider value={{ isInitialized, error }}>
      {children}
    </DatabaseContext.Provider>
  );
};