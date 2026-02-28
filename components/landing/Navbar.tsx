'use client';

import { Shield } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  onHistoryClick?: () => void;
}

const Navbar = ({ onHistoryClick }: NavbarProps) => {
  return (
    <nav className="border-b-[3px] border-gray-900 bg-white sticky top-0 z-50 shadow-brutal-sm">
      <div className="neo-container flex items-center justify-between py-4 px-6 md:px-12 lg:px-20">
        <Link href="/" className="flex items-center gap-2">
          <div className="neo-card-sm p-1.5">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <span className="font-black text-lg">ScamRadar</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 font-bold text-sm">
          <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#demo" className="hover:text-primary transition-colors">Demo</a>
          <a href="#architecture" className="hover:text-primary transition-colors">Architecture</a>
        </div>
        <div className="flex items-center gap-4">
          {onHistoryClick && (
            <button
              onClick={onHistoryClick}
              className="neo-btn-outline text-sm py-2 px-4"
            >
              History
            </button>
          )}
          <a href="#analyzer" className="neo-btn-primary text-sm py-2 px-4">
            Try Free
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

