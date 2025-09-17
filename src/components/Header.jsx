import { Menu, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

export const Header = ({ showBack, onBack, title }) => {
  return (
    <header className="flex items-center justify-between p-6 bg-background">
      <div className="flex items-center gap-4">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="p-0">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        )}
        {!showBack && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-primary-foreground rounded-sm"></div>
                <div className="bg-primary-foreground rounded-sm"></div>
                <div className="bg-primary-foreground rounded-sm"></div>
                <div className="bg-primary-foreground rounded-sm"></div>
              </div>
            </div>
            <span className="text-xl font-bold text-foreground">HomeSwift</span>
          </div>
        )}
        {title && (
          <h1 className="text-xl font-medium text-foreground">{title}</h1>
        )}
      </div>
      <Button variant="ghost" size="icon">
        <Menu className="h-6 w-6" />
      </Button>
    </header>
  );
};