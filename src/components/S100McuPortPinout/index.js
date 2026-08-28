import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";

const PINOUT_URLS = {
  en: "pinout/s100_mcu_expansion_board_pinout_en/index.html",
  zh: "pinout/s100_mcu_expansion_board_pinout_zh/index.html",
};

const TITLES = {
  en: "30-Pin Header (J12) — Interactive Pinout",
  zh: "30-Pin 排针（J12）—— 交互式引脚定义",
};

export default function S100McuPortPinout({ lang = "en" }) {
  return (
    <a
      className="s100-pinout-card"
      href={useBaseUrl(PINOUT_URLS[lang])}
      target="_blank"
      rel="noopener noreferrer"
    >
      <svg
        className="s100-pinout-card__icon"
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
      </svg>
      <span className="s100-pinout-card__text">
        <span className="s100-pinout-card__title">
          {TITLES[lang]}
        </span>
      </span>
      <svg
        className="s100-pinout-card__arrow"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  );
}
