"use client";

import { createContext, useState, useEffect, useRef } from "react";
import GrammerPopup from "../components/modals/GrammerPop";
import axiosInstance from "../apimodule/axiosConfig/Axios";

export const GrammarContext = createContext();

export default function GrammarProvider({ children }) {
  const [popupData, setPopupData] = useState(null);
  const [grammerResult, setGrammerResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeInput, setActiveInput] = useState(null);

  const debounceTimer = useRef(null);

  useEffect(() => {
    const validSelector =
      "input:not([type='checkbox']):not([type='radio']):not([type='password']):not([type='file']):not(.no-grammar), textarea:not(.no-grammar)";

    // Keep a ref for activeInput to avoid stale closures
    const activeInputRef = { current: null };

    const handleFocus = (e) => {
      const el = e.target;
      if (el.matches(validSelector)) {
        activeInputRef.current = el;
        setActiveInput(el); // Optional if you need it for UI
      }
    };

    const handleInput = (e) => {
      const el = e.target;
      if (el !== activeInputRef.current || !el.matches(validSelector)) return;

      const text = el.value.trim();

      // ✅ Reset if empty
      if (!text) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        setPopupData(null);
        setGrammerResult(null);
        return;
      }

      // ✅ Only check if at least 3 words
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      if (wordCount < 3) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        setPopupData(null);
        setGrammerResult(null);
        return;
      }

      // ✅ Debounce grammar check
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => checkGrammar(el, text), 700);
    };

    const handleClickOutside = (e) => {
      const popupEl = document.querySelector(".grammar-popup");
      const iconEl = document.querySelector(".grammar-icon");

      if (iconEl && iconEl.contains(e.target)) return;

      const currentInput = activeInputRef.current;

      if (
        currentInput &&
        !currentInput.contains(e.target) &&
        (!popupEl || !popupEl.contains(e.target))
      ) {
        setPopupData(null);
        setGrammerResult(null);
        activeInputRef.current = null;
        setActiveInput(null); // Optional
      }
    };

    // ✅ Attach global listeners once
    document.addEventListener("focusin", handleFocus);
    document.addEventListener("input", handleInput);
    document.addEventListener("mousedown", handleClickOutside);

    // ✅ Cleanup on unmount
    return () => {
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("input", handleInput);
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []); // ✅ Empty dependency array

  const handleAccept = () => {
    if (activeInput && grammerResult?.correctedText) {
      activeInput.value = grammerResult.correctedText;
      activeInput.dispatchEvent(new Event("input", { bubbles: true }));
      setPopupData(null);
      setGrammerResult(null);
    }
  };

  const checkGrammar = async (el, text) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post(`/grammar-check`, {
        text,
        language: "en",
        context: {
          maxSuggestions: 5,
          checkSpelling: true,
          checkGrammar: true,
          highlightOffsets: true,
        },
      });

      const data = res.data;
      setGrammerResult(data);

      // ✅ Popup positioning
      const rect = el.getBoundingClientRect();
      const popupWidth = 320;
      const popupHeight = 200;
      const gap = 8;

      // Default: bottom-right of input
      let posX = rect.right + window.scrollX - popupWidth;
      let posY = rect.bottom + window.scrollY + gap;

      // If it overflows bottom → show on top
      const viewportBottom = window.scrollY + window.innerHeight;
      if (posY + popupHeight > viewportBottom) {
        posY = rect.top + window.scrollY - popupHeight - gap; // Top-right
      }

      // If it overflows right → shift left to fit
      const viewportRight = window.scrollX + window.innerWidth;
      if (posX + popupWidth > viewportRight) {
        posX = viewportRight - popupWidth - gap;
      }

      // If it overflows left → clamp to left
      if (posX < gap) posX = gap;

      // In checkGrammar:
      setPopupData({
        x: posX,
        y: posY,
        inputRect: {
          top: rect.top + window.scrollY,
          right: rect.right + window.scrollX,
          height: rect.height,
        },
      });
    } catch (err) {
      console.error("Grammar check failed:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <GrammarContext.Provider
      value={{ grammerResult, popupData, loading, setGrammerResult }}
    >
      {children}
      {popupData && (
        <GrammerPopup
          popupPosition={popupData}
          loading={loading}
          grammerResult={grammerResult}
          setGrammerResult={setGrammerResult}
          onAccept={handleAccept}
        />
      )}
    </GrammarContext.Provider>
  );
}
