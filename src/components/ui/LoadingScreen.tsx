import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = 'Cargando datos...' }: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        <p className="text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
