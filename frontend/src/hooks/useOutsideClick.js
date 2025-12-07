import { useEffect } from "react";

export default function useOutsideClick(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      // If there's no ref or it's clicked inside the ref — ignore
      if (!ref.current || ref.current.contains(event.target)) return;

      // ✅ Only trigger close if clicked outside the menu
      callback();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [ref, callback]);
}
