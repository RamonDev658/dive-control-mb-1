import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Activity } from "lucide-react";
import { DiveLogRecord } from "@/hooks/useDiveLogs";
import { formatDate, formatTime, formatDuration } from "@/utils/dateFormatters";
import DiveLogDeleteButton from "./DiveLogDeleteButton";

interface DiveHistoryTableProps {
  logs: DiveLogRecord[];  
  onDeleteLog: (id: string) => void;
}

export default function DiveHistoryTable({ logs, onDeleteLog }: DiveHistoryTableProps) {
  const groupedLogs = logs.reduce((acc, log) => {
    const date = formatDate(log.data);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, DiveLogRecord[]>);

  return (
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