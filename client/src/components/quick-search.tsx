import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, BookOpen, Globe, Layers, ArrowRight, Clock, Tag, FileText } from "lucide-react";
import { vault, searchEntries, type VaultEntry, type EntryType } from "@/lib/vault";
import { useLiveQuery } from "dexie-react-hooks";
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

  const recentEntries = useLiveQuery(
    () => vault.entries.orderBy("createdAt").reverse().limit(8).toArray(),
    []
  );

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

  const displayItems = query.trim()
    ? results
    : (recentEntries ?? []).filter(e => filter === "all" || e.type === filter);

  useEffect(() => {
    setSelectedIndex(0);
  }, [displayItems.length, filter]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (displayItems.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(selectedIndex + 1, displayItems.length - 1);
      setSelectedIndex(next);
      scrollToSelected(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = Math.max(selectedIndex - 1, 0);
      setSelectedIndex(prev);
      scrollToSelected(prev);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const clamped = Math.min(selectedIndex, displayItems.length - 1);
      if (displayItems[clamped]) handleSelect(displayItems[clamped]);
    }
  };

  const scrollToSelected = (index: number) => {
    if (!resultsRef.current) return;
    const items = resultsRef.current.querySelectorAll("[data-search-item]");
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    items[clamped]?.scrollIntoView({ block: "nearest" });
  };

  const highlightMatch = (text: string, q: string) => {
    if (!q.trim()) return text.slice(0, 140) + (text.length > 140 ? "..." : "");
    const lower = text.toLowerCase();
    const qLower = q.toLowerCase();
    const idx = lower.indexOf(qLower);
    if (idx < 0) return text.slice(0, 140) + (text.length > 140 ? "..." : "");

    const contextStart = Math.max(0, idx - 40);
    const contextEnd = Math.min(text.length, idx + q.length + 90);
    const before = (contextStart > 0 ? "..." : "") + text.slice(contextStart, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length, contextEnd) + (contextEnd < text.length ? "..." : "");

    return (
      <>
        <span className="text-muted-foreground">{before}</span>
        <span className="text-orange-400 font-semibold bg-orange-500/15 px-0.5 rounded">{match}</span>
        <span className="text-muted-foreground">{after}</span>
      </>
    );
  };

  const filters: { key: FilterType; label: string; icon: typeof Layers }[] = [
    { key: "all", label: "All", icon: Layers },
    { key: "journal", label: "Audit Ledger", icon: BookOpen },
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
            className="relative w-full max-w-xl rounded-2xl overflow-hidden bg-card border border-border"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 80px -20px rgba(243,126,32,0.06)',
            }}
            onClick={(e) => e.stopPropagation()}
            data-testid="quick-search-panel"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search your entries..."
                className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 outline-none"
                data-testid="input-quick-search-modal"
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setResults([]); }}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-clear-search-modal"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground/80 border border-border bg-muted/50">
                ESC
              </kbd>
            </div>

            <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border">
              {filters.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handleFilterChange(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === key
                      ? key === "journal"
                        ? "text-orange-400 bg-orange-500/10 border border-orange-500/20"
                        : key === "research"
                        ? "text-teal-400 bg-teal-500/10 border border-teal-500/20"
                        : "text-foreground bg-muted border border-border"
                      : "text-muted-foreground hover:text-foreground border border-transparent hover:bg-muted/50"
                  }`}
                  data-testid={`filter-${key}`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
              {isSearching && (
                <div className="ml-auto">
                  <div className="w-3.5 h-3.5 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                </div>
              )}
              {query && !isSearching && (
                <span className="ml-auto text-[10px] text-muted-foreground/80">
                  {results.length} {results.length === 1 ? "result" : "results"}
                </span>
              )}
            </div>

            <div
              ref={resultsRef}
              className="max-h-[50vh] overflow-y-auto overscroll-contain"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
            >
              {!query.trim() && displayItems.length > 0 && (
                <div className="px-5 pt-3 pb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                    Recent entries
                  </span>
                </div>
              )}

              {displayItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                  {query.trim() ? (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border flex items-center justify-center mb-3">
                        <Search className="w-6 h-6 text-muted-foreground/80" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">No entries match "{query}"</p>
                      <p className="text-xs text-muted-foreground/80 mt-1">Try different keywords or change the filter</p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3">
                        <Search className="w-6 h-6 text-orange-400/60" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">Search your thinking</p>
                      <p className="text-xs text-muted-foreground/80 mt-1">Find past journal entries and research notes instantly</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="py-1">
                  {displayItems.map((entry, i) => (
                    <button
                      key={entry.id}
                      data-search-item
                      onClick={() => handleSelect(entry)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`group w-full text-left px-5 py-3.5 flex items-start gap-3.5 transition-all duration-150 ${
                        i === selectedIndex ? "bg-muted" : "hover:bg-muted/50"
                      }`}
                      data-testid={`search-result-modal-${entry.id}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          entry.type === "journal"
                            ? "bg-orange-500/10 text-orange-400"
                            : "bg-teal-500/10 text-teal-400"
                        }`}
                      >
                        {entry.type === "journal" ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <Globe className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed line-clamp-2">
                          {highlightMatch(entry.text, query)}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/80">
                            <Clock className="w-2.5 h-2.5" />
                            {format(new Date(entry.createdAt), "MMM d, yyyy")}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                            {entry.type}
                          </span>
                          {entry.tags && entry.tags.length > 0 && (
                            <>
                              <span className="text-muted-foreground/60">·</span>
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground/80 truncate max-w-[120px]">
                                <Tag className="w-2.5 h-2.5" />
                                {entry.tags.slice(0, 2).join(", ")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ArrowRight className={`w-3.5 h-3.5 shrink-0 mt-1.5 transition-all duration-150 ${
                        i === selectedIndex ? "text-orange-400 opacity-100 translate-x-0" : "opacity-0 -translate-x-1"
                      }`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 py-2.5 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground/80">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded border border-border bg-muted/50 font-mono text-[9px]">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded border border-border bg-muted/50 font-mono text-[9px]">↵</kbd>
                  select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded border border-border bg-muted/50 font-mono text-[9px]">⌘K</kbd>
                  toggle
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground/60">Local search only</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
