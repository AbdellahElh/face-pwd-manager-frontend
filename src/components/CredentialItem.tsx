import React from "react";
import { CredentialEntry } from "../models/Credential";
import { EyeIcon, EyeOffIcon, TrashIcon } from "./icons/Icons";

interface CredentialProps {
  entry: CredentialEntry;
  visible: boolean;
  onToggleVisibility: (id: number) => void;
  onDelete: (id: number) => void;
}

const CredentialItem: React.FC<CredentialProps> = ({
  entry,
  visible,
  onToggleVisibility,
  onDelete,
}) => {
  return (
    <li className="flex items-center justify-between py-2 whitespace-nowrap">
      <div className="flex-1 flex items-center lg:w-md md:w-sm sm:w-xs xs:w-xxs gap-x-2 md:gap-x-4 overflow-hidden">
        <strong className="text-sm md:text-base truncate">
          {entry.title}:
        </strong>
        <span className="text-xs md:text-sm truncate">
          {visible ? entry.password : "••••••••"}
        </span>
      </div>
      <div className="flex items-center gap-x-2 justify-end">
        <button
          onClick={() => onToggleVisibility(entry.id)}
          className="hover:text-gray-700 flex-shrink-0"
          title={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOffIcon className="h-4 w-4 md:h-5 md:w-5" />
          ) : (
            <EyeIcon className="h-4 w-4 md:h-5 md:w-5" />
          )}
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          className="flex items-center gap-x-1 bg-[#0a0a0a] text-white hover:text-red-600 px-2 sm:px-3 py-1 rounded-lg border border-transparent hover:border-red-600 transition flex-shrink-0"
          title="Delete"
        >
          <TrashIcon className="h-4 w-4 xs:h-3 xs:w-3 md:h-5 md:w-5" />
          <span className="hidden sm:inline text-xs md:text-sm">Delete</span>
        </button>
      </div>
    </li>
  );
};

export default CredentialItem;
