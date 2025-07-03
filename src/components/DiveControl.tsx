import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import DiveTimer from "./DiveTimer";
import DiveControlTable from "./DiveControlTable";
import { Save } from "lucide-react";

interface DiveData {
  teamName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  diver: string;
}

interface DiveRecord {
  id: string;
  teamName: string;
  diver: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
}

export default function DiveControl() {
  const [diveRecords, setDiveRecords] = useState<DiveRecord[]>([]);
  const { toast } = useToast();

  // Initial timer setting: 54 minutes and 45 seconds
  const initialTime = 54 * 60 + 45; // 3285 seconds

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDiveComplete = (data: DiveData) => {
    const newRecord: DiveRecord = {
      id: Date.now().toString(),
      teamName: data.teamName,
      diver: data.diver,
      date: data.startTime.toLocaleDateString('pt-BR'),
      startTime: data.startTime.toLocaleTimeString('pt-BR'),
      endTime: data.endTime.toLocaleTimeString('pt-BR'),
      duration: formatDuration(data.duration)
    };

    setDiveRecords(prev => [newRecord, ...prev]);
    
    toast({
      title: "Mergulho Registrado",
      description: `${data.teamName} - ${data.diver} completou o mergulho`,
      duration: 3000,
    });
  };

  const exportToCSV = () => {
    if (diveRecords.length === 0) {
      toast({
        title: "Aviso",
        description: "Nenhum registro para exportar",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const headers = ['Equipe', 'Mergulhador(es)', 'Data', 'Horário de Início', 'Horário de Término', 'Duração'];
    const csvContent = [
      headers.join(','),
      ...diveRecords.map(record => 
        [record.teamName, record.diver, record.date, record.startTime, record.endTime, record.duration].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `controle_mergulhos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportação Concluída",
      description: "Arquivo CSV baixado com sucesso",
      duration: 3000,
    });
  };

  const clearRecords = () => {
    setDiveRecords([]);
    toast({
      title: "Registros Limpos",
      description: "Todos os registros foram removidos",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-tactical p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-foreground drop-shadow-lg mb-2">
              DIVECONTROL_1.0
            </h1>
            <p className="text-lg text-foreground/80 drop-shadow">
              Sistema de Controle de Mergulhos Militares
            </p>
          </div>
          
          <Button
            variant="tactical"
            size="xl"
            onClick={exportToCSV}
            className="min-w-[150px]"
          >
            <Save className="w-5 h-5" />
            SALVAR MG
          </Button>
        </div>

        {/* Timer Grid - 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DiveTimer
            teamId="EQUIPE 01"
            initialTime={initialTime}
            onDiveComplete={handleDiveComplete}
          />
          <DiveTimer
            teamId="EQUIPE 02"
            initialTime={initialTime}
            onDiveComplete={handleDiveComplete}
          />
          <DiveTimer
            teamId="EQUIPE 03"
            initialTime={initialTime}
            onDiveComplete={handleDiveComplete}
          />
          <DiveTimer
            teamId="EQUIPE 04"
            initialTime={initialTime}
            onDiveComplete={handleDiveComplete}
          />
        </div>

        {/* Control Table */}
        <DiveControlTable
          records={diveRecords}
          onExportCSV={exportToCSV}
          onClearRecords={clearRecords}
        />
      </div>
    </div>
  );
}