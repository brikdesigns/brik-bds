import {
  type HTMLAttributes,
  type ReactNode,
  type CSSProperties,
  useState,
  useCallback,
} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

/**
 * AccordionItem data shape
 */
export interface AccordionItemData {
  /** Unique identifier */
  id: string;
  /** Title displayed in the trigger row */
  title: string;
  /** Content shown when expanded */
  content: ReactNode;
}

/**
 * Accordion component props
 */
export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  /** Array of accordion items */
  items: AccordionItemData[];
  /** Allow multiple items open simultaneously */
  allowMultiple?: boolean;
  /** Controlled: array of open item IDs */
  openItems?: string[];
  /** Callback when open items change */
  onOpenChange?: (openItems: string[]) => void;
  /** Initially open item IDs (uncontrolled) */
  defaultOpenItems?: string[];
}

/**
 * AccordionItem component props (internal)
 */
interface AccordionItemProps {
  item: AccordionItemData;
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Trigger row styles (title + icon)
 *
 * Token reference:
 * - --_space---xl = 24px (vertical padding)
 */
const triggerStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: 'var(--_space---xl) 0',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  textAlign: 'left',
  gap: 'var(--_space---gap--lg)',
};

/**
 * Title styles
 *
 * Token reference:
 * - --_typography---font-family--label (label font)
 * - --_typography---label--lg = font-size-200 = 18px
 * - --font-weight--bold = 700
 * - --font-line-height--125
 * - --_color---text--primary
 */
const titleStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--label)',
  fontSize: 'var(--_typography---label--lg)',
  fontWeight: 'var(--font-weight--bold)' as unknown as number,
  lineHeight: 'var(--font-line-height--125)',
  color: 'var(--_color---text--primary)',
  margin: 0,
  flex: 1,
  minWidth: 0,
};

/**
 * Icon styles
 *
 * Token reference:
 * - --_typography---icon--large = font-size-200 = 18px
 * - --_color---text--primary
 */
const iconStyles: CSSProperties = {
  fontSize: 'var(--_typography---icon--large)',
  color: 'var(--_color---text--primary)',
  flexShrink: 0,
};

/**
 * Content area styles (expanded body)
 *
 * Token reference:
 * - --_typography---font-family--body (body font)
 * - --_typography---body--md-base = font-size-100 = 16px
 * - --font-line-height--150
 * - --_color---text--primary
 * - --_space---xl = 24px (bottom padding)
 */
const contentStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--body)',
  fontSize: 'var(--_typography---body--md-base)',
  lineHeight: 'var(--font-line-height--150)',
  color: 'var(--_color---text--primary)',
  paddingBottom: 'var(--_space---xl)',
};

/**
 * Item wrapper styles — bottom border separator
 *
 * Token reference:
 * - --_border-width---lg = 1px
 * - --_color---border--muted
 */
const itemStyles: CSSProperties = {
  borderBottom: 'var(--_border-width---lg) solid var(--_color---border--muted)',
};

/**
 * Single accordion item (internal component)
 */
function AccordionItem({ item, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div style={itemStyles}>
      <button
        type="button"
        style={triggerStyles}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${item.id}`}
      >
        <span style={titleStyles}>{item.title}</span>
        <span style={iconStyles}>
          <FontAwesomeIcon icon={isOpen ? faMinus : faPlus} />
        </span>
      </button>
      {isOpen && (
        <div
          id={`accordion-content-${item.id}`}
          role="region"
          style={contentStyles}
        >
          {item.content}
        </div>
      )}
    </div>
  );
}

/**
 * Container styles
 */
const containerStyles: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
};

/**
 * Accordion - BDS collapsible content component
 *
 * Displays a list of expandable/collapsible items with title and content.
 * Uses plus/minus icons per Figma spec (accordion-item-1 variant).
 * Supports single or multiple open items.
 *
 * @example
 * ```tsx
 * <Accordion
 *   items={[
 *     { id: '1', title: 'Question one', content: 'Answer one' },
 *     { id: '2', title: 'Question two', content: 'Answer two' },
 *   ]}
 * />
 * ```
 */
export function Accordion({
  items,
  allowMultiple = false,
  openItems,
  onOpenChange,
  defaultOpenItems = [],
  className = '',
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

  const combinedStyles: CSSProperties = {
    ...containerStyles,
    ...style,
  };

  return (
    <div className={className || undefined} style={combinedStyles} {...props}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={currentOpen.includes(item.id)}
          onToggle={() => handleToggle(item.id)}
        />
      ))}
    </div>
  );
}

export default Accordion;
