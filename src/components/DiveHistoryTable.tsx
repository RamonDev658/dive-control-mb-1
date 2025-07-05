import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Activity, Trash2 } from "lucide-react";
import { DiveLogRecord } from "@/hooks/useDiveLogs";
import { formatDate, formatTime, formatDuration } from "@/utils/dateFormatters";
import DiveLogDeleteButton from "./DiveLogDeleteButton";

interface DiveHistoryTableProps {
  logs: DiveLogRecord[];  
  onDeleteLog: (id: string) => void;
  selectedLogs: string[];
  onToggleLog: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onDeleteSelected: () => void;
}

export default function DiveHistoryTable({ 
  logs, 
  onDeleteLog, 
  selectedLogs, 
  onToggleLog, 
  onToggleAll, 
  onDeleteSelected 
}: DiveHistoryTableProps) {
  const groupedLogs = logs.reduce((acc, log) => {
    const date = formatDate(log.data);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, DiveLogRecord[]>);

  const allLogsSelected = logs.length > 0 && selectedLogs.length === logs.length;
  const someLogsSelected = selectedLogs.length > 0;

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      {someLogsSelected && (
        <div className="flex items-center justify-between p-4 bg-military-gold/10 rounded-lg border border-military-gold/30">
          <span className="text-military-gold font-medium">
            {selectedLogs.length} registro(s) selecionado(s)
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteSelected}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Selecionados
          </Button>
        </div>
      )}

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
                    <TableHead className="text-military-gold font-semibold w-12">
                       <Checkbox
                         checked={dayLogs.every(log => selectedLogs.includes(log.id))}
                         onCheckedChange={(checked) => {
                           const dayLogIds = dayLogs.map(log => log.id);
                           if (checked) {
                             // Adicionar apenas os logs deste dia
                             dayLogIds.forEach(id => {
                               if (!selectedLogs.includes(id)) {
                                 onToggleLog(id);
                               }
                             });
                           } else {
                             // Remove apenas os logs deste dia
                             dayLogIds.forEach(id => {
                               if (selectedLogs.includes(id)) {
                                 onToggleLog(id);
                               }
                             });
                           }
                         }}
                         className="border-military-gold data-[state=checked]:bg-military-gold"
                       />
                    </TableHead>
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
                        <TableCell>
                          <Checkbox
                            checked={selectedLogs.includes(log.id)}
                            onCheckedChange={() => onToggleLog(log.id)}
                            className="border-military-gold data-[state=checked]:bg-military-gold"
                          />
                        </TableCell>
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
                          <DiveLogDeleteButton log={log} onDelete={onDeleteLog} />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
    </div>
  );
}