import { type HTMLAttributes, type ReactNode, type ElementType } from 'react';
import { bdsClass } from '../../utils';
import './Stack.css';

export type StackDirection = 'horizontal' | 'vertical';
export type StackGap = 'none' | 'tiny' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'huge';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around'
  | 'evenly';

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** Layout direction. Maps to `flex-direction`. Default `vertical`. */
  direction?: StackDirection;
  /** Spacing between children. Maps to BDS `--gap-*` tokens. Default `md`. */
  gap?: StackGap;
  /** Cross-axis alignment of children. */
  align?: StackAlign;
  /** Main-axis distribution of children. */
  justify?: StackJustify;
  /** Allow children to wrap to the next line/row. */
  wrap?: boolean;
  /** HTML element to render as. Default `div`. */
  as?: ElementType;
  /** Slotted child content. */
  children?: ReactNode;
}

/**
 * Stack — vertical or horizontal flex container with consistent gap.
 *
 * The most-reached-for layout primitive. Use it whenever you'd otherwise
 * write `display: flex; flex-direction: ...; gap: ...;` in component CSS.
 *
 * @example
 * ```tsx
 * <Stack direction="vertical" gap="md">
 *   <Heading>Title</Heading>
 *   <Text>Body</Text>
 *   <Button>Action</Button>
 * </Stack>
 *
 * <Stack direction="horizontal" gap="sm" align="center">
 *   <Avatar />
 *   <span>User name</span>
 * </Stack>
 * ```
 *
 * Multi-platform note: prop API mirrors SwiftUI HStack/VStack
 * (`direction` ↔ HStack/VStack/ZStack) and Compose Row/Column
 * (`gap` ↔ `Arrangement.spacedBy`) so a Swift / Kotlin port can
 * implement the same surface without breaking changes.
 *
 * @summary Vertical or horizontal flex container with consistent BDS gap.
 */
export function Stack({
  direction = 'vertical',
  gap = 'md',
  align,
  justify,
  wrap,
  as: Element = 'div',
  className,
  ...props
}: StackProps) {
  return (
    <Element
      className={bdsClass(
        'bds-stack',
        `bds-stack--${direction}`,
        gap !== 'none' && `bds-stack--gap-${gap}`,
        align && `bds-stack--align-${align}`,
        justify && `bds-stack--justify-${justify}`,
        wrap && 'bds-stack--wrap',
        className,
      )}
      {...props}
    />
  );
}

export default Stack;
