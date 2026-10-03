"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cn } from "cn"

/**
 * Base UI positions the indicator but leaves it full width, so the fill is
 * sized here from the root's value and handed to the indicator as a custom
 * property.
 */
function Progress({
  className,
  children,
  value,
  min = 0,
  max = 100,
  ...props
}: ProgressPrimitive.Root.Props) {
  const percent =
    value === null ? null : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))

  return (
    <ProgressPrimitive.Root
      value={value}
      min={min}
      max={max}
      data-slot="progress"
      className={cn("flex flex-nowrap", className)}
      {...props}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator percent={percent} />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      data-slot="progress-track"
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  percent,
  ...props
}: ProgressPrimitive.Indicator.Props & { percent: number | null }) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      style={{ width: percent === null ? "100%" : `${percent}%` }}
      className={cn(
        "h-full bg-primary transition-[width] duration-500 ease-out",
        className
      )}
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className
      )}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}
