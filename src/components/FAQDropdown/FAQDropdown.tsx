import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";

export const FAQDropdown = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuId = "faq-menu";
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

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
      answer:
        "You can publish your work on the community page for other users to see and evaluate. You can also see projects of other users. These projects can get upvoted, favored and commented.",
    },
  ];

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const target = e.target as Node | null;
      if (target && !containerRef.current.contains(target)) {
        setIsOpen(false);
        setOpenIndex(null);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setOpenIndex(null);
      }
    };

    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleEsc as any);

    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleEsc as any);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    setIsOpen((v) => {
      const next = !v;
      if (!v) {
        setOpenIndex(null);
      }
      return next;
    });
  };

  const onButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleOpen();
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setOpenIndex(null);
    }
  };

  useEffect(() => {
    if (isOpen && itemRefs.current[0]) {
      setTimeout(() => itemRefs.current[0]?.focus(), 0);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative flex items-center gap-1">
      <QuestionMarkCircleIcon className="h-5 w-5 text-[#473885] dark:text-[#c4b5fd]" />
      <button
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={toggleOpen}
        onKeyDown={onButtonKeyDown}
        className="text-sm text-[#261e3b] dark:text-[#afa6c5] cursor-pointer hover:text-[#9c85d4] dark:hover:text-[#ffffff] transition-colors duration-150 font-medium"
      >
        FAQ
      </button>

      <div
        id={menuId}
        role="menu"
        aria-hidden={!isOpen}
        className={`
          absolute top-full mt-2
          w-[90vw] max-w-md
          bg-[#e7e3f6] dark:bg-[#1e1538]
          border border-[#aca0d6] dark:border-[#32265b]
          rounded-xl shadow-[0_2px_50px_rgba(0,0,0,0.3)]
          p-4 transition-all duration-300
          z-50
          ${isOpen ? "opacity-100 translate-y-0 -translate-x-1/2 pointer-events-auto transition duration-800" : "opacity-0 translate-y-1 -translate-x-1/2 pointer-events-none transition duration-800"}`}
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
                ref={(el) => {
                  if (el) {
                    itemRefs.current[index] = el;
                  }
                }}
                className="w-full text-left font-semibold text-[#261e3b] dark:text-[#c2bad8] focus:outline-none cursor-pointer hover:text-[#9c85d4] dark:hover:text-[#ffffff] transition-colors duration-150"
                role="menuitem"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                onClick={() => toggleItem(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleItem(index);
                  }
                }}
              >
                {faq.question}
              </button>
              {openIndex === index && (
                <p
                  id={`faq-answer-${index}`}
                  className="mt-1 text-[#261e3b] dark:text-[#afa6c5]"
                >
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
