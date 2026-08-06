"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import PixelMascot from "@/components/Portfolio/PixelMascot";
import SectionHeading from "@/components/Portfolio/SectionHeading";

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
    <div className="pf-section-wrap">
      <section id="pf-contact" className="pf-section pf-container">
        <SectionHeading tag="07 // Comms" title="Let's Connect" />

        <form onSubmit={handleSubmit} className="pf-contact-box">
          <p className="pf-form-note" style={{ marginBottom: "1rem" }}>
            Just your name, email, and what&apos;s on your mind.
          </p>

          <div className="pf-field">
            <label htmlFor="name">Name</label>
            <input
              onChange={handleChange}
              value={data.name}
              name="name"
              id="name"
              type="text"
              required
            />
          </div>

          <div className="pf-field">
            <label htmlFor="email">Email</label>
            <input
              onChange={handleChange}
              value={data.email}
              name="email"
              id="email"
              type="email"
              required
            />
          </div>

          <div className="pf-field">
            <label htmlFor="message">Message</label>
            <textarea
              onChange={handleChange}
              value={data.message}
              name="message"
              id="message"
              rows={5}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="pf-btn pf-btn-solid" style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Sending..." : "Send Message"}
          </button>
          <p className="pf-form-note">Message goes straight to my inbox via a secure server-side integration — no key ever touches the browser.</p>
        </form>
      </section>
      <PixelMascot pose="contact" side="right" />
    </div>
  );
};

export default Contact;
