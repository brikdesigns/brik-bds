import {
  type HTMLAttributes,
  type ReactNode,
  useState,
  useCallback,
} from 'react';
import { Icon } from '../Icon';
import { Plus, Minus } from '../../icons';
import { bdsClass } from '../../utils';
import './Accordion.css';

export interface AccordionItemData {
  id: string;
  title: ReactNode;
  content: ReactNode;
  /** Optional secondary line rendered under the title in the trigger. Omitted entirely when absent. */
  subtitle?: ReactNode;
  /** Optional trailing slot in the trigger row (e.g. a numbered index or control), placed before the open/close icon. */
  action?: ReactNode;
}

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  /** Sections to render. Each item supplies its own `id`, `title`, and `content`. */
  items: AccordionItemData[];
  /** Whether multiple sections can be open at once. Default `false` (single-open accordion — opening a new section closes the previous one). */
  allowMultiple?: boolean;
  /** Controlled open ids. When provided, internal state is ignored and `onOpenChange` is the only way state advances. */
  openItems?: string[];
  /** Called with the next array of open ids whenever a section toggles. Required for controlled use. */
  onOpenChange?: (openItems: string[]) => void;
  /** Initial open ids when uncontrolled. Default `[]` (all closed). */
  defaultOpenItems?: string[];
  /** When `true`, an item's `subtitle` is hidden while that item is open (subtitle reads as a collapsed-state teaser). Default `false` (subtitle always shows when present). */
  hideSubtitleWhenOpen?: boolean;
}

interface AccordionItemProps {
  item: AccordionItemData;
  isOpen: boolean;
  onToggle: () => void;
  hideSubtitleWhenOpen: boolean;
}

function AccordionItem({ item, isOpen, onToggle, hideSubtitleWhenOpen }: AccordionItemProps) {
  const showSubtitle = item.subtitle != null && !(hideSubtitleWhenOpen && isOpen);
  return (
    <div className="bds-accordion-item">
      <button
        type="button"
        className="bds-accordion-trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${item.id}`}
      >
        <span className="bds-accordion-trigger__text">
          <span className="bds-accordion-trigger__title">{item.title}</span>
          {showSubtitle && (
            <span className="bds-accordion-trigger__subtitle">{item.subtitle}</span>
          )}
        </span>
        {item.action != null && (
          <span className="bds-accordion-trigger__action">{item.action}</span>
        )}
        <span className="bds-accordion-trigger__icon">
          <Icon icon={isOpen ? Minus : Plus} />
        </span>
      </button>
      {isOpen && (
        <div
          id={`accordion-content-${item.id}`}
          className="bds-accordion-content"
          role="region"
        >
          {item.content}
        </div>
      )}
    </div>
  );
}

/**
 * Accordion — collapsible content sections with plus/minus icons.
 *
 * @summary Collapsible content sections with single/multi-open
 */
export function Accordion({
  items,
  allowMultiple = false,
  openItems,
  onOpenChange,
  defaultOpenItems = [],
  hideSubtitleWhenOpen = false,
  className,
  style,
  ...props
}: AccordionProps) {
  const isControlled = openItems !== undefined;
  const [internalOpen, setInternalOpen] = useState<string[]>(defaultOpenItems);
  const currentOpen = isControlled ? openItems : internalOpen;

  const handleToggle = useCallback(
    (id: string) => {
      const isOpen = currentOpen.includes(id);
      let nextOpen: string[];

      if (isOpen) {
        nextOpen = currentOpen.filter((item) => item !== id);
      } else if (allowMultiple) {
        nextOpen = [...currentOpen, id];
      } else {
        nextOpen = [id];
      }

      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [currentOpen, allowMultiple, isControlled, onOpenChange],
  );

  return (
    <div className={bdsClass('bds-accordion', className)} style={style} {...props}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={currentOpen.includes(item.id)}
          onToggle={() => handleToggle(item.id)}
          hideSubtitleWhenOpen={hideSubtitleWhenOpen}
        />
      ))}
    </div>
  );
}

export default Accordion;
