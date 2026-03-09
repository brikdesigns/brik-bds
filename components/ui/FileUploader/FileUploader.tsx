import { type HTMLAttributes, type CSSProperties, useState, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import { bdsClass } from '../../utils';

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
 * Dropzone styles
 *
 * Token reference:
 * - --surface-primary (background)
 * - --border-secondary (dashed border)
 * - --border-radius-lg = 8px
 * - --padding-xl = 32px
 * - --gap-md = 8px
 */
const dropzoneStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--gap-md)',
  padding: 'var(--padding-xl)',
  backgroundColor: 'var(--surface-primary)',
  border: 'var(--border-width-lg) dashed var(--border-secondary)',
  borderRadius: 'var(--border-radius-lg)',
  cursor: 'pointer',
  transition: 'border-color 0.15s ease, background-color 0.15s ease',
  textAlign: 'center',
  width: '100%',
  boxSizing: 'border-box',
};

const dropzoneActiveStyles: CSSProperties = {
  borderColor: 'var(--border-brand-primary)',
  backgroundColor: 'color-mix(in srgb, var(--background-brand-primary) 5%, var(--surface-primary))',
};

const dropzoneDisabledStyles: CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

/**
 * Icon styles
 *
 * Token reference:
 * - --text-brand-primary (icon color)
 * - --heading-md = 25.3px
 */
const iconStyles: CSSProperties = {
  fontSize: 'var(--heading-md)',
  color: 'var(--text-brand-primary)',
};

/**
 * Label styles
 *
 * Token reference:
 * - --font-family-label
 * - --label-md = 16px
 * - --font-weight-semi-bold = 600
 * - --text-primary
 */
const labelTextStyles: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--label-md)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-snug)',
  color: 'var(--text-primary)',
  margin: 0,
};

/**
 * Helper text styles
 *
 * Token reference:
 * - --font-family-body
 * - --body-sm = 14px
 * - --text-secondary
 */
const helperStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-secondary)',
  margin: 0,
};

/**
 * Error text styles
 *
 * Token reference:
 * - --color-system-red
 */
const errorTextStyles: CSSProperties = {
  ...helperStyles,
  color: 'var(--color-system-red)',
};

/**
 * Browse link styles
 *
 * Token reference:
 * - --text-brand-primary
 */
const browseLinkStyles: CSSProperties = {
  color: 'var(--text-brand-primary)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  textDecoration: 'underline',
  cursor: 'pointer',
};

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
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)', width: '100%', ...style }}
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
        style={{
          ...dropzoneStyles,
          ...(isDragOver ? dropzoneActiveStyles : {}),
          ...(disabled ? dropzoneDisabledStyles : {}),
          ...(displayError ? { borderColor: 'var(--color-system-red)' } : {}),
        }}
        aria-label="File upload dropzone"
      >
        <span style={iconStyles}><FontAwesomeIcon icon={faCloudArrowUp} /></span>
        <p style={labelTextStyles}>{label}</p>
        <p style={helperStyles}>
          or <span style={browseLinkStyles}>browse files</span>
        </p>
      </div>
      {helperText && !displayError && <p style={helperStyles}>{helperText}</p>}
      {displayError && <p style={errorTextStyles}>{displayError}</p>}
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
