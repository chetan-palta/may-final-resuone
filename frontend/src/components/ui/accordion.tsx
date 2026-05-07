import * as React from "react"

const AccordionContext = React.createContext<{
  activeItem: string | null;
  toggleItem: (value: string) => void;
} | null>(null);

const Accordion = ({ children, collapsible, className }: { children: React.ReactNode, type?: string, collapsible?: boolean, className?: string }) => {
  const [activeItem, setActiveItem] = React.useState<string | null>(null);
  
  const toggleItem = (value: string) => {
    setActiveItem(prev => (prev === value && collapsible) ? null : value);
  };

  return (
    <AccordionContext.Provider value={{ activeItem, toggleItem }}>
      <div className={`w-full ${className || ""}`}>{children}</div>
    </AccordionContext.Provider>
  );
};

const AccordionItemContext = React.createContext<{
  value: string;
} | null>(null);

const AccordionItem = ({ value, children, className }: { value: string, children: React.ReactNode, className?: string }) => {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={className || ""}>{children}</div>
    </AccordionItemContext.Provider>
  );
};

const AccordionTrigger = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const context = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);
  
  if (!context || !itemContext) return null;

  return (
    <button 
      onClick={() => context.toggleItem(itemContext.value)}
      className={`flex w-full items-center justify-between gap-4 rounded-2xl py-5 text-left font-medium transition-all duration-300 hover:scale-[1.01] ${className || ""}`}
    >
       {children}
    </button>
  );
};

const AccordionContent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const context = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);
  
  if (!context || !itemContext) return null;
  
  const isOpen = context.activeItem === itemContext.value;

  return (
  return (
    <div
      className={`grid overflow-hidden text-sm transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"} ${className || ""}`}
    >
      <div className="overflow-hidden pb-5">
        {children}
      </div>
    </div>
  );
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
