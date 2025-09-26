import { Menu, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

export const Header = ({ showBack, onBack, title }) => {
  return (
    <header className="flex items-center justify-between p-6" style={{ backgroundColor: '#1E1E1E' }}>
      <div className="flex items-center gap-4">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="p-0 text-white hover:bg-gray-700">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        )}
        {!showBack && (
          <div className="flex items-center gap-3">
            <img 
              src="/images/logo.png" 
              alt="HomeSwift Logo" 
              className="w-10 h-10 rounded-lg object-cover"
            />
            <span className="text-3xl font-bold text-white">Home<span className="text-primary">Swift</span></span>
          </div>
        )}
        {title && (
          <h1 className="text-xl font-medium text-white">{title}</h1>
        )}
      </div>
      <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
        <Menu className="h-6 w-6" />
      </Button>
    </header>
  );
};