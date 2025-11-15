
import React from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-eve-dark text-eve-text-primary">
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.3)_0%,_transparent_50%)]"></div>
        <div className="absolute top-0 left-0 h-1/2 w-1/2 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2)_0%,_transparent_60%)]"></div>
        <div className="absolute bottom-0 right-0 h-1/2 w-1/2 bg-[radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.2)_0%,_transparent_60%)]"></div>
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8 flex-grow">
          <Dashboard />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;