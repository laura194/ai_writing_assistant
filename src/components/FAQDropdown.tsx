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
      question: "How does it support writing?",
      answer:
        "It assists with structuring arguments, rewriting sections, improving style, checking grammar, and suggesting sources.",
    },
    {
      question: "How does editing work?",
      answer:
        "You can write directly in the app, select specific text, and request targeted AI support like style checks or grammar fixes.",
    },
    {
      question: "What role does AI play?",
      answer:
        "The Gemini model provides suggestions on structure, style, and sources — always transparently logged for integrity.",
    },
    {
      question: "How are projects managed?",
      answer:
        "Projects are saved per user. Log in with Microsoft, Google, or Apple and continue anytime.",
    },
    {
      question: "Which export formats are supported?",
      answer:
        "Word (.docx), PDF (.pdf), and LaTeX (.tex) for academic publishing needs.",
    },
    {
      question: "Is it free?",
      answer: "Yes, currently free.",
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
