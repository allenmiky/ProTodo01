import { FiFolder } from "react-icons/fi";

export default function Archive({ count, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-xl border border-gray-700 cursor-pointer hover:bg-gray-700 transition-all duration-200"
    >
      <FiFolder className="text-emerald-400" />
      <span className="text-sm text-gray-200">Archive</span>
      {count > 0 && (
        <span className="px-2 py-0.5 text-xs bg-emerald-500 text-white rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}