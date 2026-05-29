import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import './index.css';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [slowLoad, setSlowLoad] = React.useState(false);

  React.useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setSlowLoad(true), 5000);
      return () => clearTimeout(timer);
    } else {
      setSlowLoad(false);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-gray-400">
            {slowLoad ? 'Waking up the server, please wait...' : 'Loading...'}
          </p>
          {slowLoad && (
            <p className="mt-1 text-xs text-gray-300">This may take up to 30 seconds</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <SocketProvider>
          <ChatPage />
        </SocketProvider>
      ) : (
        <AuthPage />
      )}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;