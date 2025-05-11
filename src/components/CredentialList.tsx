import React from "react";
import CredentialItem from "./CredentialItem";
import { CredentialEntry } from "../models/Credential";

interface CredentialListProps {
  credentials: CredentialEntry[];
  visiblePasswords: { [key: number]: boolean };
  onToggleVisibility: (id: number) => void;
  onDelete: (id: number) => void;
}

const CredentialList: React.FC<CredentialListProps> = ({
  credentials,
  visiblePasswords,
  onToggleVisibility,
  onDelete,
}) => {
  return (
    <ul className="divide-y divide-gray-200">
      {credentials.map((entry) => (
        <CredentialItem
          key={entry.id}
          entry={entry}
          visible={!!visiblePasswords[entry.id]}
          onToggleVisibility={onToggleVisibility}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

export default CredentialList;
