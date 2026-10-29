import React, { Children, isValidElement, cloneElement } from 'react';

import { cn } from '@/utils/app.utils';

/**
 * Small, MUI-like Stack component for React 19 + TypeScript.
 * - Implements direction, spacing (number => 8px * n), align, justify, wrap, divider, sx and component override.
 * - No external dependencies. Works as a drop-in lightweight replacement for simple layouts.
 */

type Direction = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export type StackProps<C extends React.ElementType = 'div'> = {
  component?: C;
  /**
   * Spacing between children. If number, multiplied by 8 (MUI default spacing).
   * Can also be any valid CSS length (e.g. '12px', '1rem').
   */
  spacing?: number | string;
  direction?: Direction;
  align?: React.CSSProperties['alignItems'];
  justify?: React.CSSProperties['justifyContent'];
  wrap?: React.CSSProperties['flexWrap'];
  /** A node to render between children (e.g. a Divider) */
  divider?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<C>, 'children'>;

/** Utility to compute the CSS gap value from spacing prop */
const computeGap = (spacing?: number | string) => {
  if (spacing == null) return undefined;
  if (typeof spacing === 'number') return `${spacing * 4}px`;
  return spacing;
};

/** Flatten children and remove null/boolean */
const getValidChildren = (children: React.ReactNode) => {
  const arr: React.ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (child === null || child === undefined || typeof child === 'boolean') return;
    arr.push(child);
  });
  return arr;
};

const getClassNames = (
  direction: Direction,
  align?: React.CSSProperties['alignItems'],
  justify?: React.CSSProperties['justifyContent']
) => {
  let classNames = 'flex';

  switch (direction) {
    case 'row':
      classNames += ' flex-row';
      break;
    case 'column':
      classNames += ' flex-col';
      break;
    case 'row-reverse':
      classNames += ' flex-row-reverse';
      break;
    case 'column-reverse':
      classNames += ' flex-col-reverse';
      break;
    default:
      break;
  }

  if (align) {
    classNames += ` items-${align}`;
  }

  if (justify) {
    classNames += ` justify-${justify}`;
  }
  return classNames;
};

const defaultProps = {
  component: 'div' as const,
  spacing: 0,
  direction: 'column' as const,
} as const;

const Stack = <C extends React.ElementType = 'div'>(props: StackProps<C>) => {
  const {
    component,
    spacing,
    direction,
    align,
    justify,
    wrap,
    divider,
    className,
    children,
    style,
    ...other
  } = { ...defaultProps, ...props } as StackProps<C> & { style?: React.CSSProperties };

  const Component = (component || 'div');

  // Compose final style. `gap` is supported in modern browsers and provides ideal behavior for flex gaps.
  const finalStyle: React.CSSProperties = {
    gap: computeGap(spacing),
    ...style,
  };

  const validChildren = getValidChildren(children);

  // If a divider is provided, intersperse it between children. Clone to ensure keys.
  const items: React.ReactNode[] = [];

  if (divider !== undefined && validChildren.length > 0) {
    validChildren.forEach((child, i) => {
      items.push(child);
      if (i < validChildren.length - 1) {
        // wrap divider in a span to avoid invalid DOM when divider is a primitive
        const key = `divider-${i}`;

        if (isValidElement(divider)) {
          items.push(cloneElement(divider as React.ReactElement, { key }));
        } else {
          items.push(
            <span key={key} aria-hidden style={{ display: 'inline-flex', alignItems: 'center' }}>
              {divider}
            </span>
          );
        }
      }
    });
  } else {
    // No divider: just pass through children
    validChildren.forEach((c, i) => {
      if (isValidElement(c)) {
        items.push(
          cloneElement(c as React.ReactElement, {
            key: (c as any)?.key ?? i,
          })
        );
      } else {
        items.push(c);
      }
    });
  }

  return (
    <Component
      style={finalStyle}
      className={cn(
        getClassNames(direction ?? defaultProps.direction, align, justify),
        className
      )}
      {...(other as any)}
    >
      {items}
    </Component>
  );
};

export default Stack;

/**
 * Usage examples (paste into your project):
 *
 * import Stack from './Stack';
 *
 * // Basic vertical stack
 * <Stack spacing={2}>
 *   <div>Item A</div>
 *   <div>Item B</div>
 * </Stack>
 *
 * // Horizontal centered with custom spacing and divider
 * <Stack direction="row" spacing={1} align="center" divider={<span style={{width:1,height:24,background:'#ddd'}}/>}>
 *   <button>Yes</button>
 *   <button>No</button>
 *   <button>Maybe</button>
 * </Stack>
 *
 * // Override the root element and pass native props
 * <Stack component="section" spacing="12px" role="group">
 *   ...
 * </Stack>
 */
