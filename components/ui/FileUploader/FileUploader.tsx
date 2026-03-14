import { type HTMLAttributes, useState, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import { bdsClass } from '../../utils';
import './FileUploader.css';

/**
 * FileUploader component props
 */
export interface FileUploaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Accepted file types (e.g., ".pdf,.jpg" or "image/*") */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Custom label text */
  label?: string;
  /** Helper text below the label */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Change handler with selected files */
  onChange?: (files: File[]) => void;
}

/**
 * FileUploader - BDS drag-and-drop file upload zone
 *
 * A dropzone that accepts files via drag-and-drop or click-to-browse.
 * Supports file type filtering, size limits, and multiple files.
 *
 * @example
 * ```tsx
 * <FileUploader
 *   accept="image/*,.pdf"
 *   multiple
 *   maxSize={5 * 1024 * 1024}
 *   label="Upload documents"
 *   helperText="PDF, JPG, PNG up to 5MB"
 *   onChange={(files) => console.log(files)}
 * />
 * ```
 */
export function FileUploader({
  accept,
  multiple = false,
  maxSize,
  disabled = false,
  label = 'Drag and drop files here',
  helperText,
  error,
  onChange,
  className = '',
  style,
  ...props
}: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [internalError, setInternalError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const displayError = error || internalError;

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      if (!maxSize) return files;
      const oversized = files.filter((f) => f.size > maxSize);
      if (oversized.length > 0) {
        const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
        setInternalError(`File(s) exceed ${maxMB}MB limit`);
        return files.filter((f) => f.size <= maxSize);
      }
      setInternalError('');
      return files;
    },
    [maxSize],
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || disabled) return;
      const files = validateFiles(Array.from(fileList));
      if (files.length > 0) {
        onChange?.(files);
      }
    },
    [disabled, validateFiles, onChange],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset so same file can be selected again
      e.target.value = '';
    },
    [handleFiles],
  );

  return (
    <div
      className={bdsClass('bds-file-uploader', className)}
      style={style}
      {...props}
    >
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
        className={bdsClass(
          'bds-file-uploader__dropzone',
          isDragOver ? 'bds-file-uploader__dropzone--active' : undefined,
          disabled ? 'bds-file-uploader__dropzone--disabled' : undefined,
          displayError ? 'bds-file-uploader__dropzone--error' : undefined,
        )}
        aria-label="File upload dropzone"
      >
        <span className="bds-file-uploader__icon"><FontAwesomeIcon icon={faCloudArrowUp} /></span>
        <p className="bds-file-uploader__label">{label}</p>
        <p className="bds-file-uploader__helper">
          or <span className="bds-file-uploader__browse">browse files</span>
        </p>
      </div>
      {helperText && !displayError && <p className="bds-file-uploader__helper">{helperText}</p>}
      {displayError && <p className="bds-file-uploader__error">{displayError}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        style={{ display: 'none' }}
        tabIndex={-1}
      />
    </div>
  );
}

export default FileUploader;
