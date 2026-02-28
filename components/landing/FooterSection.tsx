'use client';

import { Shield } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="border-t-[3px] border-gray-900 bg-white">
      <div className="neo-container py-8 px-6 md:px-12 lg:px-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-black text-sm">ScamRadar</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900 transition-colors">GitHub</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Documentation</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
          <p className="text-xs text-gray-500">
            © 2025 ScamRadar. AI-Powered Fraud Detection.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;

