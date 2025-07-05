import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-tactical flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/lovable-uploads/7032a47b-eff7-4654-889f-3d26c95cb414.png" 
            alt="DiveControl Logo" 
            className="w-24 h-24 mx-auto mb-4 animate-pulse"
          />
          <div className="text-xl font-bold text-military-gold tracking-wider">
            CARREGANDO...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;