import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "lucide-react";
import { useDiveLogs } from "@/hooks/useDiveLogs";
import { useToast } from "@/hooks/use-toast";
import DiveHistoryTable from "./DiveHistoryTable";

interface DiveHistoryModalProps {
  trigger: React.ReactNode;
}

export default function DiveHistoryModal({ trigger }: DiveHistoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { logs, loading, deleteLog, fetchLogs } = useDiveLogs();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && logs.length === 0) {
      fetchLogs();
    }
  }, [isOpen]);


  const handleDeleteLog = async (id: string) => {
    const success = await deleteLog(id);
    if (success) {
      toast({
        title: "Registro Excluído",
        description: "Mergulho removido do histórico com sucesso",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-card border-military-gold/30">
        <DialogHeader>
          <DialogTitle className="text-military-gold text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            HISTÓRICO DE MERGULHOS
          </DialogTitle>
          <DialogDescription>
            Visualize todos os mergulhos registrados no sistema
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh]">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-military-gold">Carregando histórico...</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum mergulho encontrado no histórico</p>
            </div>
          ) : (
            <DiveHistoryTable logs={logs} onDeleteLog={handleDeleteLog} />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}