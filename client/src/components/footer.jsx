import { Github, Linkedin, Mail, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-br from-black via-[#0a0a0a] to-black text-gray-300 py-14">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left Section */}
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-wide">Vikash Sinha</h2>
          <p className="text-gray-400">Full Stack Developer</p>
          <p className="text-gray-500 text-sm">Skills: React • Node.js • MongoDB • C++ • Tailwind • postgress • prisma • neonDB </p>
        </div>

        {/* Middle Section - Icons */}
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/vikash000x"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white hover:scale-110 transition-all duration-300"
          >
            <Github size={28} />
          </a>

          <a
            href="https://linkedin.com/in/vikash000x"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white hover:scale-110 transition-all duration-300"
          >
            <Linkedin size={28} />
          </a>

          <a
            href="mailto:vikashsinha045gmail.com"
            className="hover:text-white hover:scale-110 transition-all duration-300"
          >
            <Mail size={28} />
          </a>

          <a
            href="https://x.com/vikash000x"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white hover:scale-110 transition-all duration-300"
          >
            <Twitter size={28} />
          </a>
        </div>

        {/* Right Section */}
        <div className="text-center md:text-right space-y-3">
          <div className="flex justify-center md:justify-end">
            <a href="https://portfolio-vikash-sinhas-projects.vercel.app/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-white font-extrabold text-lg border border-white/20 shadow-lg hover:scale-110 hover:shadow-2xl transition-all duration-300">
              <span>VS</span>
            </a>
          </div>
          <p className="text-gray-400">© {new Date().getFullYear()} All Rights Reserved</p>
          <p className="text-gray-500 text-sm">Portfolio • Crafted with ❤️</p>
        </div>
      </div>
    </footer>
  );
}
