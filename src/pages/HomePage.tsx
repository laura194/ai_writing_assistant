import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { FolderPlus, FolderOpen } from "lucide-react";
import Header from "../components/Header";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-[#090325] text-white relative overflow-hidden flex flex-col items-center">
      <Header />

      {/* Background Gradient Blobs */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#9469f7] opacity-20 blur-3xl"
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] rounded-full bg-[#7845ef] opacity-20 blur-3xl"
        animate={{ scale: [1, 0.85, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="flex-1 flex items-center justify-center relative pt-14">
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[900px] h-[880px] bg-[#9a58eb] opacity-15 blur-3xl rounded-full mix-blend-screen" />
        </div>
        {/* Main Content */}
        <main className="flex flex-1 justify-center items-center z-10 w-full py-10">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4 }}
          >
            <motion.div
              initial={{ backgroundPosition: "0% 50%" }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{
                ease: "linear",
                duration: 4,
                repeat: Infinity,
              }}
              className="p-[3px] rounded-3xl shadow-[0_0_30px_rgba(139,92,246,0.25)] w-full max-w-3xl"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #7c3aed, #db2777, #facc15)",
                backgroundSize: "200% 200%",
              }}
            >
              <div className="bg-[#1e1538] rounded-3xl px-10 py-10 text-center w-full min-h-[720px]">
                <h1
                  data-aos="fade-down"
                  data-aos-duration="1000"
                  data-aos-delay="1400"
                  className="text-5xl md:text-6xl font-bold mb-8 tracking-tight uppercase"
                >
                  Welcome to your
                  <br />
                  AI Writing Assistant,
                  <br />
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-400 bg-clip-text text-transparent font-bold tracking-normal">
                    {user?.firstName
                      ? `${user.firstName}!`
                      : user?.username
                        ? `${user.username}!`
                        : "!"}
                  </span>
                </h1>

                <p
                  data-aos="fade-up"
                  data-aos-duration="700"
                  data-aos-delay="2100"
                  className="text-[#aaa6c3] text-lg max-w-[600px] leading-relaxed mb-12 mx-auto text-center"
                >
                  Ready to turn your next big idea into a structured, focused
                  draft?
                  <br />
                  <span className="block h-3" />
                  Let our AI be your co-writer - precise, reliable, and always
                  by your side, from your first sentence to the final polish.
                  <br />
                  <span className="block h-3" />
                  Whether you're starting from scratch or picking up where you
                  left off:
                  <br />
                  <strong>
                    Create a new project or continue an existing one -
                    seamlessly.
                  </strong>
                </p>

                {/* Create New Project Button */}
                <div
                  data-aos="fade-left"
                  data-aos-duration="800"
                  data-aos-delay="2700"
                >
                  <motion.div
                    onClick={() => navigate("/structureSelection")}
                    whileHover={{
                      scale: 1.05,
                      rotate: 1.5,
                      boxShadow: "0 0 20px rgba(0,255,163,0.5)",
                    }}
                    className="cursor-pointer mb-8 p-[2px] rounded-xl bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500"
                  >
                    <div className="group flex items-center justify-center w-full bg-[#1e1538] bg-opacity-90 backdrop-blur-md p-6 rounded-xl shadow-inner shadow-cyan-800/40 border border-[#32265b]">
                      <FolderPlus className="w-8 h-8 stroke-[#00FFD1]" />
                      <span className="ml-4 text-xl text-[#00FFD1] font-semibold transition-colors duration-300 group-hover:text-[#d7faf3] relative before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-[2px] before:bg-[#00FFD1] group-hover:before:w-full before:transition-all before:duration-300">
                        Create New Project
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Open Existing Project Button */}
                <div
                  data-aos="fade-right"
                  data-aos-duration="800"
                  data-aos-delay="3000"
                >
                  <motion.div
                    onClick={() => navigate("/myProjects")}
                    whileHover={{
                      scale: 1.05,
                      rotate: -1.5,
                      boxShadow: "0 0 20px rgba(251,146,60,0.5)",
                    }}
                    className="cursor-pointer p-[2px] rounded-xl bg-gradient-to-r from-red-500 via-orange-400 to-yellow-500"
                  >
                    <div className="group flex items-center justify-center w-full bg-[#1e1538] bg-opacity-90 backdrop-blur-md p-6 rounded-xl shadow-inner shadow-orange-800/40 border border-[#32265b]">
                      <FolderOpen className="w-8 h-8 stroke-[#eeae38]" />
                      <span className="ml-4 text-xl text-[#eeae38] font-semibold transition-colors duration-300 group-hover:text-[#faebcf] relative before:absolute before:-bottom-1 before:right-0 before:w-0 before:h-[2px] before:bg-[#eeae38] group-hover:before:w-full before:transition-all before:duration-300">
                        Open Existing Project
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
