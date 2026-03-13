"use client";

import { MessageCircleQuestion, X } from "lucide-react";
import React from "react";
import * as S from "./styles";

type Props = {
  isOpen: boolean;
  onClick: () => void;
};

export default function AIFloatingButton({ isOpen, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      data-nb-explain-ignore
      style={S.fab(isOpen)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "scale(0.95)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
      }}
    >
      {isOpen ? <X size={20} /> : <MessageCircleQuestion size={22} />}
    </button>
  );
}