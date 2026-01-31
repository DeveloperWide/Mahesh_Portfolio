const Contact = () => {
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

        {/* Form */}
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
            />
          </div>

          <textarea
            rows={5}
            placeholder="Your Message"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
          ></textarea>

          <button
            type="submit"
            className="w-full md:w-auto px-8 py-3 bg-amber-500 text-gray-900 font-medium rounded-full hover:bg-amber-400 transition-all duration-300"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
