"use client";

import { useState } from "react";
import toast from "react-hot-toast";

const initialData = { name: "", email: "", message: "" };

const Contact = () => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong.");
      }

      toast.success("Message sent — I'll get back to you soon!");
      setData(initialData);
    } catch (error: any) {
      toast.error(error.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="pb-17.5 lg:pb-22.5 xl:pb-27.5">
      <div className="mx-auto max-w-[600px] px-4 sm:px-8 xl:px-0">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-3xl font-bold text-white">
            Let&apos;s Connect
          </h2>
          <p>Have an opportunity or a question? Send a message below.</p>
        </div>

        <form onSubmit={handleSubmit} className="gradient-box rounded-lg bg-dark-8 p-8">
          <div className="mb-5 flex flex-col">
            <label htmlFor="name" className="pb-2">
              Name
            </label>
            <input
              onChange={handleChange}
              value={data.name}
              name="name"
              id="name"
              type="text"
              className="rounded-lg border border-white/[0.12] bg-dark-7 px-5 py-3 text-white outline-hidden focus:border-purple"
              placeholder="Your name"
              required
            />
          </div>

          <div className="mb-5 flex flex-col">
            <label htmlFor="email" className="pb-2">
              Email
            </label>
            <input
              onChange={handleChange}
              value={data.email}
              name="email"
              id="email"
              type="email"
              className="rounded-lg border border-white/[0.12] bg-dark-7 px-5 py-3 text-white outline-hidden focus:border-purple"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-5 flex flex-col">
            <label htmlFor="message" className="pb-2">
              Message
            </label>
            <textarea
              onChange={handleChange}
              value={data.message}
              name="message"
              id="message"
              rows={5}
              className="resize-none rounded-lg border border-white/[0.12] bg-dark-7 px-5 py-3 text-white outline-hidden focus:border-purple"
              placeholder="What's on your mind?"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="hero-button-gradient w-full rounded-lg px-7 py-3 text-center font-medium text-white duration-300 ease-in hover:opacity-80 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
