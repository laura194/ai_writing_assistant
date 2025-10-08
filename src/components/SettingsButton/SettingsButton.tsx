import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";

export const SettingsButton = () => {
  const [_openIndex, setOpenIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuId = "settings-menu";
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

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
      <Cog6ToothIcon className="h-5 w-5 text-[#473885] dark:text-[#c4b5fd]" />
      <button
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={toggleOpen}
        onKeyDown={onButtonKeyDown}
        className="text-sm text-[#261e3b] dark:text-[#afa6c5] cursor-pointer hover:text-[#9c85d4] dark:hover:text-[#ffffff] transition-colors duration-150 font-medium"
      >
        Settings
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
          Settings
        </h3>
      </div>
    </div>
  );
};
