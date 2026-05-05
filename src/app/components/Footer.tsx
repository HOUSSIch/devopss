import { Link } from "react-router-dom";
import { Sparkles, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  const footerLinks = {
    product: [
      { label: t("footer.productFeatures"), path: "/features" },
      { label: t("footer.productPlans"), path: "/pricing" },
      { label: t("footer.productUpload"), path: "/upload" },
      { label: t("footer.productProducts"), path: "/products" },
    ],
    company: [
      { label: t("footer.companyAbout"), path: "/about" },
      { label: t("footer.companyCareers"), path: "/careers" },
      { label: t("footer.companyBlog"), path: "/blog" },
      { label: t("footer.companyPress"), path: "/press" },
    ],
    support: [
      { label: t("footer.supportHelp"), path: "/help" },
      { label: t("footer.supportContact"), path: "/contact" },
      { label: t("footer.supportPrivacy"), path: "/privacy" },
      { label: t("footer.supportTerms"), path: "/terms" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, label: "Facebook", ariaLabel: t("footer.visitFacebook"), url: "https://facebook.com" },
    { icon: Twitter, label: "Twitter", ariaLabel: t("footer.visitTwitter"), url: "https://twitter.com" },
    { icon: Instagram, label: "Instagram", ariaLabel: t("footer.visitInstagram"), url: "https://instagram.com" },
    { icon: Linkedin, label: "LinkedIn", ariaLabel: t("footer.visitLinkedIn"), url: "https://linkedin.com" },
  ];

  return (
    <footer
      className="deepskyn-footer-shell bg-[linear-gradient(180deg,rgba(255,250,246,0.9)_0%,rgba(255,239,231,0.92)_100%)] dark:bg-[linear-gradient(180deg,rgba(31,21,25,0.96)_0%,rgba(42,28,33,0.96)_100%)] backdrop-blur-md border-t border-[#f2bfd1] dark:border-[#6a4757] mt-20"
      role="contentinfo"
      aria-label={t("footer.siteFooter")}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="flex items-center gap-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#8b63d3] rounded-lg w-fit"
              aria-label={t("footer.homeAria")}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d96b95] to-[#f29b77] flex items-center justify-center shadow-lg shadow-[#d96b95]/25">
                <Sparkles className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-2xl bg-gradient-to-r from-[#c95484] via-[#d96b95] to-[#f29b77] bg-clip-text text-transparent premium-heading">
                DeepSkyn
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-sm">
                {t("footer.brandDescription")}
            </p>
            <div className="space-y-2">
              <a
                href="mailto:hello@deepskyn.com"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#bb4b7d] dark:hover:text-[#f2a1c0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#d96b95] rounded w-fit"
                aria-label={t("footer.emailUs")}
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                <span>hello@deepskyn.com</span>
              </a>
              <a
                href="tel:+15551234567"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#bb4b7d] dark:hover:text-[#f2a1c0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#d96b95] rounded w-fit"
                aria-label={t("footer.callUs")}
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>+1 (555) 123-4567</span>
              </a>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4" aria-hidden="true" />
                <span>{t("footer.location")}</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-gray-800 dark:text-white mb-4">{t("footer.product")}</h3>
            <ul className="space-y-2" role="list">
              {footerLinks.product.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-600 dark:text-gray-300 hover:text-[#bb4b7d] dark:hover:text-[#f2a1c0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#d96b95] rounded block w-fit"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-gray-800 dark:text-white mb-4">{t("footer.company")}</h3>
            <ul className="space-y-2" role="list">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-600 dark:text-gray-300 hover:text-[#bb4b7d] dark:hover:text-[#f2a1c0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#d96b95] rounded block w-fit"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-gray-800 dark:text-white mb-4">{t("footer.support")}</h3>
            <ul className="space-y-2" role="list">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-600 dark:text-gray-300 hover:text-[#bb4b7d] dark:hover:text-[#f2a1c0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#d96b95] rounded block w-fit"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="border-t border-[#f2bfd1] dark:border-[#6a4757] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            © {currentYear} DeepSkyn. {t("footer.copyrightSuffix")}
          </p>

          <div className="flex items-center gap-4" role="list" aria-label={t("footer.socialMediaLinks")}>
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#ffe6ef] dark:bg-white/8 hover:bg-[#d96b95] dark:hover:bg-[#d96b95] text-[#d96b95] hover:text-white transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#d96b95]"
                  aria-label={social.ariaLabel}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Accessibility Statement */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t("footer.accessibilityCommitment")} {" "}
            <Link
              to="/contact"
              className="text-[#bb4b7d] hover:underline focus:outline-none focus:ring-2 focus:ring-[#d96b95] rounded"
            >
              {t("footer.contactUs")}
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
