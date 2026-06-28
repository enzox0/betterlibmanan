import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaTimes,
  FaPalette,
  FaExpand,
  FaStickyNote,
} from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";
import {
  getNotes,
  createNote,
  updateNotePosition as apiUpdateNotePosition,
} from "@/api/freedomWall";

interface Note {
  id: string;
  content: string;
  x: number;
  y: number;
  color: string;
  rotation: number;
  createdAt?: string;
}

const COLORS = [
  "bg-yellow-100 border-yellow-300 text-yellow-900",
  "bg-blue-100 border-blue-300 text-blue-900",
  "bg-green-100 border-green-300 text-green-900",
  "bg-pink-100 border-pink-300 text-pink-900",
  "bg-purple-100 border-purple-300 text-purple-900",
  "bg-orange-100 border-orange-300 text-orange-900",
];

const SWATCH: Record<string, string> = {
  "bg-yellow-100 border-yellow-300 text-yellow-900": "bg-yellow-400",
  "bg-blue-100 border-blue-300 text-blue-900": "bg-blue-400",
  "bg-green-100 border-green-300 text-green-900": "bg-green-400",
  "bg-pink-100 border-pink-300 text-pink-900": "bg-pink-400",
  "bg-purple-100 border-purple-300 text-purple-900": "bg-purple-400",
  "bg-orange-100 border-orange-300 text-orange-900": "bg-orange-400",
};

const CANVAS_SIZE = 6000;
const CANVAS_OFFSET = 2500;

export function FreedomWallSection() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const initialScale = window.innerWidth < 768 ? 0.6 : 1;
  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toolbarFixed, setToolbarFixed] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scaleRef = useRef(scale);
  const positionRef = useRef(position);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    getNotes()
      .then((data: any[]) => {
        const mapped = data.map((n: any) => ({
          id: n._id,
          content: n.content,
          x: n.x,
          y: n.y,
          color: n.color,
          rotation: n.rotation,
          createdAt: n.createdAt,
        }));
        setNotes(mapped);

        if (mapped.length > 0) {
          const latest = mapped[0];
          const board = boardRef.current;
          if (!board) return;

          requestAnimationFrame(() => {
            const bw = board.offsetWidth;
            const bh = board.offsetHeight;
            const noteCenterX = latest.x + 120;
            const noteCenterY = latest.y + 75;
            const s = scaleRef.current;
            const panX = bw / 2 + CANVAS_OFFSET - noteCenterX * s;
            const panY = bh / 2 + CANVAS_OFFSET - noteCenterY * s;
            setPosition({ x: panX, y: panY });
          });
        }
      })
      .catch(() => toast("Failed to load notes from the wall.", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setToolbarFixed(!entry.isIntersecting),
      { rootMargin: "-96px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = board.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const factor = e.deltaY > 0 ? 0.95 : 1.05;
      const oldScale = scaleRef.current;
      const newScale = Math.min(Math.max(oldScale * factor, 0.2), 3);
      if (newScale === oldScale) return;

      const ratio = newScale / oldScale;
      const oldPan = positionRef.current;

      setPosition({
        x: mx + CANVAS_OFFSET - (mx + CANVAS_OFFSET - oldPan.x) * ratio,
        y: my + CANVAS_OFFSET - (my + CANVAS_OFFSET - oldPan.y) * ratio,
      });
      setScale(newScale);
    };

    board.addEventListener("wheel", onWheel, { passive: false });
    return () => board.removeEventListener("wheel", onWheel);
  }, []);

  const addNote = async () => {
    if (!newContent.trim()) {
      toast("Please write something first!", "error");
      return;
    }
    const el = boardRef.current;
    const bw = el?.offsetWidth ?? 800;
    const bh = el?.offsetHeight ?? 600;

    const cx = (bw / 2 + CANVAS_OFFSET - position.x) / scale;
    const cy = (bh / 2 + CANVAS_OFFSET - position.y) / scale;

    try {
      const saved = await createNote({
        content: newContent.trim(),
        x: cx - 120,
        y: cy - 75,
        color,
        rotation: Math.random() * 6 - 3,
      });
      setNotes((p) => [
        ...p,
        {
          id: saved._id,
          content: saved.content,
          x: saved.x,
          y: saved.y,
          color: saved.color,
          rotation: saved.rotation,
          createdAt: saved.createdAt,
        },
      ]);
      setNewContent("");
      setIsAdding(false);
      toast("Note posted!", "success");
    } catch {
      toast("Failed to save note.", "error");
    }
  };

  const moveNote = async (id: string, dx: number, dy: number) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    const nx = note.x + dx / scale;
    const ny = note.y + dy / scale;
    try {
      await apiUpdateNotePosition(id, nx, ny);
      setNotes((p) => p.map((n) => (n.id === id ? { ...n, x: nx, y: ny } : n)));
    } catch {
      toast("Failed to move note.", "error");
    }
  };

  const resetView = () => {
    setScale(window.innerWidth < 768 ? 0.6 : 1);
    setPosition({ x: 0, y: 0 });
  };

  const fmtDate = (s?: string) => {
    if (!s) return "";
    const d = new Date(s);
    return (
      d
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .toLowerCase() +
      ", " +
      d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
  };

  const toolbarBase = cn(
    "flex items-center gap-1.5 sm:gap-2",
    "px-2 sm:px-3 py-1.5 sm:py-2",
    "rounded-xl sm:rounded-2xl",
    "bg-gray-900/90 border border-white/10 backdrop-blur-md shadow-xl",
    "z-[100]",
  );

  return (
    <div
      ref={sectionRef}
      className="relative flex-1 bg-gray-950 select-none"
      style={{ minHeight: "100dvh", overflow: "hidden" }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div
        ref={sentinelRef}
        className="absolute top-0 left-0 w-full h-px pointer-events-none"
      />

      <div
        className={cn(
          toolbarBase,
          toolbarFixed
            ? "fixed top-[calc(var(--navbar-h,96px)+10px)] left-1/2 -translate-x-1/2"
            : "absolute top-3 sm:top-4 left-1/2 -translate-x-1/2",
        )}
      >
        <div className="flex items-center gap-1.5 pr-2 sm:pr-3 border-r border-white/10">
          <FaStickyNote className="text-blue-400 shrink-0" size={13} />
          <span className="text-white font-bold text-xs sm:text-sm tracking-wide whitespace-nowrap">
            Freedom Wall
          </span>
        </div>

        <span className="hidden md:block text-[10px] text-gray-500 uppercase tracking-widest pr-2 sm:pr-3 border-r border-white/10 whitespace-nowrap">
          scroll&nbsp;to&nbsp;zoom&nbsp;·&nbsp;drag&nbsp;to&nbsp;pan
        </span>

        <div className="flex items-center gap-1">
          <span className="hidden xs:block text-[11px] font-bold text-gray-400 tabular-nums w-8 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={resetView}
            title="Reset view"
            style={{ minHeight: 0 }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <FaExpand size={11} />
          </button>
        </div>

        <div className="w-px h-4 bg-white/10 shrink-0" />

        <button
          onClick={() => setIsAdding(true)}
          style={{ minHeight: 0 }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-[11px] sm:text-xs font-semibold transition-colors shadow-md whitespace-nowrap"
        >
          <FaPlus size={9} />
          <span className="hidden sm:inline">Add Note</span>
        </button>
      </div>

      <div
        ref={boardRef}
        className={cn(
          "absolute inset-0",
          isPanning ? "cursor-grabbing" : "cursor-grab",
        )}
        style={{ touchAction: "none", overflow: "hidden" }}
      >
        <motion.div
          drag
          dragMomentum={false}
          onDragStart={() => setIsPanning(true)}
          onDragEnd={(_, info) => {
            setIsPanning(false);
            setPosition((p) => ({
              x: p.x + info.offset.x,
              y: p.y + info.offset.y,
            }));
          }}
          animate={{ x: position.x, y: position.y, scale }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          className="absolute"
          style={{
            width: `${CANVAS_SIZE}px`,
            height: `${CANVAS_SIZE}px`,
            left: `-${CANVAS_OFFSET}px`,
            top: `-${CANVAS_OFFSET}px`,
            transformOrigin: "0 0",
            touchAction: "none",
          }}
        >
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                drag
                dragListener={!isPanning}
                dragMomentum={false}
                onDragEnd={(_, info) =>
                  moveNote(note.id, info.offset.x, info.offset.y)
                }
                initial={{ scale: 0, opacity: 0, rotate: note.rotation }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  x: note.x,
                  y: note.y,
                  rotate: note.rotation,
                }}
                exit={{ scale: 0, opacity: 0 }}
                whileDrag={{
                  scale: 1.06,
                  zIndex: 50,
                  cursor: "grabbing",
                  boxShadow: "0 20px 40px -8px rgba(0,0,0,0.5)",
                }}
                className={cn(
                  "absolute cursor-grab flex flex-col group",
                  "w-44 xs:w-52 sm:w-60",
                  "min-h-[120px] sm:min-h-[150px]",
                  "p-3 sm:p-4 rounded-xl border shadow-lg",
                  note.color,
                )}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  touchAction: "none",
                }}
              >
                <div className="absolute top-1 left-0 right-0 flex justify-center pointer-events-none">
                  <span className="text-[7px] sm:text-[8px] font-semibold opacity-30 uppercase tracking-tight">
                    {fmtDate(note.createdAt)}
                  </span>
                </div>

                <p className="text-[12px] sm:text-[13px] font-medium leading-relaxed whitespace-pre-wrap break-words flex-1 mt-4">
                  {note.content}
                </p>

                <div className="mt-2 text-[8px] uppercase tracking-widest opacity-25 font-bold text-center">
                  Anonymous
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {notes.length === 0 && !isAdding && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 pointer-events-none gap-3 px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center">
              <FaPlus size={18} />
            </div>
            <p className="text-xs sm:text-sm font-medium text-center">
              Be the first — tap{" "}
              <strong className="text-gray-400">Add Note</strong>
            </p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 pointer-events-none gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            <p className="text-[10px] sm:text-xs uppercase tracking-widest">
              Loading wall…
            </p>
          </div>
        )}
      </div>

      <div
        className="absolute bottom-6 right-5 z-20 sm:hidden"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <button
          onClick={() => setIsAdding(true)}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white flex items-center justify-center shadow-2xl transition-colors"
          aria-label="Add note"
        >
          <FaPlus size={20} />
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsAdding(false);
                setNewContent("");
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "bg-white w-full sm:max-w-sm shadow-2xl",
                "rounded-t-3xl sm:rounded-2xl",
                "p-5 sm:p-6",
                "pb-[max(1.25rem,env(safe-area-inset-bottom))]",
              )}
            >
              <div className="flex justify-center mb-4 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-neutral-200" />
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaStickyNote size={14} className="text-blue-500" />
                  <h2 className="text-sm sm:text-base font-bold text-neutral-900">
                    Post a Note
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewContent("");
                  }}
                  style={{ minHeight: 0 }}
                  className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-400"
                  aria-label="Close"
                >
                  <FaTimes size={13} />
                </button>
              </div>

              <textarea
                autoFocus
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Type your message here…"
                maxLength={500}
                style={{ fontSize: "16px" }}
                className="w-full h-28 sm:h-32 p-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none resize-none text-neutral-900 placeholder:text-neutral-400 transition-all leading-relaxed"
              />
              <p className="text-right text-[11px] text-neutral-400 mt-1 mb-4">
                {newContent.length}/500
              </p>

              <div className="mb-4">
                <p className="text-xs font-semibold text-neutral-500 mb-2.5 flex items-center gap-1.5 uppercase tracking-wide">
                  <FaPalette size={11} />
                  Color
                </p>
                <div className="flex gap-2.5 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      style={{ minHeight: 0 }}
                      aria-label={`Select color`}
                      className={cn(
                        "w-9 h-9 sm:w-8 sm:h-8 rounded-full border-2 transition-all hover:scale-110 active:scale-95",
                        SWATCH[c],
                        color === c
                          ? "border-neutral-900 scale-110 shadow-md"
                          : "border-transparent",
                      )}
                    />
                  ))}
                </div>
              </div>

              <div
                className={cn(
                  "px-3 py-2 rounded-xl border text-xs font-medium mb-5 opacity-75",
                  color,
                )}
              >
                Preview — your note will look like this
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewContent("");
                  }}
                  className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addNote}
                  className="flex-1 rounded-xl bg-gray-900 hover:bg-gray-800 active:bg-black py-2.5 text-sm font-semibold text-white transition-colors shadow"
                >
                  Post Note
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

FreedomWallSection.displayName = "FreedomWallSection";

export default FreedomWallSection;
