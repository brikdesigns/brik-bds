import { type HTMLAttributes } from 'react';
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
export declare function FileUploader({ accept, multiple, maxSize, disabled, label, helperText, error, onChange, className, style, ...props }: FileUploaderProps): import("react/jsx-runtime").JSX.Element;
export default FileUploader;
