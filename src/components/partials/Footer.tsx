import React from "react";

export default function Footer({ collapsed }: { collapsed: boolean }) {
  return (
    <footer
      className={`h-12 fixed bottom-0 ${collapsed ? "left-0 lg:left-20" : "left-0 lg:left-64"
        } right-0 bg-[#f7f7f7] dark:bg-[#333333] flex items-center justify-center text-sm z-30 transition-all duration-300`}
    >
      © 2025 Your Company
    </footer>
  );
}
