import { SignUp } from "@clerk/clerk-react";
import "boxicons/css/boxicons.min.css";
import { motion } from "framer-motion";
import SignUpAnim from "../../assets/images/sign-up-animate.svg?react";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-[#090325] overflow-x-hidden">
      {/* Left Side */}
      <motion.section
        initial={{ opacity: 0, x: -150 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.8 }}
        className="lg:w-3/5 flex items-center justify-center px-14 py-8"
      >
        <div className="w-full bg-[#180d33] rounded-2xl shadow-xl p-4 relative overflow-hidden">
          {/* Blinking Circles */}
          <motion.div
            className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-[#bf93ef] opacity-10"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-12 left-16 transform -translate-x-1/2 w-72 h-72 rounded-full bg-[#8b5cf6] opacity-15"
            animate={{ opacity: [0.25, 0.6, 0.25] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Header Inside Card */}
          <div className="mb-10 text-center">
            <i
              className="bx bx-user-plus text-7xl text-[#9a7cf5] mb-2"
              data-aos="fade-down"
              data-aos-delay="600"
              data-aos-duration="1200"
            ></i>
            <h2
              className="text-4xl font-semibold text-white tracking-wide uppercase"
              data-aos="fade-right"
              data-aos-delay="1400"
              data-aos-duration="500"
            >
              Sign Up To Continue
            </h2>
            <p
              className="mt-3 text-[#aaa6c3] tracking-wider"
              data-aos="fade-left"
              data-aos-delay="1800"
              data-aos-duration="500"
            >
              Sign up to unlock your personal writing assistant and start your
              journey to better writing.
            </p>
          </div>
          {/* SignIn Form */}
          <div
            className="z-10 mb-4 items-center justify-center flex"
            data-aos="fade-up"
            data-aos-delay="2200"
            data-aos-duration="700"
          >
            <SignUp
              path="/signUp"
              routing="path"
              appearance={{
                variables: {
                  colorPrimary: "#915EFF",
                  colorBackground: "#f3efff",
                  colorTextSecondary: "#312448",
                  fontFamily: "Roboto, sans-serif",
                  borderRadius: "14px",
                },
                elements: {
                  card: {
                    boxShadow: "0 5px 40px rgba(0,0,0,0.2)",
                    backgroundColor: "#f3efff",
                    borderRadius: "0px",
                  },
                  headerTitle: {
                    fontSize: "1.25rem",
                    textTransform: "uppercase",
                    color: "#220d4b",
                    marginBottom: "0.25rem",
                  },
                  headerSubtitle: {
                    fontSize: "0.9rem",
                    color: "#32265b",
                  },
                  formFieldLabel: {
                    color: "#32265b",
                    fontSize: "0.85rem",
                  },
                  formFieldInput: {
                    backgroundColor: "#ece9f6",
                    fontSize: "0.95rem",
                    borderRadius: "8px",
                    padding: "0.65rem 0.75rem",
                  },
                  formButtonPrimary: {
                    backgroundColor: "#7156dc",
                    fontWeight: 600,
                    fontSize: "1rem",
                    borderRadius: "50px",
                    padding: "0.6rem",
                    color: "#f6f4fc",
                  },
                  footerActionText: {
                    color: "#4f3d6b",
                    fontSize: "0.85rem",
                  },
                  footerActionLink: {
                    color: "#7156dc",
                    fontSize: "0.9rem",
                  },
                },
              }}
            />
          </div>
        </div>
      </motion.section>

      {/* Divider */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ delay: 2.75, duration: 0.75 }}
        className="hidden lg:block w-1 bg-[#b894ee] rounded-full"
      />

      {/* Right Side */}
      <motion.section
        initial={{ opacity: 0, x: 150 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.8 }}
        className="relative lg:w-2/5 flex items-center justify-center p-14 
             bg-gradient-to-br from-[#442c76] to-[#a989ef] overflow-hidden"
      >
        {/* The Circles */}
        <motion.div
          className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#aea9ce] opacity-20"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 4.5,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[#372363] opacity-25"
          animate={{ scale: [1, 0.9, 1] }}
          transition={{
            duration: 5,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />

        {/* Content-Card with Gradient Border */}
        <motion.div
          initial={{ backgroundPosition: "0% 50%" }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{
            duration: 2,
            ease: "linear",
            repeat: Infinity,
          }}
          className="relative p-1 rounded-[20px] overflow-hidden shadow-[0px_35px_120px_-15px_rgba(33,30,53,0.7)]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #915EFF, #00FFA3, #FF4ED0)",
            backgroundSize: "200% 200%",
          }}
        >
          <div className="bg-[#151030] rounded-[18px] min-h-[55vh] flex flex-col items-center text-center p-4">
            {/* Heading */}
            <h1
              data-aos="fade-down"
              data-aos-duration="1200"
              data-aos-delay="600"
              className="mt-4 text-5xl font-bold text-white mb-6 uppercase"
            >
              Let's Get Started!
            </h1>

            {/* Text */}
            <p
              data-aos="fade-up"
              data-aos-delay="1400"
              data-aos-duration="800"
              className="text-lg text-[#aaa6c3] leading-relaxed mb-8 px-4 tracking-wider"
            >
              First time here?
              <br />
              Discover how structured writing meets smart assistance. From your
              first outline to the final draft - our AI supports every step of
              your academic work. Sign up now and start writing with clarity,
              focus and confidence.
            </p>

            <div className="w-80 h-80 mx-auto mb-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0 }}
              >
                <SignUpAnim />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </main>
  );
}
