import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/karmapath-logo.png";

const Footer = () => {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-deep-brown text-cream py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b border-cream/10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <img src={logo} alt="KarmaPath" className="w-8 h-8" loading="lazy" />
              <span className="font-display text-lg font-bold text-cream">KarmaPath</span>
            </div>
            <p className="text-warm-stone text-sm max-w-sm">
              {lang === "ne"
                ? "नेपाली हिन्दू वैदिक पूजा, संस्कार र अनुभवी पण्डित सेवासँग जोड्ने सरल मञ्च।"
                : "Connecting families across Nepal with verified Vedic Pandits and sacred traditions."}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-warm-stone">
            <Link to="/" className="hover:text-cream transition-colors">{t("nav.home")}</Link>
            <Link to="/services" className="hover:text-cream transition-colors">{t("nav.services")}</Link>
            <Link to="/marketplace" className="hover:text-cream transition-colors">{t("nav.marketplace")}</Link>
            <Link to="/resources" className="hover:text-cream transition-colors">{t("nav.resources")}</Link>
            <Link to="/blog" className="hover:text-cream transition-colors">{t("nav.blog")}</Link>
            <Link to="/contact" className="hover:text-cream transition-colors">{t("nav.contact")}</Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-warm-stone/80">
          <p>© {new Date().getFullYear()} KarmaPath · Kathmandu, Nepal</p>
          <p className="font-display">ॐ सर्वे भवन्तु सुखिनः</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
