import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Settings from './pages/Settings';
import HockeyCards from './pages/HockeyCards';
import MacBooks from './pages/MacBooks';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'home';
      setCurrentPage(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'settings':
        return <Settings />;
      case 'hockey':
        return <HockeyCards />;
      case 'macbook':
        return <MacBooks />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {renderPage()}
    </div>
  );
}

export default App;
