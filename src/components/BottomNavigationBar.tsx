import { Brain, Settings, File } from "lucide-react";

interface BottomNavigationBarProps {
  activeView: string;
  onChangeView: (view: string) => void;
  menuOpen: boolean;
}

const BottomNavigationBar = ({
  activeView,
  onChangeView,
  menuOpen,
}: BottomNavigationBarProps) => {
  const buttons = [
    { icon: <Brain className="w-5 h-5" />, view: "ai", label: "AI Protocol" },
    {
      icon: <File className="w-5 h-5" />,
      view: "fullDocument",
      label: "Full Document",
    },
    {
      icon: <Settings className="w-5 h-5" />,
      view: "settings",
      label: "Settings",
    },
  ];

  return (
    <div
      className={`w-full ${
        menuOpen ? "flex justify-around" : "flex flex-col items-center mt-auto"
      } py-2`}
    >
      {buttons.map((btn) => (
        <button
          key={btn.view}
          onClick={() => onChangeView(btn.view)}
          className={`p-2 rounded-full mb-2 ${
            activeView === btn.view
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-300"
          }`}
          title={btn.label}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
};

export default BottomNavigationBar;
