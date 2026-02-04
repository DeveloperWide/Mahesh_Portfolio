import { useState } from "react";
import { instance } from "../../utils/axiosInstance";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await instance.post("/contact", { name, email, message });
      setSuccess("Message sent. I’ll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center">
      <div className="max-w-4xl mx-auto px-6 py-24 w-full">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-sm uppercase tracking-widest font-bold text-gray-600 mb-4">
            Contact
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Let’s Work Together
          </h2>
          <p className="text-gray-600 text-lg">
            Have a project in mind or just want to talk? Fill out the form below
            and I’ll get back to you.
          </p>
        </div>

        <div className="border border-gray-200 bg-white rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-900">Send a Message</h3>
          <p className="mt-1 text-sm text-gray-600">
            Prefer text? Drop your details and message here.
          </p>

          {error ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {success}
            </div>
          ) : null}

          <form
            className="mt-5 space-y-4"
            onSubmit={onSubmit}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <textarea
              rows={5}
              placeholder="Your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500"
            ></textarea>

            <button
              type="submit"
              disabled={loading || !name.trim() || !email.trim() || !message.trim()}
              className="w-full sm:w-auto px-6 py-3 bg-amber-500 text-gray-900 font-semibold rounded-xl hover:bg-amber-400 transition-all duration-300"
            >
              {loading ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
