import React from "react";

interface ExportButtonProps {
  onClick: () => void;
  imageSrc: string;
  title: string;
  altText: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onClick,
  imageSrc,
  title,
  altText,
}) => {
  return (
    <button
      onClick={onClick}
      className="group p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
      title={title}
    >
      <img
        src={imageSrc}
        alt={altText}
        className="h-14 w-14 transform transition-transform duration-200 group-hover:scale-105"
      />
    </button>
  );
};

export default ExportButton;
