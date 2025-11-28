import React from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpeg";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-14">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Grid Sections */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Logo + About + Social */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-2">
              <img
                src={logo}
                className="w-44 object-cover border border-gray-600"
                alt="SwachhSetu"
              />
            </Link>

            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                <span className="text-white font-semibold" >Garbage Reporting System </span> <br />A digital bridge that connects citizens, 
              Nagar Nigam Authority, and on-ground workers to keep cities clean and healthy.
            </p>

            <div className="flex space-x-3">
              <SocialLink href="" icon={<Facebook className="w-5 h-5" />} />
              <SocialLink href="" icon={<Twitter className="w-5 h-5" />} />
              <SocialLink href="" icon={<Instagram className="w-5 h-5" />} />
              <SocialLink href="" icon={<Linkedin className="w-5 h-5" />} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <FooterLink to="/" text="Home" />
              <FooterLink to="/reports" text="All Reports" />
              <FooterLink to="/reports/new" text="Report Garbage" />
              <FooterLink to="/about" text="About" />
              <FooterLink to="/contact" text="Contact" />
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <FooterLink to="/notices" text="Public Notices" />
              <FooterLink to="/faq" text="FAQ" />
                         </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-6 h-6 text-green-400 mt-1" />
                <span>
                  University of Lucknow, Sitapur Road,
                  <br />
                  Lucknow, Uttar Pradesh, 226024
                </span>
              </li>

              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-400" />
                <span>+91 93695 11514</span>
              </li>

              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-green-400" />
                <span>support@swachhsetu.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400 text-xs">
          <p>
            Built with ❤️ by <span className="text-green-400">Team BubbleStack</span>
          </p>
        </div>

      </div>
    </footer>
  );
};

function SocialLink({ href, icon }) {
  return (
    <a
      href={href}
      className="bg-gray-700 p-2 rounded-full hover:bg-green-500 transition duration-300"
      target="_blank"
      rel="noopener noreferrer"
    >
      {icon}
    </a>
  );
}

function FooterLink({ to, text }) {
  return (
    <li>
      <Link
        to={to}
        className="text-gray-400 hover:text-green-400 transition duration-300"
      >
        {text}
      </Link>
    </li>
  );
}

export default Footer;
