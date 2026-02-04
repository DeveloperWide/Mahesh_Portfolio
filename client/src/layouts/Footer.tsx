import { Github, Linkedin, Twitter, Mail, Heart } from "lucide-react";
import { Link } from "react-router";

const socialLinks = [
  { name: "GitHub", href: "https://github.com/DeveloperWide", icon: Github },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/codebymahesh",
    icon: Linkedin,
  },
  { name: "Twitter", href: "https://twitter.com/mr7_code", icon: Twitter },
  { name: "Email", href: "mailto:maheshrana9520@gmail.com", icon: Mail },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* Main */}
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          {/* Brand */}
          <div className="space-y-3 max-w-md">
            <Link
              to="/"
              className="text-2xl font-bold text-white hover:text-amber-500 transition-colors"
            >
              Portfolio<span className="text-amber-500">.</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Full Stack MERN Developer focused on building scalable, clean, and
              real-world web applications.
            </p>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-white">Connect with me</p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-amber-500 hover:text-gray-900 transition-all duration-300"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Open to freelance & collaboration
            </p>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p className="flex items-center gap-1">
            © {currentYear} Mahesh Rana. Built with{" "}
            <Heart size={12} className="text-amber-500 fill-amber-500" /> using
            React & Tailwind.
          </p>

          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <Link
              to="/privacy"
              className="hover:text-amber-500 transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="hover:text-amber-500 transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/refunds"
              className="hover:text-amber-500 transition-colors"
            >
              Refunds
            </Link>
            <Link
              to="/delivery"
              className="hover:text-amber-500 transition-colors"
            >
              Delivery
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
