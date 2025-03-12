
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from './Button';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Track scroll position to change navbar style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out py-4 px-4 md:px-6',
        isScrolled || !isHomePage 
          ? 'bg-background/80 backdrop-blur-md border-b border-border/50' 
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="text-2xl font-bold tracking-tight transition-opacity hover:opacity-90"
        >
          <span className="text-primary">Chat</span>
          <span>Bubble</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          <Link 
            to="/" 
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              location.pathname === '/' 
                ? 'text-primary' 
                : 'text-foreground/70 hover:text-foreground hover:bg-accent'
            )}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              location.pathname === '/about' 
                ? 'text-primary' 
                : 'text-foreground/70 hover:text-foreground hover:bg-accent'
            )}
          >
            About
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link to="/chat">
            <Button 
              variant="primary" 
              size="sm"
              className="font-medium shadow-md shadow-primary/10"
            >
              Start Chatting
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
