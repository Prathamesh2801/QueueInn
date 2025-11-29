import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#FFF9ED] pt-16 pb-8 border-t border-[#6A4CAB]/10">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Top section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* Brand section */}
          <div>
            <h3 className="text-2xl font-bold text-[#6A4CAB]">Khaate Khelte</h3>
            <p className="text-sm text-[#7A5C3C] mt-3 max-w-xs">
              Smart queue management for hotels and restaurants — let your
              guests enjoy time, not wait in line.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm uppercase font-medium text-[#7A5C3C] tracking-[0.15em] mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {["How It Works", "Features", "Admin Portal", "Contact Us"].map(
                (link, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-sm text-[#6A4CAB] hover:text-[#5c3f98] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm uppercase font-medium text-[#7A5C3C] tracking-[0.15em] mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-[#6A4CAB]">
                <MapPin className="h-4 w-4 text-[#7A5C3C]" />
                Zeal Interactive Services Mumbai, India 400 067, Mumbai,
                Maharashtra
              </li>
              <li className="flex items-center gap-3 text-sm text-[#6A4CAB]">
                <Mail className="h-4 w-4 text-[#7A5C3C]" />
                gaurav@zealinteractive.in
              </li>
              <li className="flex items-center gap-3 text-sm text-[#6A4CAB]">
                <Phone className="h-4 w-4 text-[#7A5C3C]" />
                +91 98608 83177
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-[#7A5C3C]/20 mt-10 mb-6"></div>

        {/* Bottom */}
        <div className="text-center">
          <p className="text-xs text-[#7A5C3C]">
            © {new Date().getFullYear()} Khaate Khelte. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
