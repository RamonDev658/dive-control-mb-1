import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Trash2 } from "lucide-react";
import { useDiveLogs } from "@/hooks/useDiveLogs";
import { useToast } from "@/hooks/use-toast";
import { exportHistoryToCSV } from "@/utils/csvExport";
import DiveHistoryTable from "./DiveHistoryTable";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface DiveHistoryModalProps {
  trigger: React.ReactNode;
}

export default function DiveHistoryModal({ trigger }: DiveHistoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
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

  const handleExportCSV = () => {
    const success = exportHistoryToCSV(logs);
    if (success) {
      toast({
        title: "Exportação Concluída",
        description: "Histórico exportado para CSV com sucesso",
      });
    } else {
      toast({
        title: "Erro na Exportação",
        description: "Nenhum registro encontrado para exportar",
        variant: "destructive",
      });
    }
  };

  const handleToggleLog = (id: string) => {
    setSelectedLogs(prev => 
      prev.includes(id) 
        ? prev.filter(logId => logId !== id)
        : [...prev, id]
    );
  };

  const handleToggleAll = (checked: boolean) => {
    setSelectedLogs(checked ? logs.map(log => log.id) : []);
  };

  const handleDeleteSelected = async () => {
    let successCount = 0;
    for (const id of selectedLogs) {
      const success = await deleteLog(id);
      if (success) successCount++;
    }
    
    if (successCount > 0) {
      toast({
        title: "Registros Excluídos",
        description: `${successCount} registro(s) removido(s) com sucesso`,
      });
      setSelectedLogs([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-card border-military-gold/30">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-military-gold text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                HISTÓRICO DE MERGULHOS
              </DialogTitle>
              <DialogDescription>
                Visualize todos os mergulhos registrados no sistema
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={logs.length === 0}
                className="border-military-gold/50 text-military-gold hover:bg-military-gold/10"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              {selectedLogs.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir ({selectedLogs.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-military-gold/30">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-military-gold">
                        Confirmar Exclusão em Lote
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-foreground">
                        Tem certeza que deseja excluir {selectedLogs.length} registro(s) de mergulho? 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-muted text-foreground hover:bg-muted/80">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteSelected}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        Excluir Registros
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
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
            <DiveHistoryTable 
              logs={logs} 
              onDeleteLog={handleDeleteLog}
              selectedLogs={selectedLogs}
              onToggleLog={handleToggleLog}
              onToggleAll={handleToggleAll}
              onDeleteSelected={handleDeleteSelected}
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}