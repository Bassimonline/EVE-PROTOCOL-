
import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  title: string;
}

const Panel: React.FC<PanelProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-eve-panel/80 backdrop-blur-sm border border-eve-border rounded-xl shadow-lg h-full ${className}`}>
      <div className="px-4 py-3 border-b border-eve-border">
        <h3 className="font-mono text-sm uppercase tracking-widest text-eve-text-secondary">{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default Panel;
