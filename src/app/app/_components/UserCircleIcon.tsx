"use client";

import React from "react";

export default function UserCircleIcon(props: any) {
  return (
    <svg
      {...props}
      className="text-sky-50"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
      <path d="M14.83 16.83a4 4 0 0 0-5.66 0" />
    </svg>
  );
}
