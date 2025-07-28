import React from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  onClose: () => void;
  show: boolean;
}

const Alert: React.FC<AlertProps> = ({ type, title, message, onClose, show }) => {
  if (!show) return null;

  // Başarı mesajları için sağ alt köşe, diğerleri için merkez
  const isSuccess = type === 'success';
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className={`fixed z-50 p-4 ${
      isSuccess 
        ? 'bottom-4 right-4 flex items-end justify-end' 
        : 'inset-0 flex items-center justify-center'
    }`}>
      <div className={`${isSuccess ? 'max-w-sm' : 'max-w-md w-full'} ${getBgColor()} border rounded-lg shadow-lg p-6`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${getTextColor()}`}>
              {title}
            </h3>
            <div className={`mt-2 text-sm ${getTextColor()}`}>
              <div className="whitespace-pre-line">{message}</div>
            </div>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 ${getTextColor()} hover:bg-opacity-20 hover:bg-current focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        {!isSuccess && (
          <div className="mt-4">
            <button
              onClick={onClose}
              className={`w-full inline-flex justify-center rounded-md px-3 py-2 text-sm font-medium ${getTextColor()} bg-white border border-current hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current`}
            >
              Tamam
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert; 