import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router";
import ViewerModeSwitch from "../components/ViewerModeSwitch";
import { useViewerMode } from "../context/viewerMode";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { mode } = useViewerMode();

  const navLinks =
    mode === "student"
      ? [
          { name: "Home", href: "/" },
          { name: "Work", href: "/work" },
          { name: "Courses", href: "/courses" },
          { name: "Call Slots", href: "/call" },
          { name: "Contact", href: "/contact" },
        ]
      : [
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
          { name: "Work", href: "/work" },
          { name: "Stats", href: "/stats" },
          { name: "Contact", href: "/contact" },
        ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-50/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            to="/"
            className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 hover:text-amber-500 transition-colors duration-300"
          >
            Portfolio<span className="text-amber-500">.</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="relative text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-amber-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.name}
              </Link>
            ))}
            <ViewerModeSwitch />
            <Link
              to={mode === "student" ? "/call" : "/contact"}
              className="px-5 py-2.5 bg-amber-500 text-gray-900 text-sm font-medium rounded-full hover:bg-amber-400 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25"
            >
              {mode === "student" ? "Book a Call" : "Let's Talk"}
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-900 hover:text-amber-500 transition-colors duration-300"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden fixed inset-x-0 top-16 bg-gray-50/95 backdrop-blur-lg border-b border-gray-200 transition-all duration-300 ease-out ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
      >
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium text-gray-500 hover:text-gray-900 transition-colors duration-300 py-2"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2">
            <ViewerModeSwitch />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
