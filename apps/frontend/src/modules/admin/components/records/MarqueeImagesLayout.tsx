import { useState } from "react";
import { LuImage, LuGripVertical } from "react-icons/lu";
import type { ContentRecord } from "../../types/admin.types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMarqueeImagesStore } from "../../store/marqueeImagesStore";
import { useAdminStore } from "../../store/adminStore";

function StatusBadge({ status }: { status: ContentRecord["status"] }) {
  return status === "published" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      Draft
    </span>
  );
}

function CardActions({
  record,
  editRef,
  onEdit,
  onDelete,
}: {
  record: ContentRecord;
  editRef?: React.RefObject<HTMLButtonElement>;
  onEdit: (r: ContentRecord) => void;
  onDelete: (r: ContentRecord) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        ref={editRef}
        type="button"
        onClick={() => onEdit(record)}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 transition-colors"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => onDelete(record)}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-colors"
      >
        Delete
      </button>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-14 text-center">
      <LuImage
        className="mx-auto h-9 w-9 text-gray-300 mb-2"
        aria-hidden="true"
      />
      <p className="text-sm text-gray-400">No marquee images yet.</p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2"
      >
        Add the first image
      </button>
    </div>
  );
}

interface SortableImageCardProps {
  record: ContentRecord;
  editRef?: React.RefObject<HTMLButtonElement>;
  onEdit: (r: ContentRecord) => void;
  onDelete: (r: ContentRecord) => void;
}

function SortableImageCard({
  record,
  editRef,
  onEdit,
  onDelete,
}: SortableImageCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: record.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <button
        type="button"
        className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 transition-colors"
        {...attributes}
        {...listeners}
      >
        <LuGripVertical className="h-5 w-5" aria-hidden="true" />
      </button>

      {record.fields.imageUrl ? (
        <img
          src={record.fields.imageUrl}
          alt={record.fields.alt ?? record.title}
          className="h-20 w-32 rounded-lg border border-gray-100 bg-white object-cover flex-shrink-0"
        />
      ) : (
        <div className="h-20 w-32 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
          <LuImage className="h-8 w-8 text-gray-300" aria-hidden="true" />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <StatusBadge status={record.status} />
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
              Row {record.fields.rowNumber}
            </span>
            <span className="text-[10px] text-gray-400">
              Order: {record.fields.order}
            </span>
          </div>
          <h3 className="text-sm font-bold text-gray-900 truncate">
            {record.fields.alt ?? record.title}
          </h3>
        </div>
        <CardActions
          record={record}
          editRef={editRef}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

export interface MarqueeImagesLayoutProps {
  records: ContentRecord[];
  editRef: React.RefObject<HTMLButtonElement>;
  onEdit: (r: ContentRecord) => void;
  onDelete: (r: ContentRecord) => void;
  onAdd: () => void;
}

export function MarqueeImagesLayout({
  records,
  editRef,
  onEdit,
  onDelete,
  onAdd,
}: MarqueeImagesLayoutProps) {
  const accessToken = useAdminStore((s) => s.accessToken);
  const reorderMarqueeImages = useMarqueeImagesStore(
    (s) => s.reorderMarqueeImages,
  );
  const [activeRow, setActiveRow] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (records.length === 0) return <EmptyState onAdd={onAdd} />;

  // Group by row
  const recordsByRow: Record<number, ContentRecord[]> = {
    1: [],
    2: [],
    3: [],
  };
  records.forEach((record) => {
    const row = Number(record.fields.rowNumber ?? 1);
    if (recordsByRow[row]) {
      recordsByRow[row].push(record);
    }
  });

  const activeRecords = recordsByRow[activeRow] || [];

  // Shuffle function for preview
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get all published images for preview (randomly shuffled)
  const allPublishedImages = records
    .filter((r) => r.status === "published" && r.fields.imageUrl)
    .map((r) => ({
      url: r.fields.imageUrl as string,
      alt: (r.fields.alt ?? r.title) as string,
    }));

  const shuffledForPreview = shuffleArray(allPublishedImages);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id || !accessToken) return;

    const oldIndex = activeRecords.findIndex((r) => r.id === active.id);
    const newIndex = activeRecords.findIndex((r) => r.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedRecords = arrayMove(activeRecords, oldIndex, newIndex);

    // Build updates with new order values
    const updates = reorderedRecords.map((record, index) => ({
      id: record.id,
      rowNumber: activeRow,
      order: index,
    }));

    setIsSaving(true);
    try {
      await reorderMarqueeImages(updates, accessToken);
    } catch (error) {
      console.error("Failed to reorder:", error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Row tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
        <span className="text-xs font-medium text-gray-500 mr-2">
          Organize by:
        </span>
        {[1, 2, 3].map((row) => (
          <button
            key={row}
            type="button"
            onClick={() => setActiveRow(row)}
            className={[
              "relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              activeRow === row
                ? "text-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50",
            ].join(" ")}
          >
            Row {row}
            <span
              className={[
                "inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold min-w-[18px]",
                activeRow === row
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-500",
              ].join(" ")}
            >
              {recordsByRow[row]?.length || 0}
            </span>
          </button>
        ))}
        {isSaving && (
          <span className="ml-auto text-xs text-gray-400 italic">
            Saving order...
          </span>
        )}
      </div>

      {/* Info banner */}
      <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
        <strong>Note:</strong> Images are displayed <strong>randomly</strong> on
        the public site. Rows and order here are only for organizing your admin
        view.
      </div>

      {/* Sortable list for active row */}
      {activeRecords.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-10 text-center">
          <LuImage
            className="mx-auto h-8 w-8 text-gray-300 mb-2"
            aria-hidden="true"
          />
          <p className="text-sm text-gray-400">No images in Row {activeRow}.</p>
          <button
            type="button"
            onClick={onAdd}
            className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2"
          >
            Add an image
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={activeRecords.map((r) => r.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {activeRecords.map((record, idx) => (
                <SortableImageCard
                  key={record.id}
                  record={record}
                  editRef={idx === 0 ? editRef : undefined}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Marquee preview */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-2">
          Live Preview — Random Shuffled Display
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          All published images are randomly shuffled and distributed across 3
          rows on the public site
        </p>
        {shuffledForPreview.length === 0 ? (
          <div className="rounded-lg bg-gray-100 h-32 flex items-center justify-center">
            <p className="text-sm text-gray-400">
              No published images to preview
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-gray-900 h-32 relative">
            <style>{`
            @keyframes preview-marquee {
              from { transform: translateX(0); }
              to   { transform: translateX(-50%); }
            }
          `}</style>
            <div
              className="flex h-full w-fit"
              style={{
                animation: "preview-marquee 20s linear infinite",
              }}
            >
              {/* Duplicate for seamless loop */}
              {[...shuffledForPreview, ...shuffledForPreview].map(
                (img, idx) => (
                  <div
                    key={idx}
                    className="relative h-full w-40 flex-shrink-0 mx-1"
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="h-full w-full object-cover rounded"
                    />
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
