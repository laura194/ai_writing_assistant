import { useRef, useState } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { LandingPageStyles } from "../../constants/styles/LandingPageStyles";
import EarthCanvas from "./canvas/EarthCanvas";
import { SectionWrapper } from "../../hoc";
import { slideIn } from "../../utils/motion";
import toast from "react-hot-toast";

const Contact = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const isFormValid =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.message.trim() !== "";

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { target } = e;
    const { name, value } = target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    emailjs
      .send(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          to_name: "Gero Stöwe",
          from_email: form.email,
          to_email: "gerostoewe@gmx.de",
          message: form.message,
        },
        import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY,
      )
      .then(
        () => {
          setLoading(false);
          toast.success(
            "Thank you for your message. We will get back to you as soon as possible.",
            {
              duration: 5000,
              icon: "✅",
              style: {
                background: "#1e2b2d",
                color: "#d1fae5",
                padding: "16px 20px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "500",
                boxShadow: "0 4px 12px rgba(0, 255, 170, 0.1)",
                border: "1px solid #10b981",
              },
            },
          );

          setForm({
            name: "",
            email: "",
            message: "",
          });
        },
        (error) => {
          setLoading(false);
          console.error(error);

          toast.error(
            "Something went wrong. Please try again or contact: plantfriends@gmail.com",
            {
              duration: 10000,
              icon: "❌",
              style: {
                background: "#2a1b1e",
                color: "#ffe4e6",
                padding: "16px 20px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "500",
                boxShadow: "0 4px 12px rgba(255, 0, 80, 0.1)",
                border: "1px solid #ef4444",
              },
            },
          );
        },
      );
  };

  return (
    <div
      className={`xl:mt-12 flex xl:flex-row flex-col-reverse gap-10 overflow-hidden`}
    >
      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className="flex-[0.8] bg-[#100d25] p-8 rounded-2xl"
      >
        <p className={LandingPageStyles.sectionSubText}>Get in touch</p>
        <h3 className={LandingPageStyles.sectionHeadText}>Contact.</h3>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-12 flex flex-col gap-8"
        >
          <label className="flex flex-col">
            <span className="text-white font-medium mb-4">Your Name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="What should we call you?"
              className="bg-[#151030] py-4 px-6 placeholder:text-[#aaa6c3] text-white rounded-lg outline-none border-none font-medium"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-white font-medium mb-4">Your Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="What's your email address?"
              className="bg-[#151030] py-4 px-6 placeholder:text-[#aaa6c3] text-white rounded-lg outline-none border-none font-medium"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-white font-medium mb-4">Your Message</span>
            <textarea
              rows={7}
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="What do you want to tell us?"
              className="bg-[#151030] py-4 px-6 placeholder:text-[#aaa6c3] text-white rounded-lg outline-none border-none font-medium"
            />
          </label>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`bg-[#151030] py-3 px-8 rounded-xl outline-none w-fit text-white font-bold transition-colors duration-200 mx-auto ${
              isFormValid
                ? "bg-[#151030] hover:bg-[#a199cb] hover:text-[#151030] cursor-pointer"
                : "bg-[#151030] opacity-50 cursor-not-allowed"
            }
        `}
            style={{
              boxShadow: "0 4px 6px -1px #050816, 0 2px 4px -2px #050816",
            }}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </motion.div>

      <motion.div
        variants={slideIn("right", "tween", 0.2, 1)}
        className="xl:flex-1 xl:h-auto md:h-[550px] h-[350px]"
      >
        <EarthCanvas />
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Contact, "contact");
