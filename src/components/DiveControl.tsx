import { useState, useRef } from "react";
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
  diverA: string;
  diverB: string;
  diverC: string;
  activityType: string;
}

interface DiveRecord {
  id: string;
  teamName: string;
  diverA: string;
  diverB: string;
  diverC: string;
  activityType: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
}

export default function DiveControl() {
  const [diveRecords, setDiveRecords] = useState<DiveRecord[]>([]);
  const { toast } = useToast();
  const timerRefs = useRef<Array<{ resetAllData: () => void } | null>>([null, null, null, null]);

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
      diverA: data.diverA,
      diverB: data.diverB,
      diverC: data.diverC,
      activityType: data.activityType,
      date: data.startTime.toLocaleDateString('pt-BR'),
      startTime: data.startTime.toLocaleTimeString('pt-BR'),
      endTime: data.endTime.toLocaleTimeString('pt-BR'),
      duration: formatDuration(data.duration)
    };

    setDiveRecords(prev => [newRecord, ...prev]);
    
    toast({
      title: "Mergulho Registrado",
      description: `${data.teamName} - ${data.activityType} completou o mergulho`,
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

    const headers = ['Equipe', 'Mergulhador', 'Tipo de Atividade', 'Data', 'Horário de Início', 'Horário de Término', 'Duração'];
    const csvRows = [];
    
    // Criar uma linha para cada mergulhador
    diveRecords.forEach(record => {
      const divers = [record.diverA, record.diverB, record.diverC].filter(diver => diver.trim());
      divers.forEach(diver => {
        csvRows.push([record.teamName, diver, record.activityType, record.date, record.startTime, record.endTime, record.duration].join(','));
      });
    });
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');

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
    // Reset all timers
    timerRefs.current.forEach(timerRef => {
      if (timerRef) {
        timerRef.resetAllData();
      }
    });
    toast({
      title: "Registros Limpos",
      description: "Todos os registros e dados dos mergulhadores foram removidos",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-tactical p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6 flex-col md:flex-row gap-4">
          <div className="text-center flex-1 order-2 md:order-1">
            <div className="flex items-center justify-center gap-4 mb-2 flex-col md:flex-row">
              <img 
                src="/lovable-uploads/7032a47b-eff7-4654-889f-3d26c95cb414.png" 
                alt="DiveControl Logo" 
                className="w-16 h-16 md:w-20 md:h-20"
              />
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground drop-shadow-lg mb-1">
                  DIVECONTROL_1.0
                </h1>
                <p className="text-base md:text-lg text-foreground/80 drop-shadow">
                  Sistema de Controle de Mergulhos Militares
                </p>
              </div>
            </div>
          </div>
          
          <Button
            variant="tactical"
            size="xl"
            onClick={exportToCSV}
            className="min-w-[150px] order-1 md:order-2"
          >
            <Save className="w-5 h-5" />
            SALVAR MG
          </Button>
        </div>

        {/* Timer Grid - 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DiveTimer
            ref={(ref) => timerRefs.current[0] = ref}
            teamId="EQUIPE 01"
            initialTime={initialTime}
            onDiveComplete={handleDiveComplete}
          />
          <DiveTimer
            ref={(ref) => timerRefs.current[1] = ref}
            teamId="EQUIPE 02"
            initialTime={initialTime}
            onDiveComplete={handleDiveComplete}
          />
          <DiveTimer
            ref={(ref) => timerRefs.current[2] = ref}
            teamId="EQUIPE 03"
            initialTime={initialTime}
            onDiveComplete={handleDiveComplete}
          />
          <DiveTimer
            ref={(ref) => timerRefs.current[3] = ref}
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