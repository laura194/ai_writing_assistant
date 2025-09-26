import { useState } from "react";

export const FAQDropdown = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is this application?",
      answer:
        "A web app that helps students and researchers write academic texts while keeping full authorship control.",
    },
    {
      question: "How does AI support writing?",
      answer:
        "It assists with structuring arguments, rewriting sections, improving style, checking grammar, and suggesting sources. When you are writing a chapter, it is possible to use AI for highlighted sections or for the whole text in the chapter by clicking on the atom symbol.",
    },
    {
      question: "How does editing work?",
      answer:
        "You can write directly in every chapter of your project. Each chapter has its own writing section.",
    },
    {
      question: "Which AI am I using?",
      answer:
        "The Gemini model provides suggestions on structure, style, and sources. If you use AI for changing your written text it gets logged for integrity.",
    },
    {
      question: "How are projects managed?",
      answer:
        "You can save every new project in your account and come back to it later at any time.",
    },
    {
      question: "Which export formats are supported?",
      answer:
        "Word (.docx), PDF (.pdf), and LaTeX (.tex) for academic publishing needs. The AI protocol gets attached to the file export.",
    },
    {
      question: "What is the community page?",
      answer: "You can publish your work on the community page for other users to see and evaluate. You can also see projects of other users. These projects can get upvoted, favored and commented.",
    },
  ];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="relative">
      <button className="peer text-sm text-[#261e3b] dark:text-[#afa6c5]">
        FAQ
      </button>

      <div
        className="
          absolute top-full mt-2
          w-[90vw] max-w-md
          bg-[#e7e3f6] dark:bg-[#1e1538]
          border border-[#aca0d6] dark:border-[#32265b]
          rounded-xl shadow-[0_2px_50px_rgba(0,0,0,0.3)]
          p-4 opacity-0
          peer-hover:opacity-100
          hover:opacity-100
          transition-all duration-300
          z-50
          left-1/2 -translate-x-1/2
        "
      >
        <h3 className="text-lg font-bold mb-4 text-[#261e3b] dark:text-[#c2bad8]">
          Frequently Asked Questions
        </h3>

        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b border-[#aca0d6] dark:border-[#32265b] pb-2"
            >
              <button
                className="w-full text-left font-semibold text-[#261e3b] dark:text-[#c2bad8] focus:outline-none"
                onClick={() => toggle(index)}
              >
                {faq.question}
              </button>
              {openIndex === index && (
                <p className="mt-1 text-[#261e3b] dark:text-[#afa6c5]">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
