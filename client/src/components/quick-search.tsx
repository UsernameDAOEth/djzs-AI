import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, BookOpen, Globe, Layers, ArrowRight, Clock } from "lucide-react";
import { searchEntries, type VaultEntry, type EntryType } from "@/lib/vault";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type FilterType = "all" | "journal" | "research";

interface QuickSearchProps {
  open: boolean;
  onClose: () => void;
  onSelectEntry: (entry: VaultEntry) => void;
}

export function QuickSearch({ open, onClose, onSelectEntry }: QuickSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VaultEntry[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setFilter("all");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const doSearch = useCallback((q: string, f: FilterType) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!q.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    timerRef.current = setTimeout(async () => {
      const typeFilter = f === "all" ? undefined : (f as EntryType);
      const res = await searchEntries(q, typeFilter, 30);
      setResults(res);
      setSelectedIndex(0);
      setIsSearching(false);
    }, 120);
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    doSearch(val, filter);
  };

  const handleFilterChange = (f: FilterType) => {
    setFilter(f);
    doSearch(query, f);
  };

  const handleSelect = (entry: VaultEntry) => {
    onSelectEntry(entry);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      scrollToSelected(selectedIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
      scrollToSelected(selectedIndex - 1);
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  const scrollToSelected = (index: number) => {
    if (!resultsRef.current) return;
    const items = resultsRef.current.querySelectorAll("[data-search-item]");
    items[index]?.scrollIntoView({ block: "nearest" });
  };

  const highlightMatch = (text: string, q: string) => {
    if (!q.trim()) return text.slice(0, 160) + (text.length > 160 ? "..." : "");
    const lower = text.toLowerCase();
    const qLower = q.toLowerCase();
    const idx = lower.indexOf(qLower);
    if (idx < 0) return text.slice(0, 160) + (text.length > 160 ? "..." : "");

    const contextStart = Math.max(0, idx - 50);
    const contextEnd = Math.min(text.length, idx + q.length + 100);
    const before = (contextStart > 0 ? "..." : "") + text.slice(contextStart, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length, contextEnd) + (contextEnd < text.length ? "..." : "");

    return (
      <>
        <span className="text-gray-500">{before}</span>
        <span className="text-orange-400 font-semibold bg-orange-500/15 px-0.5 rounded">{match}</span>
        <span className="text-gray-500">{after}</span>
      </>
    );
  };

  const filters: { key: FilterType; label: string; icon: typeof Layers }[] = [
    { key: "all", label: "All", icon: Layers },
    { key: "journal", label: "Journal", icon: BookOpen },
    { key: "research", label: "Research", icon: Globe },
  ];

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
          onClick={onClose}
          data-testid="quick-search-overlay"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-xl rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
            style={{ background: "#1a1d26" }}
            onClick={(e) => e.stopPropagation()}
            data-testid="quick-search-panel"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
              <Search className="w-5 h-5 text-gray-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search your entries..."
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
                data-testid="input-quick-search-modal"
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setResults([]); }}
                  className="text-gray-500 hover:text-white transition-colors"
                  data-testid="button-clear-search-modal"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-600 border border-white/[0.08] bg-white/[0.03]">
                ESC
              </kbd>
            </div>

            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/[0.04]">
              {filters.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handleFilterChange(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === key
                      ? key === "journal"
                        ? "text-orange-400 bg-orange-500/10 border border-orange-500/20"
                        : key === "research"
                        ? "text-teal-400 bg-teal-500/10 border border-teal-500/20"
                        : "text-white bg-white/[0.08] border border-white/[0.1]"
                      : "text-gray-500 hover:text-gray-300 border border-transparent hover:bg-white/[0.04]"
                  }`}
                  data-testid={`filter-${key}`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
              {query && (
                <span className="ml-auto text-[10px] text-gray-600">
                  {isSearching ? "Searching..." : `${results.length} ${results.length === 1 ? "result" : "results"}`}
                </span>
              )}
            </div>

            <div
              ref={resultsRef}
              className="max-h-[50vh] overflow-y-auto overscroll-contain"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
            >
              {!query && (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3">
                    <Search className="w-6 h-6 text-orange-400/60" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Search your thinking</p>
                  <p className="text-xs text-gray-600">Find past journal entries and research notes instantly</p>
                  <div className="flex items-center gap-4 mt-4 text-[10px] text-gray-600">
                    <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border border-white/[0.08] bg-white/[0.03] font-mono">↑↓</kbd> navigate</span>
                    <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border border-white/[0.08] bg-white/[0.03] font-mono">↵</kbd> select</span>
                    <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border border-white/[0.08] bg-white/[0.03] font-mono">esc</kbd> close</span>
                  </div>
                </div>
              )}

              {query && results.length === 0 && !isSearching && (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <p className="text-sm text-gray-500">No entries match "<span className="text-gray-400">{query}</span>"</p>
                  <p className="text-xs text-gray-600 mt-1">Try different keywords or change the filter</p>
                </div>
              )}

              {results.length > 0 && (
                <div className="py-1">
                  {results.map((entry, i) => (
                    <button
                      key={entry.id}
                      data-search-item
                      onClick={() => handleSelect(entry)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                        i === selectedIndex ? "bg-white/[0.05]" : "hover:bg-white/[0.03]"
                      }`}
                      data-testid={`search-result-modal-${entry.id}`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          background: entry.type === "journal" ? "rgba(243,126,32,0.12)" : "rgba(46,139,139,0.12)",
                        }}
                      >
                        {entry.type === "journal" ? (
                          <BookOpen className="w-3.5 h-3.5 text-orange-400" />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-teal-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed line-clamp-2">
                          {highlightMatch(entry.text, query)}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="flex items-center gap-1 text-[10px] text-gray-600">
                            <Clock className="w-2.5 h-2.5" />
                            {format(new Date(entry.createdAt), "MMM d, yyyy")}
                          </span>
                          {entry.tags && entry.tags.length > 0 && (
                            <span className="text-[10px] text-gray-600">
                              {entry.tags.slice(0, 2).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className={`w-3.5 h-3.5 shrink-0 mt-1 transition-opacity ${i === selectedIndex ? "text-orange-400 opacity-100" : "opacity-0"}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-2 border-t border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-gray-600">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded border border-white/[0.08] bg-white/[0.03] font-mono text-[9px]">⌘K</kbd>
                  toggle
                </span>
              </div>
              <p className="text-[10px] text-gray-700">Searches locally stored entries</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
