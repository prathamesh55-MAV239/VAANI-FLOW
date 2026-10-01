import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, ArrowRight, Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-vf-bg/85 backdrop-blur-md border-b border-vf-border/60 py-3 shadow-sm'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-vf-text text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Mic className="w-5 h-5 text-vf-accent" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl tracking-tight text-vf-text flex items-center gap-1.5">
              VAANIFLOW
              <span className="w-1.5 h-1.5 rounded-full bg-vf-accent animate-ping" />
            </span>
            <span className="text-[10px] font-mono tracking-widest text-vf-muted uppercase">
              Multilingual Voice AI
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-vf-text/80">
          <a href="#how-it-works" className="hover:text-vf-accent transition-colors">
            How It Works
          </a>
          <a href="#languages" className="hover:text-vf-accent transition-colors">
            Languages
          </a>
          <a href="#capabilities" className="hover:text-vf-accent transition-colors">
            Capabilities
          </a>
          <a href="#security" className="hover:text-vf-accent transition-colors">
            Security
          </a>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-lg bg-vf-accent text-white font-medium text-sm hover:bg-vf-accent-hover transition-all flex items-center gap-2 shadow-sm"
              >
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={logout}
                className="p-2 text-vf-muted hover:text-vf-text hover:bg-black/5 rounded-lg transition-colors"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-vf-text hover:text-vf-accent transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-full bg-vf-text text-white font-medium text-sm hover:bg-vf-accent hover:text-white transition-all flex items-center gap-2 shadow-sm"
              >
                Try VaaniFlow
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-vf-text"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-vf-bg border-b border-vf-border px-6 py-6 space-y-4">
          <div className="flex flex-col gap-3 font-medium text-base text-vf-text">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-vf-accent"
            >
              How It Works
            </a>
            <a
              href="#languages"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-vf-accent"
            >
              Languages
            </a>
            <a
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-vf-accent"
            >
              Capabilities
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-vf-accent"
            >
              Security
            </a>
          </div>

          <div className="pt-4 border-t border-vf-border flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg bg-vf-accent text-white font-medium"
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-vf-text font-medium border border-vf-border rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-vf-text text-white font-medium"
                >
                  Try VaaniFlow
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
