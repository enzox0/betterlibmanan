import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5_242_880; // 5MB
const VALIDATION_ERROR = 'File must be PNG, JPG, or GIF and no larger than 5MB';

interface ImageUploadState {
  file: File | null;
  previewUrl: string | null;
  error: string | null;
}

function isValidFile(file: File): boolean {
  return ACCEPTED_MIME_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE_BYTES;
}

export function ImageUploadPlaceholder() {
  const [state, setState] = useState<ImageUploadState>({
    file: null,
    previewUrl: null,
    error: null,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (isValidFile(file)) {
      const url = URL.createObjectURL(file);
      setState({ file, previewUrl: url, error: null });
    } else {
      setState((prev) => ({ ...prev, previewUrl: null, error: VALIDATION_ERROR }));
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // If dialog closed without selection, change event won't fire — no state change needed
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  }

  function handleRemove() {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }
    setState({ file: null, previewUrl: null, error: null });
    // Reset the file input so the same file can be re-selected
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  function handleDropZoneClick() {
    inputRef.current?.click();
  }

  function handleDropZoneKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  }

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif"
        className="hidden"
        onChange={handleInputChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      <AnimatePresence mode="wait">
        {state.previewUrl ? (
          /* Preview state */
          <motion.div
            key="preview"
            className="relative inline-block w-full"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={state.previewUrl}
              alt="Uploaded preview"
              className="w-full max-h-64 object-contain rounded-xl border border-gray-200"
            />
            <button
              type="button"
              aria-label="Remove image"
              onClick={handleRemove}
              className="mt-2 inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            >
              Remove
            </button>
          </motion.div>
        ) : (
          /* Drop zone state */
          <motion.div
            key="dropzone"
            role="button"
            tabIndex={0}
            onClick={handleDropZoneClick}
            onKeyDown={handleDropZoneKeyDown}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition-colors hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            aria-label="Image upload drop zone. Click to open file dialog or drag and drop an image."
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {/* Camera / upload icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-gray-400"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>

            <div>
              <p className="text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation error */}
      <AnimatePresence>
        {state.error && (
          <motion.p
            className="mt-2 text-sm text-red-600"
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {state.error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ImageUploadPlaceholder;
