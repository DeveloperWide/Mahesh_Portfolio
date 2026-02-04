import { Link } from "react-router";
import CallBookingCard from "../../components/calls/CallBookingCard";
import { useViewerMode } from "../../context/viewerMode";

const BookCall = () => {
  const { mode, setMode } = useViewerMode();

  if (mode !== "student") {
    return (
      <section className="min-h-screen flex items-center">
        <div className="max-w-3xl mx-auto px-6 py-24 w-full">
          <div className="border border-gray-200 bg-white rounded-2xl p-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Call slots are for Students
            </h1>
            <p className="mt-2 text-gray-600">
              Switch to Student mode to see available call slots (8 PM → 9 AM).
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setMode("student")}
                className="px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800"
              >
                Switch to Student
              </button>
              <Link
                to="/contact"
                className="px-5 py-3 rounded-xl border border-gray-200 text-gray-900 font-semibold hover:bg-gray-50"
              >
                Contact instead
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center">
      <div className="max-w-4xl mx-auto px-6 py-24 w-full">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-widest font-bold text-gray-600 mb-4">
            Call Slots
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Schedule a Call
          </h2>
          <p className="text-gray-600 text-lg">
            Pick a date and time, add a title + topic, then pay to confirm.
          </p>
        </div>

        <CallBookingCard />
      </div>
    </section>
  );
};

export default BookCall;

