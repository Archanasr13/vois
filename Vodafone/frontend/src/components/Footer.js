import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#0f172a] border-t border-white/10 mt-16 relative z-10">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">A Unified Cybersecurity Simulation and Threat Intelligence Platform</h3>
            <p className="text-gray-300 text-sm">
              Empowering organizations with comprehensive cybersecurity awareness through
              realistic simulations, threat intelligence, and advanced domain analysis.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-white text-sm">Home</a></li>
              <li><a href="/simulation" className="text-gray-300 hover:text-white text-sm">Simulations</a></li>
              <li><a href="/quiz" className="text-gray-300 hover:text-white text-sm">Quiz</a></li>
              <li><a href="/dashboard" className="text-gray-300 hover:text-white text-sm">Dashboard</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <div className="text-gray-300 text-sm space-y-2">
              <p>IT Security Helpdesk</p>
              <p>Email: <a href="mailto:security-support@example.gov" className="underline">security-support@example.gov</a></p>
              <p>Phone: <a href="tel:+15551234567" className="underline">+1 (555) 123-4567</a></p>
              <p>Support portal: <a href="https://support.example.gov" target="_blank" rel="noreferrer" className="underline">support.example.gov</a></p>
              <p className="text-xs">Support hours: Mon–Fri, 09:00–17:00 (local time). For suspected phishing, do not click links — report the message to the Security Helpdesk immediately.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Unified Cybersecurity Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;







