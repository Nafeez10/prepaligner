import * as React from "react"
import { cn } from "@/lib/utils"

interface AnimatedUnderlineProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

export const AnimatedUnderline = ({ children, className, ...props }: AnimatedUnderlineProps) => {
  return (
    <span className={cn("relative inline-block whitespace-nowrap", className)} {...props}>
      <span className="relative z-10">{children}</span>
      <svg
        className="absolute left-0 bottom-[-8px] w-full h-[12px] -z-10 text-primary pointer-events-none"
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
      >
        <style>
          {`
            .draw-underline {
              stroke-dasharray: 1;
              stroke-dashoffset: 1;
              animation: draw 4s ease-in-out infinite;
            }
            @keyframes draw {
              0% { stroke-dashoffset: 1; }
              30% { stroke-dashoffset: 0; }
              70% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: 1; }
            }
          `}
        </style>
        <path
          d="M 2 8 Q 50 4 96 8 L 82 14 L 95 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          className="draw-underline"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  )
}
