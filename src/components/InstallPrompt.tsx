import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { useState } from "react";

export default function InstallPrompt() {
  const { isInstallable, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(true);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsVisible(false);
    }
  };

  if (!isInstallable || !isVisible) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-gradient-command border-military-gold/30 shadow-command z-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-military-gold" />
            <span className="text-sm font-semibold text-military-gold">
              Instalar App
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-xs text-foreground/80 mb-3">
          Instale o DiveControl para acesso offline e melhor experiência.
        </p>
        
        <Button
          variant="tactical"
          size="sm"
          onClick={handleInstall}
          className="w-full"
        >
          <Download className="w-4 h-4" />
          Instalar Agora
        </Button>
      </CardContent>
    </Card>
  );
}