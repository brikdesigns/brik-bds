import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Button } from '../Button';
import { FilterToggle } from '../FilterToggle';
import { Icon } from '../Icon';
import { Modal } from '../Modal';
import { SearchInput } from '../SearchInput';
import { Spinner } from '../Spinner';
import { MagnifyingGlass } from '../../icons';
import { bdsClass } from '../../utils';
import './SearchOverlay.css';

/** Global search waits this long after the last keystroke (ADR-049 § 4). */
const DEBOUNCE_MS = 250;
/** Below this many characters the overlay shows recents, not results (ADR-049 § 4). */
const MIN_QUERY_LENGTH = 2;

export interface SearchOverlayResult {
  /** Stable id, unique across all groups. */
  id: string;
  title: string;
  /** Muted text after the title — where the record lives. */
  trail?: string;
  /** Leading icon, typically `<Icon icon={…} />`. */
  icon?: ReactNode;
}

export interface SearchOverlayGroup {
  /** Group id. A scope with the same id narrows the overlay to this group. */
  id: string;
  label: string;
  /** Total matches in this group; defaults to `results.length`. */
  count?: number;
  results: SearchOverlayResult[];
}

export interface SearchOverlayScope {
  id: string;
  label: string;
}

export interface SearchOverlaySelectOptions {
  /** True for Cmd/Ctrl+Enter or a modifier-click. */
  newTab: boolean;
}

export interface SearchOverlayProps {
  /** Whether the overlay is open. */
  isOpen: boolean;
  /** Esc, backdrop click, or after a row opens. The query is reset on close. */
  onClose: () => void;
  /** Current query (controlled). */
  query: string;
  /** Fires after the debounce, and with `''` on clear or close. */
  onQueryChange: (query: string) => void;
  /** Result groups for the current query, fetched by the consumer. */
  groups: SearchOverlayGroup[];
  /** Group shown before any search runs (empty query, or under 2 characters). */
  recents?: SearchOverlayGroup;
  /** Scope chips shown under the field. */
  scopes?: SearchOverlayScope[];
  /** Selected scope id; `undefined` is "All". */
  activeScope?: string;
  /** A scope chip was selected (`undefined` is "All"). */
  onScopeChange?: (scopeId: string | undefined) => void;
  /** A search is in flight. */
  loading?: boolean;
  /** Replaces the default next step on a zero-result state. */
  zeroAction?: ReactNode;
  /** A row was opened. */
  onSelect: (result: SearchOverlayResult, options: SearchOverlaySelectOptions) => void;
  /** Accessible name for the dialog and the search landmark. */
  'aria-label': string;
}

const KEY_HINTS: { keys: string; label: string }[] = [
  { keys: '↑↓', label: 'Navigate' },
  { keys: '↵', label: 'Open' },
  { keys: '⌘↵', label: 'Open in new tab' },
  { keys: 'Esc', label: 'Close' },
];

function resultCount(count: number): string {
  return `${count} ${count === 1 ? 'result' : 'results'}`;
}

/**
 * SearchOverlay — command-style global search in a `Modal`: a large
 * `SearchInput`, optional scope chips, grouped results (icon, title, muted
 * trail), recents before typing, a result count after every query, and key
 * hints in the footer.
 *
 * The consumer owns the data: pass the `groups` for the current `query`. The
 * overlay owns the keyboard model — the field is a combobox over the rows, Up
 * and Down move, Enter opens, Cmd/Ctrl+Enter opens in a new tab, Esc closes
 * (ADR-049 § 3). Pair it with `SearchOverlayTrigger` in an `AppBar` `actions`
 * slot.
 *
 * @example
 * ```tsx
 * <SearchOverlay
 *   aria-label="Search"
 *   isOpen={open}
 *   onClose={() => setOpen(false)}
 *   query={query}
 *   onQueryChange={setQuery}
 *   groups={groups}
 *   recents={recents}
 *   onSelect={(result, { newTab }) => open(result, newTab)}
 * />
 * ```
 *
 * @summary Command-style global search overlay with grouped results
 */
export function SearchOverlay({
  isOpen,
  onClose,
  query,
  onQueryChange,
  groups,
  recents,
  scopes,
  activeScope,
  onScopeChange,
  loading = false,
  zeroAction,
  onSelect,
  'aria-label': ariaLabel,
}: SearchOverlayProps) {
  const baseId = useId();
  const listId = `${baseId}-list`;
  const listRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const searching = query.trim().length >= MIN_QUERY_LENGTH;
  const visibleGroups = useMemo(() => {
    if (!searching) return recents ? [recents] : [];
    return activeScope ? groups.filter((group) => group.id === activeScope) : groups;
  }, [searching, recents, groups, activeScope]);
  const rows = useMemo(() => visibleGroups.flatMap((group) => group.results), [visibleGroups]);
  const total = visibleGroups.reduce((sum, group) => sum + (group.count ?? group.results.length), 0);
  const showZero = searching && !loading && total === 0;

  // A new result set starts at its first row.
  useEffect(() => setActiveIndex(0), [visibleGroups]);

  const activeRow = rows[activeIndex];
  const optionId = (id: string) => `${baseId}-option-${id}`;

  useEffect(() => {
    if (!activeRow) return;
    document.getElementById(optionId(activeRow.id))?.scrollIntoView?.({ block: 'nearest' });
    // optionId is derived from baseId, which never changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRow]);

  const close = () => {
    if (query !== '') onQueryChange('');
    onClose();
  };

  const open = (result: SearchOverlayResult, newTab: boolean) => {
    onSelect(result, { newTab });
    close();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (rows.length === 0) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((index) => (index + step + rows.length) % rows.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (activeRow) open(activeRow, event.metaKey || event.ctrlKey);
    }
  };

  const handleRowClick = (event: MouseEvent, result: SearchOverlayResult) =>
    open(result, event.metaKey || event.ctrlKey);

  let status = '';
  if (loading) status = 'Searching…';
  else if (searching) status = resultCount(total);

  const zeroNextStep =
    zeroAction ??
    (activeScope ? (
      <Button variant="secondary" size="sm" onClick={() => onScopeChange?.(undefined)}>
        Search all
      </Button>
    ) : (
      <Button variant="secondary" size="sm" onClick={() => onQueryChange('')}>
        Clear query
      </Button>
    ));

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      size="lg"
      aria-label={ariaLabel}
      showCloseButton={false}
      footer={
        <ul className="bds-search-overlay__hints">
          {KEY_HINTS.map((hint) => (
            <li key={hint.keys} className="bds-search-overlay__hint">
              <kbd className="bds-search-overlay__key">{hint.keys}</kbd>
              {hint.label}
            </li>
          ))}
        </ul>
      }
    >
      <div className="bds-search-overlay" role="search" aria-label={ariaLabel}>
        <SearchInput
          size="lg"
          fullWidth
          aria-label={ariaLabel}
          placeholder="Search"
          value={query}
          debounceMs={DEBOUNCE_MS}
          onChange={(event) => onQueryChange(event.target.value)}
          onClear={() => onQueryChange('')}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded
          aria-haspopup="listbox"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeRow ? optionId(activeRow.id) : undefined}
          autoComplete="off"
        />

        {scopes && scopes.length > 0 && (
          <div className="bds-search-overlay__scopes">
            <FilterToggle
              size="sm"
              label="All"
              active={activeScope === undefined}
              onToggle={() => onScopeChange?.(undefined)}
            />
            {scopes.map((scope) => (
              <FilterToggle
                key={scope.id}
                size="sm"
                label={scope.label}
                active={activeScope === scope.id}
                onToggle={() => onScopeChange?.(activeScope === scope.id ? undefined : scope.id)}
              />
            ))}
          </div>
        )}

        <p role="status" className="bds-search-overlay__count">{status}</p>

        {loading && (
          <div className="bds-search-overlay__loading">
            <Spinner size="lg" />
          </div>
        )}

        {showZero && <div className="bds-search-overlay__zero">{zeroNextStep}</div>}

        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="bds-search-overlay__results"
          hidden={loading || rows.length === 0}
        >
          {visibleGroups.map((group) => (
            <div
              key={group.id}
              role="group"
              aria-labelledby={`${baseId}-group-${group.id}`}
              className="bds-search-overlay__group"
            >
              <div id={`${baseId}-group-${group.id}`} className="bds-search-overlay__group-label">
                {group.label}
              </div>
              {group.results.map((result) => (
                <div
                  key={result.id}
                  id={optionId(result.id)}
                  role="option"
                  aria-selected={result === activeRow}
                  className={bdsClass(
                    'bds-search-overlay__row',
                    result === activeRow && 'bds-search-overlay__row--active',
                  )}
                  // Keep focus in the field so the combobox keeps receiving keys.
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseMove={() => setActiveIndex(rows.indexOf(result))}
                  onClick={(event) => handleRowClick(event, result)}
                >
                  {result.icon && <span className="bds-search-overlay__row-icon">{result.icon}</span>}
                  <span className="bds-search-overlay__row-title">{result.title}</span>
                  {result.trail && <span className="bds-search-overlay__row-trail">{result.trail}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export type SearchOverlayTriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  /** Shortcut shown on the button. The consumer binds the key. */
  shortcutHint?: string;
};

/**
 * SearchOverlayTrigger — the small button that opens `SearchOverlay`: a
 * magnifying glass, "Search", and the shortcut hint. Sized for an `AppBar`
 * `actions` slot.
 *
 * @summary Search button with shortcut hint for the app bar
 */
export const SearchOverlayTrigger = forwardRef<HTMLButtonElement, SearchOverlayTriggerProps>(
  ({ shortcutHint = '⌘K', className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={bdsClass('bds-search-overlay-trigger', className)}
      {...props}
    >
      <Icon icon={MagnifyingGlass} />
      <span className="bds-search-overlay-trigger__label">Search</span>
      <kbd className="bds-search-overlay__key">{shortcutHint}</kbd>
    </button>
  ),
);

SearchOverlayTrigger.displayName = 'SearchOverlayTrigger';

export default SearchOverlay;
