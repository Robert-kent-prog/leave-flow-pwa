import React from "react";
import { User } from "../../types/leave";

interface UserFilterProps {
  users: User[];
  selectedUser: string;
  onUserChange: (userId: string) => void;
}

export const UserFilter: React.FC<UserFilterProps> = ({
  users,
  selectedUser,
  onUserChange,
}) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <label className="text-sm font-medium text-gray-700">
        Filter by User:
      </label>
      <select
        value={selectedUser}
        onChange={(e) => onUserChange(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Users</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.department})
          </option>
        ))}
      </select>
    </div>
  );
};
