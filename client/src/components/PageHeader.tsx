interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, className = "", children }: PageHeaderProps) {
  return (
    <div className={`bg-slate-50 border-b border-border/50 py-16 md:py-24 ${className}`}>
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {title}
        </h1>
        {description && (
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
            {description}
          </p>
        )}
        {children && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
