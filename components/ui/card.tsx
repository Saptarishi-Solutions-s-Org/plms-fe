"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

type WithTooltipProps = {
  title?: string;
  children: React.ReactNode;
};

function WithTooltip({ title, children }: WithTooltipProps) {
  if (!title) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="block cursor-pointer">{children}</span>
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          {title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

type CardTitleProps = React.ComponentProps<"div"> & {
  title?: string;
};

function CardTitle({ className, title, children, ...props }: CardTitleProps) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    >
      <WithTooltip title={title}>{children}</WithTooltip>
    </div>
  );
}

type CardDescriptionProps = React.ComponentProps<"div"> & {
  title?: string;
};

function CardDescription({
  className,
  title,
  children,
  ...props
}: CardDescriptionProps) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    >
      <WithTooltip title={title}>{children}</WithTooltip>
    </div>
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

type CardContentProps = React.ComponentProps<"div"> & {
  title?: string;
};

function CardContent({
  className,
  title,
  children,
  ...props
}: CardContentProps) {
  return (
    <div data-slot="card-content" className={cn("px-6", className)} {...props}>
      <WithTooltip title={title}>{children}</WithTooltip>
    </div>
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
