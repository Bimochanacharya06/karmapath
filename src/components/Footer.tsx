import { Link } from "react-router-dom";
import logo from "@/assets/karmapath-logo.png";

const Footer = () => {
  return (
    <footer className="bg-deep-brown py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="KarmaPath" className="w-9 h-9" loading="lazy" />
              <span className="font-display text-xl font-bold text-cream">
                KarmaPath
              </span>
            </div>
            <p className="text-warm-stone text-sm leading-relaxed max-w-md mb-6">
              Your sacred guide to Hindu Karmakanda rituals and Vedic traditions
              of Nepal. Connecting devotees with knowledgeable Pandits for
              authentic ceremonies.
            </p>
            <p className="text-warm-stone/60 text-sm font-display italic">
              "धर्मो रक्षति रक्षितः" — Dharma protects those who protect it.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-cream mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: "Home", to: "/" },
                { label: "Services", to: "/services" },
                { label: "Samagri Marketplace", to: "/marketplace" },
                { label: "Ask AI Pandit", to: "/ask-pandit" },
                { label: "Blog", to: "/blog" },
                { label: "Resources", to: "/resources" },
                { label: "Contact", to: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-warm-stone hover:text-saffron transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-cream mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-warm-stone">
              <li>Kathmandu, Nepal</li>
              <li>info@karmapath.com</li>
              <li>+977 9869667953</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-warm-stone/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-warm-stone/60">
            © {new Date().getFullYear()} KarmaPath. All rights reserved.
          </p>
          <p className="text-xs text-warm-stone/40 font-display">
            ॐ सर्वे भवन्तु सुखिनः
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
