import React, { useState } from 'react';

const Header: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);

  const handleConnectClick = () => {
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 2500);
  };

  return (
    <header className="p-4 sm:px-6 lg:px-8 border-b border-eve-border/50">
      <div className="container mx-auto flex justify-between items-center gap-6">
        {/* Left Side: Logo & Brand */}
        <div className="flex items-center gap-4 flex-shrink-0">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-eve-accent-purple">
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2 7L12 12M22 7L12 12M12 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M17 4.5L7 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">
            EVE <span className="text-eve-accent-purple">Protocol</span>
          </h1>
          <span className="hidden sm:inline-block px-2 py-1 bg-eve-panel border border-eve-border rounded-md text-xs font-mono text-eve-accent-blue">$EVE</span>
        </div>
        
        {/* Middle: Search Bar */}
        <div className="flex-1 justify-center px-4 hidden lg:flex">
          <div className="w-full max-w-md relative text-eve-text-secondary focus-within:text-eve-text-primary">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              name="search"
              id="search"
              placeholder="Search tokens / narratives..."
              className="w-full pl-10 pr-4 py-2 font-mono bg-eve-panel border border-eve-border rounded-lg placeholder:text-eve-text-secondary focus:ring-2 focus:ring-eve-accent-purple focus:border-eve-accent-purple focus:outline-none transition-all duration-300"
            />
          </div>
        </div>

        {/* Right Side: Connect Wallet Button */}
        <div className="flex-shrink-0 relative">
            <button 
              onClick={handleConnectClick}
              className="bg-eve-accent-purple hover:bg-violet-500 text-white font-semibold py-2 px-4 border border-violet-500 rounded-lg shadow-glow-purple transition-all duration-300 transform hover:scale-105"
            >
            Connect Wallet
            </button>
            {showPopup && (
              <div 
                className="absolute top-full mt-2 right-0 bg-eve-panel border border-eve-border rounded-lg px-4 py-2 text-sm text-eve-text-primary shadow-lg animate-fade-in-down whitespace-nowrap z-20"
              >
                Coming Soon...
              </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;