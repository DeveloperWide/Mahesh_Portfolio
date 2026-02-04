import { Link } from "react-router";
import Image1 from "../../assets/Image_1.webp";
import { useViewerMode } from "../../context/viewerMode";

const Home = () => {
  const { mode } = useViewerMode();
  const isStudent = mode === "student";

  return (
    <section className="min-h-screen  text-gray-100 flex items-center">
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div>
          <p className="text-sm uppercase tracking-widest font-bold text-gray-600 mb-4">
            {isStudent ? "Mentor • Full Stack Dev" : "Full Stack Developer"}
          </p>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-black mb-6">
            {isStudent ? (
              <>
                Learn to build{" "}
                <span className="text-amber-500">real projects</span>
                <br />
                with MERN & TypeScript
              </>
            ) : (
              <>
                Building <span className="text-amber-500">scalable</span> web
                <br />
                experiences with MERN
              </>
            )}
          </h1>

          <p className="text-gray-600 text-lg mb-8">
            {isStudent
              ? "Join my courses for project-based learning — clean code, real-world architecture, and shipping mindset."
              : "I design and develop high-performance web applications using modern technologies like React, Node.js, MongoDB, and TypeScript. Focused on clean code, real-world architecture, and results."}
          </p>

          <div className="flex gap-4">
            {isStudent ? (
              <>
                <Link
                  to="/courses"
                  className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-medium"
                >
                  Browse Courses
                </Link>
                <Link
                  to="/work"
                  className="px-6 py-3 rounded-lg border text-black border-gray-700 hover:border-gray-500 transition font-medium"
                >
                  View Projects
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/work"
                  className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-medium"
                >
                  View Projects
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-3 rounded-lg border text-black border-gray-700 hover:border-gray-500 transition font-medium"
                >
                  Contact Me
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right Content */}
        <div>
          <img
            src={`${Image1}`}
            alt="Mahesh Rana"
            className="w-100 h-100 object-cover object-center rounded-[25%_10%]"
          />
        </div>
      </div>
    </section>
  );
};

export default Home;
