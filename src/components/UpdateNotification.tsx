import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, X } from "lucide-react";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { useState } from "react";

export default function UpdateNotification() {
  const { isUpdateAvailable, updateApp } = useServiceWorker();
  const [isVisible, setIsVisible] = useState(true);

  const handleUpdate = () => {
    updateApp();
    setIsVisible(false);
  };

  if (!isUpdateAvailable || !isVisible) {
    return null;
  }

  return (
    <Card className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-gradient-command border-military-gold/30 shadow-command z-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-military-gold" />
            <span className="text-sm font-semibold text-military-gold">
              Atualização Disponível
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
          Uma nova versão do DiveControl está disponível.
        </p>
        
        <Button
          variant="tactical"
          size="sm"
          onClick={handleUpdate}
          className="w-full"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar Agora
        </Button>
      </CardContent>
    </Card>
  );
}