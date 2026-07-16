import * as React from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/60 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PageBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-6 py-6 md:px-8 ${className}`}>{children}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-secondary/20 px-6 py-16 text-center">
      <div className="text-base font-medium">{title}</div>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
