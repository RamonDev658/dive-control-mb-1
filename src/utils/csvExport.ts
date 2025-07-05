import { DiveLogRecord } from "@/hooks/useDiveLogs";
import { formatDate, formatTime, formatDuration } from "./dateFormatters";

export const exportHistoryToCSV = (logs: DiveLogRecord[]) => {
  if (logs.length === 0) {
    return null;
  }

  const headers = ['Equipe', 'Mergulhador', 'Atividade', 'Data', 'Horário de Início', 'Horário de Término', 'Duração'];
  
  const csvRows = logs.map(log => [
    log.equipe,
    log.nome_guerra,
    log.atividade,
    formatDate(log.data),
    formatTime(log.horario_inicio),
    formatTime(log.horario_fim),
    formatDuration(log.duracao_em_seg)
  ].join(','));
  
  const csvContent = [headers.join(','), ...csvRows].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `historico_mergulhos_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return true;
};