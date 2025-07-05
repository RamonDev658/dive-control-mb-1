import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Users, Activity, Trash2 } from "lucide-react";
import { useDiveLogs, DiveLogRecord } from "@/hooks/useDiveLogs";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDeleteLog = async (id: string) => {
    const success = await deleteLog(id);
    if (success) {
      toast({
        title: "Registro Excluído",
        description: "Mergulho removido do histórico com sucesso",
      });
    }
  };

  const groupedLogs = logs.reduce((acc, log) => {
    const date = formatDate(log.data);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, DiveLogRecord[]>);

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
          ) : Object.keys(groupedLogs).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum mergulho encontrado no histórico</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedLogs)
                .sort(([a], [b]) => new Date(b.split('/').reverse().join('-')).getTime() - new Date(a.split('/').reverse().join('-')).getTime())
                .map(([date, dayLogs]) => (
                  <div key={date} className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-military-gold/30 pb-2">
                      <Calendar className="w-4 h-4 text-military-gold" />
                      <h3 className="text-lg font-semibold text-military-gold">{date}</h3>
                      <Badge variant="outline" className="ml-auto">
                        {dayLogs.length} mergulhos
                      </Badge>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <Table>
                         <TableHeader>
                           <TableRow className="bg-military-blue/20 hover:bg-military-blue/30">
                             <TableHead className="text-military-gold font-semibold">Equipe</TableHead>
                             <TableHead className="text-military-gold font-semibold">Mergulhador</TableHead>
                             <TableHead className="text-military-gold font-semibold">Atividade</TableHead>
                             <TableHead className="text-military-gold font-semibold">Início</TableHead>
                             <TableHead className="text-military-gold font-semibold">Término</TableHead>
                             <TableHead className="text-military-gold font-semibold">Duração</TableHead>
                             <TableHead className="text-military-gold font-semibold">Ações</TableHead>
                           </TableRow>
                         </TableHeader>
                        <TableBody>
                          {dayLogs
                            .sort((a, b) => new Date(b.horario_inicio).getTime() - new Date(a.horario_inicio).getTime())
                            .map((log) => (
                              <TableRow key={log.id} className="hover:bg-muted/30 border-border/50">
                                <TableCell className="font-medium text-foreground">
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-military-gold" />
                                    {log.equipe}
                                  </div>
                                </TableCell>
                                 <TableCell className="text-foreground font-medium">
                                   {log.nome_guerra}
                                 </TableCell>
                                 <TableCell className="text-foreground">
                                   <div className="flex items-center gap-2">
                                     <Activity className="w-4 h-4 text-military-gold" />
                                     {log.atividade}
                                   </div>
                                 </TableCell>
                                <TableCell className="text-foreground">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-military-gold" />
                                    {formatTime(log.horario_inicio)}
                                  </div>
                                </TableCell>
                                <TableCell className="text-foreground">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-military-gold" />
                                    {formatTime(log.horario_fim)}
                                  </div>
                                </TableCell>
                                <TableCell className="text-foreground font-mono">
                                  {formatDuration(log.duracao_em_seg)}
                                </TableCell>
                                <TableCell>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-card border-military-gold/30">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-military-gold">
                                          Confirmar Exclusão
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-foreground">
                                          Tem certeza que deseja excluir este registro de mergulho? Esta ação não pode ser desfeita.
                                          <br />
                                          <strong>Equipe:</strong> {log.equipe} - <strong>Mergulhador:</strong> {log.nome_guerra}
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-muted text-foreground hover:bg-muted/80">
                                          Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteLog(log.id)}
                                          className="bg-red-600 text-white hover:bg-red-700"
                                        >
                                          Excluir
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}