import { cva } from "class-variance-authority";

export const toggleVariants = cva(
  "text-foreground focus-visible:ring-foreground inline-flex items-center justify-center text-base font-medium whitespace-nowrap duration-150 ease-out focus-visible:ring-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "dark:data-[state=on]:bg-mirage-100 data-[state=on]:bg-mirage-900 data-[state=on]:hover:bg-mirage-800 data-[state=on]:text-mirage-50 dark:data-[state=on]:text-mirage-950 dark:data-[state=on]:hover:bg-mirage-200 dark:bg-mirage-900 dark:hover:bg-mirage-800 bg-mirage-100 hover:bg-mirage-200 w-full",
        accent:
          "dark:data-[state=on]:bg-accent data-[state=on]:text-accent-foreground dark:bg-mirage-900 dark:hover:bg-mirage-800 bg-mirage-100 hover:bg-mirage-200 w-full",
        outline:
          "border-foreground/20 dark:data-[state=on]:bg-mirage-100 data-[state=on]:bg-mirage-900 data-[state=on]:hover:bg-mirage-800 data-[state=on]:text-mirage-50 dark:data-[state=on]:text-mirage-950 dark:data-[state=on]:hover:bg-mirage-200 dark:bg-mirage-900 dark:hover:bg-mirage-800 bg-mirage-100 hover:bg-mirage-200 w-full border",
        ghost:
          "hover:bg-foreground/7 text-foreground data-[state=on]:text-accent data-[state=on]:hover:bg-accent/7",
      },
      size: {
        default:
          "h-9 rounded-[18px] px-4 py-2 active:rounded-[8px] data-[state=on]:rounded-[12px] data-[state=on]:active:rounded-[8px]",
        // sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-[20px] px-8 py-2 active:rounded-[8px] data-[state=on]:rounded-[12px] data-[state=on]:active:rounded-[8px]",
        icon: "h-10 w-10 rounded-[20px] active:rounded-[8px] data-[state=on]:rounded-[12px] data-[state=on]:active:rounded-[8px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
