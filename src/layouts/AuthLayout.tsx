import { Outlet } from 'react-router-dom';
import { Store } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="flex flex-col items-center justify-center space-y-2">
          <Store className="h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold">SuperPOS</h1>
          <p className="text-muted-foreground text-sm">Point of Sale System</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;