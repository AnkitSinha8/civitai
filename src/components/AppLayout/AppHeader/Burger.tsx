import {
  DefaultProps,
  MantineColor,
  MantineNumberSize,
  Selectors,
  createStyles,
} from '@mantine/core';

export interface BurgerStylesParams {
  size: MantineNumberSize;
  color?: MantineColor;
  transitionDuration: number;
}

const sizes = {
  xs: 12,
  sm: 18,
  md: 24,
  lg: 34,
  xl: 42,
};

const useStyles = createStyles((theme, { size, color, transitionDuration }: BurgerStylesParams) => {
  const sizeValue = theme.fn.size({ size, sizes });
  const _color = color || (theme.colorScheme === 'dark' ? theme.white : theme.black);

  return {
    root: {
      borderRadius: theme.radius.sm,
      width: `calc(${sizeValue}px + ${theme.spacing.xs}px)`,
      height: `calc(${sizeValue}px + ${theme.spacing.xs}px)`,
      padding: `calc(${theme.spacing.xs}px / 2)`,
      cursor: 'pointer',
    },

    burger: {
      position: 'relative',
      userSelect: 'none',
      boxSizing: 'border-box',

      '&, &::before, &::after': {
        display: 'block',
        width: sizeValue,
        height: Math.ceil(sizeValue / 12),
        backgroundColor: _color,
        outline: '1px solid transparent',
        transitionProperty: 'background-color, transform',
        transitionDuration: `${transitionDuration}ms`,

        '@media (prefers-reduced-motion)': {
          transitionDuration: theme.respectReducedMotion ? '0ms' : undefined,
        },
      },

      '&::before, &::after': {
        position: 'absolute',
        content: '""',
        left: 0,
      },

      '&::before': {
        top: (sizeValue / 3) * -1,
      },

      '&::after': {
        top: sizeValue / 3,
      },

      '&[data-opened]': {
        backgroundColor: 'transparent',

        '&::before': {
          transform: `translateY(${sizeValue / 3}px) rotate(45deg)`,
        },

        '&::after': {
          transform: `translateY(-${sizeValue / 3}px) rotate(-45deg)`,
        },
      },
    },
  };
});

export type BurgerStylesNames = Selectors<typeof useStyles>;

export interface BurgerProps {
  /** Burger state: true for cross, false for burger */
  opened: boolean;

  /** Burger color value, not connected to theme.colors, defaults to theme.black with light color scheme and theme.white with dark */
  color?: string;

  /** Predefined burger size or number to set width and height in px */
  size?: MantineNumberSize;

  /** Transition duration in ms */
  transitionDuration?: number;
  className?: string;
}

export function Burger({
  opened,
  color,
  size = 'md',
  transitionDuration = 300,
  className,
}: BurgerProps) {
  const { classes, cx } = useStyles({ color, size, transitionDuration });

  return (
    <div className={cx(classes.root, 'flex items-center', className)}>
      <div data-opened={opened || undefined} className={cx(classes.burger)} />
    </div>
  );
}
