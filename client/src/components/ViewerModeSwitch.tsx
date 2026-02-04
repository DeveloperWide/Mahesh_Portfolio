import { useViewerMode } from "../context/viewerMode";

const ViewerModeSwitch = () => {
  const { mode, setMode } = useViewerMode();

  return (
    <div className="inline-flex items-center rounded-full border border-gray-200 bg-white/80 p-1 text-xs font-semibold text-gray-700 shadow-sm">
      <button
        type="button"
        onClick={() => setMode("hr")}
        className={`px-3 py-1 rounded-full transition ${
          mode === "hr" ? "bg-gray-900 text-white" : "hover:bg-gray-100"
        }`}
        aria-pressed={mode === "hr"}
      >
        HR View
      </button>
      <button
        type="button"
        onClick={() => setMode("student")}
        className={`px-3 py-1 rounded-full transition ${
          mode === "student" ? "bg-gray-900 text-white" : "hover:bg-gray-100"
        }`}
        aria-pressed={mode === "student"}
      >
        Student View
      </button>
    </div>
  );
};

export default ViewerModeSwitch;

