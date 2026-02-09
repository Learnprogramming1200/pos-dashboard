"use client";


import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type SimpleCalculatorProps = {
  handleNavigation?: () => void;
};

// Display field
export type NormalCalculatorDisplayFieldProps = {
  value: number | undefined | string;
};

export function NormalCalculatorDisplayField({ value }: Readonly<NormalCalculatorDisplayFieldProps>): React.JSX.Element {
  const displayValue = String(value ?? "");
  return (
    <input
      type="text"
      data-testid="normal-calculator-display-field"
      className="w-[188px] min-w-[188px] h-full min-h-[30px] bg-white rounded-[3px] border border-gray-400 border-b-[3px] border-b-gray-400 pr-[5px] outline-none text-end text-[17px] text-gray-900 leading-[14px] font-normal mb-[7px]"
      value={displayValue}
      readOnly
    />
  );
}

type NormalCalculatorOperationButtonProps = {
  value: string | number;
  span?: number;
  rowSpan?: number;
  bgColor?: string;
  bgBottom?: string;
  hoverBgColor?: string;
  textColor?: string;
  SvgIcon?: string;
  extraMargin?: boolean;
  fontSize?: string;
  onClick?: () => void;
};

export function NormalCalculatorOperationButton({
  value,
  rowSpan,
  SvgIcon,
  span = 1,
  extraMargin,
  fontSize = "12px",
  bgColor = "#F1F1F1",
  bgBottom = "#AAAAAA",
  textColor = "#2E2E2E",
  hoverBgColor = "#EAEAEA",
  onClick,
}: Readonly<NormalCalculatorOperationButtonProps>): React.JSX.Element {
  const buttonStyle: React.CSSProperties = {
    "--button-color": bgColor,
    "--button-font-size": fontSize,
    "--button-text-color": textColor,
    "--button-border-color": bgBottom,
    "--button-hover-color": hoverBgColor,
    "--button-border-bottom-color": bgBottom,
    "--button-border-color-active": hoverBgColor,
    "--button-border-bottom-active": hoverBgColor,
  } as React.CSSProperties;

  return (
    <button
      style={buttonStyle}
      data-testid="normal-calculator-operation-button"
      className={`min-w-[33px] min-h-[28px] flex items-center justify-center font-bold leading-[14px] rounded border border-[var(--button-border-color)] border-b-[3px] border-b-[var(--button-border-bottom-color)] text-[var(--button-text-color)] active:border-b-[var(--button-border-bottom-active)] active:border-[var(--button-border-color-active)] text-center bg-[var(--button-color)] hover:bg-[var(--button-hover-color)] ${span === 2 ? "col-span-2" : ""} ${rowSpan === 2 ? "row-span-2 h-[98%]" : ""} ${extraMargin ? "mr-[2px]" : ""}`}
      onClick={onClick}
    >
      <span style={{ fontSize: "var(--button-font-size)" }}>
        {SvgIcon ? <Image src={SvgIcon} alt={String(value)} /> : value}
      </span>
    </button>
  );
}

// Internal calculator logic (self-contained; no external context/assets needed)
export default function SimpleCalculator({ handleNavigation }: Readonly<SimpleCalculatorProps>): React.JSX.Element {
  const [display, setDisplay] = useState<string>(""); // expression being typed
  const [result, setResult] = useState<string>("0");
  const [memory, setMemory] = useState<number>(0);
  const [hasMemory, setHasMemory] = useState<boolean>(false);
  const lastEvaluatedRef = useRef<string>("0");

  const customEval = useCallback(() => display, [display]);
  const customResult = useCallback(() => result, [result]);
  const isMemoryStored = hasMemory;

  const evaluateSafely = useCallback((expr: string): string => {
    if (!expr.trim()) return "0";
    const sanitized = expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/");
    try {
      // eslint-disable-next-line no-new-func
      const value = Function(`"use strict"; return (${sanitized})`)();
      if (typeof value === "number") {
        if (!isFinite(value)) return String(value);
        return String(value);
      }
      return String(value ?? 0);
    } catch {
      return "NaN";
    }
  }, []);

  const setAndEval = useCallback((next: string) => {
    setDisplay(next);
    const v = evaluateSafely(next);
    setResult(v);
  }, [evaluateSafely]);

  const keyPress = useCallback((key: string) => {
    switch (key) {
      // memory
      case "MC":
        setMemory(0);
        setHasMemory(false);
        return;
      case "MR":
        setAndEval(display + String(memory));
        return;
      case "MS":
        setMemory(Number(result) || 0);
        setHasMemory(true);
        return;
      case "M+":
        setMemory((m) => (m + (Number(result) || 0)));
        setHasMemory(true);
        return;
      case "M-":
        setMemory((m) => (m - (Number(result) || 0)));
        setHasMemory(true);
        return;

      // editing
      case "⌫":
      case "BACKSPACE":
        setAndEval(display.slice(0, -1));
        return;
      case "C":
      case "CLEAR":
        setDisplay("");
        setResult("0");
        return;

      // unary
      case "+/-":
      case "PLUS_MINUS": {
        if (!display) {
          setAndEval("-" + result);
        } else {
          // toggle last number sign
          const m = display.match(/([\d.]+)$ /);
          // simple fallback
          setAndEval(display.startsWith("-") ? display.slice(1) : "-" + display);
        }
        return;
      }
      case "√":
      case "ROOT": {
        const v = Number(result);
        const r = Math.sqrt(v);
        const s = String(r);
        setDisplay(s);
        setResult(s);
        return;
      }
      case "1/x":
      case "RECIPROCAL": {
        const v = Number(result);
        const r = 1 / v;
        const s = String(r);
        setDisplay(s);
        setResult(s);
        return;
      }
      case "%":
      case "PERCENTAGE": {
        const v = Number(result);
        const r = v / 100;
        const s = String(r);
        setDisplay(s);
        setResult(s);
        return;
      }

      // binary ops
      case "/":
      case "DIVIDE":
        setAndEval(display + "/");
        return;
      case "*":
      case "MULTIPLY":
        setAndEval(display + "*");
        return;
      case "-":
      case "MINUS":
        setAndEval(display + "-");
        return;
      case "+":
      case "PLUS":
        setAndEval(display + "+");
        return;
      case "=":
      case "EQUAL": {
        const v = evaluateSafely(display || result);
        lastEvaluatedRef.current = v;
        setDisplay(v);
        setResult(v);
        return;
      }
      case ".":
      case "DECIMAL":
        setAndEval(display + ".");
        return;

      default: {
        // digits 0-9
        if (/^\d$/.test(key)) {
          setAndEval(display + key);
          return;
        }
      }
    }
  }, [display, evaluateSafely, result, setAndEval]);

  const displayValue = useMemo(() => customEval() ?? "", [customEval]);
  const resultValue = useMemo(() => {
    const r = customResult();
    if (typeof r === "number" && r === Infinity) return "Infinity";
    if (typeof r === "number" && Number.isNaN(r)) return "NaN";
    return String(r ?? "0");
  }, [customResult]);

  // Keyboard support for numbers and basic operators
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      // Map keyboard keys to calculator actions
      if (/^\d$/.test(key)) {
        e.preventDefault();
        keyPress(key);
        return;
      }

      switch (key) {
        case ".":
          e.preventDefault();
          keyPress("DECIMAL");
          return;
        case "/":
          e.preventDefault();
          keyPress("DIVIDE");
          return;
        case "*":
        case "x":
        case "X":
          e.preventDefault();
          keyPress("MULTIPLY");
          return;
        case "-":
          e.preventDefault();
          keyPress("MINUS");
          return;
        case "+":
          e.preventDefault();
          keyPress("PLUS");
          return;
        case "Enter":
        case "=":
          e.preventDefault();
          keyPress("EQUAL");
          return;
        case "Backspace":
          e.preventDefault();
          keyPress("BACKSPACE");
          return;
        case "Escape":
          e.preventDefault();
          keyPress("CLEAR");
          return;
        case "%":
          e.preventDefault();
          keyPress("PERCENTAGE");
          return;
        default:
          return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keyPress]);

  return (
    <div className="w-full max-w-[260px]">
      <div className="mt-[10px] pl-[10px] pr-[15px] flex flex-col">
        <NormalCalculatorDisplayField value={displayValue} />
        <NormalCalculatorDisplayField value={resultValue} />
      </div>

      <div>{isMemoryStored && <div className="w-full px-2.5 text-gray-900 text-base">M</div>}</div>

      <div className="mb-[10px] pl-[10px] pr-[15px]">
        <div className="grid grid-cols-5 gap-y-[5px] gap-x-[3px]">
          <NormalCalculatorOperationButton value="MC" onClick={() => keyPress("MC")} />
          <NormalCalculatorOperationButton value="MR" onClick={() => keyPress("MR")} />
          <NormalCalculatorOperationButton value="MS" onClick={() => keyPress("MS")} />
          <NormalCalculatorOperationButton value="M+" onClick={() => keyPress("M+")} />
          <NormalCalculatorOperationButton value="M-" onClick={() => keyPress("M-")} />

          <NormalCalculatorOperationButton value="⌫" span={2} bgColor="#ef4444" bgBottom="#b91c1c" hoverBgColor="#ef4444" textColor="#FFFFFF" extraMargin={true} onClick={() => keyPress("BACKSPACE")} />
          <NormalCalculatorOperationButton value="C" bgColor="#ef4444" bgBottom="#b91c1c" hoverBgColor="#ef4444" textColor="#FFFFFF" onClick={() => keyPress("CLEAR")} />
          <NormalCalculatorOperationButton value="±" bgColor="#ef4444" bgBottom="#b91c1c" hoverBgColor="#ef4444" textColor="#FFFFFF" fontSize="14px" onClick={() => keyPress("PLUS_MINUS")} />
          <NormalCalculatorOperationButton value="√" onClick={() => keyPress("ROOT")} />

          <NormalCalculatorOperationButton value={7} onClick={() => keyPress("7")} />
          <NormalCalculatorOperationButton value={8} onClick={() => keyPress("8")} />
          <NormalCalculatorOperationButton value={9} onClick={() => keyPress("9")} />
          <NormalCalculatorOperationButton value="÷" onClick={() => keyPress("DIVIDE")} />
          <NormalCalculatorOperationButton value="%" onClick={() => keyPress("PERCENTAGE")} />

          <NormalCalculatorOperationButton value={4} onClick={() => keyPress("4")} />
          <NormalCalculatorOperationButton value={5} onClick={() => keyPress("5")} />
          <NormalCalculatorOperationButton value={6} onClick={() => keyPress("6")} />
          <NormalCalculatorOperationButton value="×" onClick={() => keyPress("MULTIPLY")} />
          <NormalCalculatorOperationButton value="1/x" fontSize="14px" onClick={() => keyPress("RECIPROCAL")} />

          <NormalCalculatorOperationButton value={1} onClick={() => keyPress("1")} />
          <NormalCalculatorOperationButton value={2} onClick={() => keyPress("2")} />
          <NormalCalculatorOperationButton value={3} onClick={() => keyPress("3")} />
          <NormalCalculatorOperationButton value="−" onClick={() => keyPress("MINUS")} />
          <NormalCalculatorOperationButton value="=" span={1} rowSpan={2} bgColor="#2563eb" bgBottom="#1d4ed8" textColor="#ffffff" hoverBgColor="#2563eb" extraMargin={true} fontSize="20px" onClick={() => keyPress("EQUAL")} />

          <NormalCalculatorOperationButton value={0} span={2} extraMargin={true} onClick={() => keyPress("0")} />
          <NormalCalculatorOperationButton value="." onClick={() => keyPress("DECIMAL")} />
          <NormalCalculatorOperationButton value="+" onClick={() => keyPress("PLUS")} />
        </div>
      </div>
    </div>
  );
}


