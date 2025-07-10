import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

interface HeaderProps {
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function Header({ title, description, primaryAction, secondaryAction }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>
        <div className="flex items-center space-x-3">
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              className="flex items-center bg-brand-500 hover:bg-brand-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
