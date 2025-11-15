
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="p-4 sm:px-6 lg:px-8 border-t border-eve-border/50">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-eve-text-secondary">
        <p>&copy; {new Date().getFullYear()} EVE Protocol. All rights reserved.</p>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <a href="#" className="hover:text-eve-accent-purple transition-colors">Twitter</a>
          <a href="#" className="hover:text-eve-accent-purple transition-colors">Discord</a>
          <a href="#" className="hover:text-eve-accent-purple transition-colors">Docs</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
