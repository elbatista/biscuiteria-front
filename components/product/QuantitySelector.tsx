"use client";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 100,
}: QuantitySelectorProps) {
  function clamp(nextValue: number) {
    return Math.min(max, Math.max(min, nextValue));
  }

  function decrease() {
    onChange(clamp(value - 1));
  }

  function increase() {
    onChange(clamp(value + 1));
  }

  function handleInputChange(nextValue: string) {
    if (nextValue === "") {
      onChange(min);
      return;
    }

    const parsed = Number(nextValue);

    if (Number.isNaN(parsed)) return;

    onChange(clamp(parsed));
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-zinc-900">Quantidade</span>

      <div className="inline-flex items-center overflow-hidden rounded-2xl border border-[var(--rose-100)] bg-white">
        <button
          type="button"
          onClick={decrease}
          className="h-11 w-11 cursor-pointer rounded-l-2xl text-lg text-zinc-900 transition hover:bg-[var(--rose-50)]"
          aria-label="Diminuir quantidade"
        >
          −
        </button>

        <input
          type="number"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          className="h-11 w-16 border-x border-[var(--rose-100)] bg-white text-center text-sm font-semibold text-zinc-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label="Quantidade"
        />

        <button
          type="button"
          onClick={increase}
          className="h-11 w-11 cursor-pointer rounded-r-2xl text-lg text-zinc-900 transition hover:bg-[var(--rose-50)]"
          aria-label="Aumentar quantidade"
        >
          +
        </button>
      </div>
    </div>
  );
}