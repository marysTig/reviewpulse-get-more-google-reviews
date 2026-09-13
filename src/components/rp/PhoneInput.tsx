import { useState, useEffect, useRef, useMemo } from "react";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumber,
  type CountryCode,
} from "libphonenumber-js";

interface PhoneInputProps {
  /** The full international E.164 phone number, e.g. +447911123456 */
  value: string;
  /** Called when the input changes. Returns the E.164 number and whether it's currently valid */
  onChange: (value: string, isValid: boolean) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Country data helpers
// ---------------------------------------------------------------------------

const _displayNames = new Intl.DisplayNames(["en"], { type: "region" });

function getCountryName(code: string): string {
  try {
    return _displayNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

interface CountryOption {
  code: CountryCode;
  name: string;
  callingCode: string;
  flag: string;
}

/** Build a flat sorted list of all countries by calling code (ascending numeric). */
function buildCountryList(): CountryOption[] {
  return getCountries()
    .map((code) => ({
      code,
      name: getCountryName(code),
      callingCode: getCountryCallingCode(code),
      flag: getFlagEmoji(code),
    }))
    .sort((a, b) => {
      const diff = Number(a.callingCode) - Number(b.callingCode);
      if (diff !== 0) return diff;
      // Same calling code → sort by name
      return a.name.localeCompare(b.name);
    });
}

// Build once at module level so it's not rebuilt on every render
const ALL_COUNTRIES = buildCountryList();

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PhoneInput({ value, onChange, className = "" }: PhoneInputProps) {
  const [country, setCountry] = useState<CountryCode | null>(null);
  const [localValue, setLocalValue] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Parse incoming E.164 value → set country + local number
  useEffect(() => {
    try {
      if (value) {
        const parsed = parsePhoneNumber(value);
        if (parsed && parsed.country) {
          setCountry(parsed.country);
          setLocalValue(parsed.formatNational());
        }
      } else {
        setLocalValue("");
      }
    } catch {
      // Ignore parse errors for partial / invalid values
    }
  }, [value]);

  // Focus search box when dropdown opens; clear search when it closes
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 40);
    } else {
      setSearch("");
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const filteredCountries = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.callingCode.includes(q) ||
        (`+${c.callingCode}`).includes(q),
    );
  }, [search]);

  const selected = country
    ? ALL_COUNTRIES.find((c) => c.code === country) ?? null
    : null;

  function handleCountrySelect(option: CountryOption) {
    setCountry(option.code);
    setOpen(false);
    // Re-validate the local number with the new country
    if (localValue) {
      try {
        const parsed = parsePhoneNumber(localValue, option.code);
        onChange(parsed.number, parsed.isValid());
      } catch {
        onChange(localValue, false);
      }
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setLocalValue(raw);
    if (!country) {
      onChange(raw, false);
      return;
    }
    try {
      const parsed = parsePhoneNumber(raw, country);
      if (parsed) {
        onChange(parsed.number, parsed.isValid());
      } else {
        onChange(raw, false);
      }
    } catch {
      onChange(raw, false);
    }
  }

  return (
    // Outer wrapper: relative but NOT overflow-hidden so the dropdown is never clipped
    <div className={`relative w-full ${className}`}>
      {/* ---- Phone input bar ---- */}
      <div className="flex w-full overflow-hidden rounded-md border border-line bg-paper text-sm transition-colors focus-within:border-pulse focus-within:ring-2 focus-within:ring-pulse/25">
        {/* Country selector trigger */}
        <button
          type="button"
          id="phone-country-trigger"
          aria-label="Select country calling code"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen((o) => !o)}
          className="relative flex shrink-0 items-center gap-1.5 border-r border-line bg-paper pl-2.5 pr-7 py-2.5 font-mono text-sm outline-none transition-colors hover:bg-pulse-soft/40 focus-visible:ring-2 focus-visible:ring-pulse/30"
        >
          {selected ? (
            <>
              <span aria-hidden="true">{selected.flag}</span>
              <span className="text-ink-muted">(+{selected.callingCode})</span>
            </>
          ) : (
            <span className="text-ink-muted text-xs">🌐 Country</span>
          )}
          {/* Chevron */}
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={open ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"} />
            </svg>
          </span>
        </button>

        {/* Local phone number input */}
        <input
          type="tel"
          value={localValue}
          onChange={handleInputChange}
          placeholder={country ? "Enter local number" : "Select country first"}
          disabled={!country}
          aria-label="Local phone number"
          className="flex-1 min-w-0 bg-transparent px-3 py-2.5 outline-none font-mono disabled:cursor-not-allowed disabled:opacity-40"
        />
      </div>

      {/* ---- Searchable dropdown ---- */}
      {open && (
        <>
          {/* Click-away backdrop */}
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown panel */}
          <div
            role="listbox"
            aria-label="Countries"
            className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[15rem] max-w-xs rounded-xl border border-line bg-card shadow-xl overflow-hidden"
          >
            {/* Search input */}
            <div className="border-b border-line px-3 py-2.5 flex items-center gap-2">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-ink-muted"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or +code…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-muted"
                aria-label="Search countries"
                autoComplete="off"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="shrink-0 text-ink-muted hover:text-ink transition-colors"
                  aria-label="Clear search"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Country list */}
            <div
              ref={listRef}
              className="max-h-60 overflow-y-auto overscroll-contain"
            >
              {filteredCountries.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-ink-muted">
                  No countries found for "{search}"
                </div>
              ) : (
                filteredCountries.map((c) => {
                  const isSelected = country === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleCountrySelect(c)}
                      className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-pulse-soft/60 active:bg-pulse-soft min-h-[2.75rem] ${
                        isSelected
                          ? "bg-pulse-soft text-pulse-ink font-semibold"
                          : "text-ink"
                      }`}
                    >
                      <span className="text-base leading-none w-6 text-center" aria-hidden="true">
                        {c.flag}
                      </span>
                      <span className="flex-1 min-w-0 truncate">{c.name}</span>
                      <span className="shrink-0 font-mono text-xs text-ink-muted tabular-nums">
                        +{c.callingCode}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
