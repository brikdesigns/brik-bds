import { type HTMLAttributes, useId } from 'react';
import { bdsClass } from '../../utils';
import { ServiceTag } from '../ServiceTag';
import { SERVICE_LINES, type ServiceLine, type ServiceTagSize } from '../ServiceTag/service-config';
import './ServiceTagPicker.css';

export interface ServiceTagPickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Currently selected service category. */
  value?: ServiceLine;
  /** Selection change handler, called with the chosen category. */
  onChange?: (category: ServiceLine) => void;
  /**
   * Categories to offer, in order. Defaults to all canonical service lines
   * (`SERVICE_LINES`) — the deprecated `service` alias is excluded so no
   * category renders twice.
   */
  categories?: readonly ServiceLine[];
  /** Size of the rendered ServiceTag pills. Default `md`. */
  size?: ServiceTagSize;
  /** Disable the whole group. */
  disabled?: boolean;
  /**
   * Accessible name for the radiogroup. Default `"Service category"`. Pass a
   * more specific label when multiple pickers share a page.
   */
  ariaLabel?: string;
}

/**
 * ServiceTagPicker — a single-select radiogroup of {@link ServiceTag} pills for
 * choosing a Brik service category. Colors and labels come from the shared
 * `categoryConfig`, so consumers stop maintaining a parallel category/color
 * taxonomy.
 *
 * Each option is a native `<input type="radio">` (visually hidden) wrapped in a
 * `<label>` around a `ServiceTag` — so keyboard behavior (Tab to the group,
 * arrows to move selection) is the browser's native radiogroup, with no custom
 * key handling. The selected pill gets an emphasis ring.
 *
 * @example
 * ```tsx
 * const [category, setCategory] = useState<ServiceLine>('brand');
 *
 * <ServiceTagPicker value={category} onChange={setCategory} />
 * ```
 *
 * @summary Single-select radiogroup of ServiceTag pills
 */
export function ServiceTagPicker({
  value,
  onChange,
  categories = SERVICE_LINES,
  size = 'md',
  disabled = false,
  ariaLabel = 'Service category',
  className,
  ...props
}: ServiceTagPickerProps) {
  const groupName = useId();

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={bdsClass('bds-service-tag-picker', disabled && 'bds-service-tag-picker--disabled', className)}
      {...props}
    >
      {categories.map((category) => {
        const checked = value === category;
        const id = `${groupName}-${category}`;

        return (
          <label
            key={category}
            htmlFor={id}
            className={bdsClass(
              'bds-service-tag-picker__option',
              checked && 'bds-service-tag-picker__option--selected',
            )}
          >
            <input
              type="radio"
              id={id}
              name={groupName}
              value={category}
              checked={checked}
              disabled={disabled}
              onChange={() => onChange?.(category)}
              className="bds-service-tag-picker__input"
            />
            <ServiceTag category={category} size={size} />
          </label>
        );
      })}
    </div>
  );
}

export default ServiceTagPicker;
