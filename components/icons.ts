// BDS internal icon constants — Phosphor set via Iconify
// Usage: import { X, Plus, ... } from '../../icons'
// Render: <Icon icon={X} />

export const X = 'ph:x';
export const XBold = 'ph:x-bold';
export const Plus = 'ph:plus';
export const Minus = 'ph:minus';
export const CaretDown = 'ph:caret-down';
export const CaretUp = 'ph:caret-up';
export const CaretLeft = 'ph:caret-left';
export const CaretRight = 'ph:caret-right';
// Bold carets — form-control chevrons (dropdown triggers, steppers, disclosure).
// Phosphor regular reads as a hairline at small UI sizes; bold is the BDS-canon
// weight for glyphs at sm size. See rag:components-icons "Phosphor weights".
export const CaretDownBold = 'ph:caret-down-bold';
export const CaretUpBold = 'ph:caret-up-bold';
export const MagnifyingGlass = 'ph:magnifying-glass';
export const MapPin = 'ph:map-pin';
export const CloudArrowUp = 'ph:cloud-arrow-up';
export const ArrowSquareOut = 'ph:arrow-square-out';
export const CheckCircle = 'ph:check-circle';
export const Circle = 'ph:circle';
export const WarningCircle = 'ph:warning-circle';
export const Warning = 'ph:warning';
export const Info = 'ph:info';
export const Spinner = 'ph:spinner';
export const CircleX = 'ph:x-circle';
// Navigation / general
export const ArrowLeft = 'ph:arrow-left';
export const ArrowLeftBold = 'ph:arrow-left-bold';
export const ArrowRight = 'ph:arrow-right';
export const ArrowUp = 'ph:arrow-up';
export const ArrowDown = 'ph:arrow-down';
export const Bars = 'ph:list';
export const Ellipsis = 'ph:dots-three';
export const EllipsisVertical = 'ph:dots-three-vertical';
export const Pen = 'ph:pencil';
export const Trash = 'ph:trash';
export const Check = 'ph:check';
export const Copy = 'ph:copy';
export const Download = 'ph:download-simple';
export const Upload = 'ph:upload-simple';
export const ShareNodes = 'ph:share-network';
export const Filter = 'ph:funnel';
export const Sort = 'ph:arrows-down-up';
export const User = 'ph:user';
export const Users = 'ph:users';
export const Envelope = 'ph:envelope';
export const Phone = 'ph:phone';
export const Calendar = 'ph:calendar';
export const Clock = 'ph:clock';
export const File = 'ph:file';
export const Folder = 'ph:folder';
export const Image = 'ph:image';
export const Link = 'ph:link';
export const Paperclip = 'ph:paperclip';
export const Comment = 'ph:chat';
export const Bell = 'ph:bell';
export const Gear = 'ph:gear';
export const House = 'ph:house';
export const Building = 'ph:buildings';
export const Tag = 'ph:tag';
export const Star = 'ph:star';
export const Heart = 'ph:heart';
export const Bookmark = 'ph:bookmark';
export const Lock = 'ph:lock';
export const Unlock = 'ph:lock-open';
export const Eye = 'ph:eye';
export const EyeSlash = 'ph:eye-slash';
export const Rocket = 'ph:rocket';
export const Palette = 'ph:palette';
export const Shield = 'ph:shield-check';
export const Gears = 'ph:gear-six';
export const ChartLine = 'ph:chart-line';
export const ChartPie = 'ph:chart-pie';
export const ChartBar = 'ph:chart-bar';
export const Briefcase = 'ph:briefcase';
export const GraduationCap = 'ph:graduation-cap';
export const Stethoscope = 'ph:stethoscope';
export const Rotate = 'ph:arrows-clockwise';
// Integration lifecycle — connect / disconnect glyphs (brikdesigns/brik-bds#1127)
export const PlugsConnected = 'ph:plugs-connected';
export const LinkBreak = 'ph:link-break';

// ── Canonical CRUD + integration-lifecycle action set ──────────────────────
// Single source of truth for action-button glyphs across CRUD forms and
// integration/source cards, so the same action can't drift to different glyphs
// per surface (brikdesigns/brik-bds#1127). Every glyph here is a `ph:*` literal
// under `components/`, so `npm run gen:icons` bundles it into the offline subset
// — these resolve with no runtime CDN fetch.
//
// Consume as an icon-only Button inside a ButtonGroup — never the deprecated
// IconButton:
//   import { ACTION_ICONS, Icon, Button, ButtonGroup } from '@brikdesigns/bds';
//   <ButtonGroup>
//     <Button icon={<Icon icon={ACTION_ICONS.sync} />} label="Sync" />
//     <Button icon={<Icon icon={ACTION_ICONS.disconnect} />} label="Disconnect" variant="destructive" />
//   </ButtonGroup>
export const ACTION_ICONS = {
  /** Read / inspect a record. */
  view: Eye,
  /** Open in an external system (new tab). */
  openExternal: ArrowSquareOut,
  /** Manual sync / refresh from a source. */
  sync: Rotate,
  /** Set up / connect an integration (the not-configured affordance). */
  connect: PlugsConnected,
  /** Disconnect / unlink an integration. */
  disconnect: LinkBreak,
  /** Edit an existing record. */
  edit: Pen,
  /** Delete a record (destructive). */
  delete: Trash,
  /** Add / create a new record. */
  add: Plus,
} as const;

/** Semantic action names in {@link ACTION_ICONS}. */
export type ActionIconName = keyof typeof ACTION_ICONS;
