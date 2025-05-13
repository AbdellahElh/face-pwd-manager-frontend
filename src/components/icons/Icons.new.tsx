// src/components/Icons.tsx
import React from "react";
import { IconContext } from "react-icons";
import {
  HiChevronLeft,
  HiClipboardCopy,
  HiDotsVertical,
  HiExternalLink,
  HiEye,
  HiEyeOff,
  HiLogout,
  HiPlus,
  HiTrash,
  HiUser,
} from "react-icons/hi";

// Helper function to wrap icon components with IconContext
const withIconContext = (IconComponent: React.ComponentType<any>) => {
  return ({
    className,
    ...props
  }: { className?: string } & Record<string, any>) => (
    <IconContext.Provider value={{ className: `${className || "h-5 w-5"}` }}>
      <IconComponent {...props} />
    </IconContext.Provider>
  );
};

export const PlusIcon = withIconContext(HiPlus);
export const ChevronLeftIcon = withIconContext(HiChevronLeft);
export const TrashIcon = withIconContext(HiTrash);
export const EyeIcon = withIconContext(HiEye);
export const EyeOffIcon = withIconContext(HiEyeOff);
export const LogoutIcon = withIconContext(HiLogout);
export const ClipboardIcon = withIconContext(HiClipboardCopy);
export const ExternalLinkIcon = withIconContext(HiExternalLink);
export const DotsVerticalIcon = withIconContext(HiDotsVertical);
export const UserIcon = withIconContext(HiUser);
