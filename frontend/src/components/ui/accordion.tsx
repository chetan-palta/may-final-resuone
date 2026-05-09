import * as React from "react"
import { ChevronDown } from "lucide-react"

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
      <div className={`${className || ""}`}>{children}</div>
    </AccordionItemContext.Provider>
  );
};

const AccordionTrigger = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const context = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);
  
  if (!context || !itemContext) return null;

  const isOpen = context.activeItem === itemContext.value;

  return (
    <button 
      onClick={() => context.toggleItem(itemContext.value)}
      className={`flex w-full items-center justify-between py-4 px-6 text-left font-bold text-slate-900 dark:text-white transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800/30 rounded-t-xl ${isOpen ? 'bg-slate-100 dark:bg-slate-800/30' : ''} ${className || ""}`}
    >
      <div className="flex items-center gap-3 flex-1">
        {children}
      </div>
      <ChevronDown 
        className={`w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
  );
};

const AccordionContent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const context = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);
  
  if (!context || !itemContext) return null;
  
  const isOpen = context.activeItem === itemContext.value;

  return (
    <div 
      className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}
    >
      <div className={`px-6 pb-4 text-slate-600 dark:text-slate-300 leading-relaxed text-base ${className || ""}`}>
        {children}
      </div>
    </div>
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
