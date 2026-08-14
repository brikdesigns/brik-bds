'use client';

import { useMemo, useState } from 'react';
import { Icon } from '../Icon';
import { Button, type ButtonSize } from '../Button';
import { Select, type SelectOption, type SelectSize } from '../Select';
import { ServiceTag } from '../ServiceTag';
import type { ServiceLine, ServiceTagSize } from '../ServiceTag/service-config';
import { Tag, type TagSize } from '../Tag';
import { TagGroup } from '../TagGroup';
import { ArrowDown, ArrowUp, XBold } from '../../icons';
import { bdsClass } from '../../utils';
import './RelationshipField.css';

export type RelationshipFieldSize = 'sm' | 'md' | 'lg';

/**
 * A single relationship item. Consumers map their domain rows (a service, a
 * team role, a linked resource) to this shape at the boundary — `id` is the
 * stable identifier matched against `options`; `label` is what renders.
 *
 * Pass `category` when the item represents a Brik service line — it drives
 * the icon + color of the read-mode `ServiceTag`. Omit it for non-service
 * relationships; read mode then falls back to a neutral `Tag`.
 */
export interface RelationshipItem {
  /** Stable identifier — matched against `options` by `id`. */
  id: string;
  /** Display label. */
  label: string;
  /** Service-line category, for icon-text `ServiceTag` read-mode rendering. */
  category?: ServiceLine;
}

/** The pickable catalog shares `RelationshipItem`'s shape. */
export type RelationshipOption = RelationshipItem;

export interface RelationshipFieldProps {
  /** Currently selected items, in persisted order. */
  value: RelationshipItem[];
  /** Called with the next ordered list on add / remove / reorder. */
  onChange: (next: RelationshipItem[]) => void;
  /**
   * Full catalog of pickable items. The add control offers `options` minus
   * whatever is already in `value` (matched by `id`).
   */
  options: readonly RelationshipOption[];

  /** Field label above the list. */
  label?: string;
  /** Helper text rendered below the list. */
  helperText?: string;
  /** Placeholder for the add dropdown. */
  addPlaceholder?: string;
  /** Text on the add button. Default `'Add'`. */
  addLabel?: string;
  /** Text shown when the picked list is empty. */
  emptyLabel?: string;
  /** Placeholder shown in the add dropdown once every option is selected. */
  allAddedLabel?: string;

  /** Accessible label for an item's remove button. Default `Remove ${item.label}`. */
  removeLabel?: (item: RelationshipItem) => string;
  /** Accessible label for an item's move-up button. Default `Move ${item.label} up`. */
  moveUpLabel?: (item: RelationshipItem) => string;
  /** Accessible label for an item's move-down button. Default `Move ${item.label} down`. */
  moveDownLabel?: (item: RelationshipItem) => string;

  /** Size of the control (rows, add dropdown, buttons). Default `md`. */
  size?: RelationshipFieldSize;
  /**
   * Renders read mode: an icon-text `ServiceTag` / neutral `Tag` `TagGroup`,
   * order preserved, no inputs, no reorder or remove. Use for view/disabled
   * states.
   */
  disabled?: boolean;
  /** Maximum number of items. Hides the add row once reached. */
  maxItems?: number;
  /** Additional className on the root. */
  className?: string;
}

const BUTTON_SIZE: Record<RelationshipFieldSize, ButtonSize> = { sm: 'sm', md: 'md', lg: 'lg' };
const SELECT_SIZE: Record<RelationshipFieldSize, SelectSize> = { sm: 'sm', md: 'md', lg: 'lg' };
const TAG_SIZE: Record<RelationshipFieldSize, TagSize> = { sm: 'sm', md: 'md', lg: 'lg' };
const SERVICE_TAG_SIZE: Record<RelationshipFieldSize, ServiceTagSize> = { sm: 'sm', md: 'md', lg: 'lg' };

const defaultRemoveLabel = (item: RelationshipItem) => `Remove ${item.label}`;
const defaultMoveUpLabel = (item: RelationshipItem) => `Move ${item.label} up`;
const defaultMoveDownLabel = (item: RelationshipItem) => `Move ${item.label} down`;

/**
 * RelationshipField — orderable multi-pick control for a catalog-backed
 * relationship (services on a plan, linked resources, team roles). Adds
 * from `options`, removes, and reorders with up/down buttons — array
 * position **is** the persisted order (`sort_order`-style columns).
 *
 * Read mode (`disabled`) renders the same items as a `TagGroup` of
 * icon-text `ServiceTag`s (when an item carries `category`) or neutral
 * `Tag`s otherwise — so a read surface and its edit surface share one
 * component family per the read/edit parity standard.
 *
 * Reach for `RelationshipField` when list **order is part of the saved
 * value** (e.g. `sort_order`). When order is incidental — the set of
 * selections matters but not their sequence — use `MultiSelect` or
 * `CatalogPicker` instead. See ADR-031.
 *
 * @example
 * ```tsx
 * <RelationshipField
 *   label="Supported Services"
 *   value={services}
 *   onChange={setServices}
 *   options={allServices}
 *   emptyLabel="No services yet — pick one below to add."
 *   addPlaceholder="Select a service"
 * />
 * ```
 *
 * @summary Orderable add/remove/reorder control for a catalog relationship
 */
export function RelationshipField({
  value,
  onChange,
  options,
  label,
  helperText,
  addPlaceholder = 'Select…',
  addLabel = 'Add',
  emptyLabel,
  allAddedLabel = 'All options already added',
  removeLabel = defaultRemoveLabel,
  moveUpLabel = defaultMoveUpLabel,
  moveDownLabel = defaultMoveDownLabel,
  size = 'md',
  disabled = false,
  maxItems,
  className,
}: RelationshipFieldProps) {
  const [pendingId, setPendingId] = useState('');

  const availableOptions = useMemo<RelationshipOption[]>(() => {
    const selectedIds = new Set(value.map((v) => v.id));
    return options.filter((o) => !selectedIds.has(o.id));
  }, [options, value]);

  const atLimit = typeof maxItems === 'number' && value.length >= maxItems;

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = value.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (id: string) => {
    onChange(value.filter((v) => v.id !== id));
  };

  const add = () => {
    if (!pendingId) return;
    const picked = availableOptions.find((o) => o.id === pendingId);
    if (!picked) return;
    onChange([...value, picked]);
    setPendingId('');
  };

  // ── Read mode ────────────────────────────────────────────────────────────
  // Token-backed TagGroup, order preserved, no inputs, no reorder/remove.
  if (disabled) {
    const showEmpty = value.length === 0 && emptyLabel;
    return (
      <div className={bdsClass('bds-relationship-field', 'bds-relationship-field--read', className)}>
        {label && <span className="bds-relationship-field__label">{label}</span>}
        {value.length > 0 && (
          <TagGroup gap="xs">
            {value.map((item) =>
              item.category ? (
                <ServiceTag
                  key={item.id}
                  category={item.category}
                  variant="icon-text"
                  serviceName={item.label}
                  label={item.label}
                  size={SERVICE_TAG_SIZE[size]}
                />
              ) : (
                <Tag key={item.id} size={TAG_SIZE[size]}>
                  {item.label}
                </Tag>
              ),
            )}
          </TagGroup>
        )}
        {showEmpty && <span className="bds-relationship-field__empty">{emptyLabel}</span>}
        {helperText && <span className="bds-relationship-field__helper">{helperText}</span>}
      </div>
    );
  }

  // ── Edit mode ────────────────────────────────────────────────────────────
  const showEmpty = value.length === 0 && emptyLabel;
  const selectOptions: SelectOption[] = availableOptions.map((o) => ({ label: o.label, value: o.id }));

  return (
    <div className={bdsClass('bds-relationship-field', className)}>
      {label && <span className="bds-relationship-field__label">{label}</span>}

      {value.length > 0 && (
        <div className="bds-relationship-field__rows" role="list">
          {value.map((item, index) => (
            <div key={item.id} className="bds-relationship-field__row" role="listitem">
              <span className="bds-relationship-field__row-label">{item.label}</span>
              <Button
                size={BUTTON_SIZE[size]}
                variant="ghost"
                icon={<Icon icon={ArrowUp} />}
                label={moveUpLabel(item)}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              />
              <Button
                size={BUTTON_SIZE[size]}
                variant="ghost"
                icon={<Icon icon={ArrowDown} />}
                label={moveDownLabel(item)}
                disabled={index === value.length - 1}
                onClick={() => move(index, 1)}
              />
              <Button
                size={BUTTON_SIZE[size]}
                variant="ghost"
                icon={<Icon icon={XBold} />}
                label={removeLabel(item)}
                onClick={() => remove(item.id)}
              />
            </div>
          ))}
        </div>
      )}

      {showEmpty && <span className="bds-relationship-field__empty">{emptyLabel}</span>}

      {!atLimit && (
        <div className="bds-relationship-field__add">
          <Select
            size={SELECT_SIZE[size]}
            value={pendingId}
            onChange={(e) => setPendingId(e.target.value)}
            placeholder={availableOptions.length === 0 ? allAddedLabel : addPlaceholder}
            options={selectOptions}
            disabled={availableOptions.length === 0}
            fullWidth
          />
          <Button size={BUTTON_SIZE[size]} variant="primary" disabled={!pendingId} onClick={add}>
            {addLabel}
          </Button>
        </div>
      )}

      {helperText && <span className="bds-relationship-field__helper">{helperText}</span>}
    </div>
  );
}

export default RelationshipField;
