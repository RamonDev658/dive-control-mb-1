import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import DiveTimer from "./DiveTimer";
import DiveControlTable from "./DiveControlTable";
import InstallPrompt from "./InstallPrompt";
import UpdateNotification from "./UpdateNotification";
import { Save, Plus } from "lucide-react";

interface DiveData {
  teamName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  diverA: string;
  diverB: string;
  diverC?: string; // Optional third diver
  activityType: string;
}

interface DiveRecord {
  id: string;
  teamName: string;
  diverA: string;
  diverB: string;
  diverC?: string; // Optional third diver
  activityType: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
}

interface Team {
  id: string;
  name: string;
}

export default function DiveControl() {
  const [diveRecords, setDiveRecords, clearDiveRecords] = useLocalStorage<DiveRecord[]>('divecontrol-records', []);
  const [teams, setTeams] = useLocalStorage<Team[]>('divecontrol-teams', [
    { id: '1', name: 'EQUIPE 01' },
    { id: '2', name: 'EQUIPE 02' },
    { id: '3', name: 'EQUIPE 03' }
  ]);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();
  const timerRefs = useRef<{ [key: string]: { resetAllData: () => void } | null }>({});

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      const divers = [record.diverA, record.diverB, record.diverC].filter(diver => diver && diver.trim());
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
    clearDiveRecords();
    // Reset all timers
    Object.values(timerRefs.current).forEach(timerRef => {
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

  const addTeam = () => {
    const newTeamNumber = teams.length + 1;
    const newTeam: Team = {
      id: Date.now().toString(),
      name: `EQUIPE ${newTeamNumber.toString().padStart(2, '0')}`
    };
    setTeams(prev => [...prev, newTeam]);
    
    toast({
      title: "Equipe Adicionada",
      description: `${newTeam.name} foi criada`,
      duration: 2000,
    });
  };

  const removeTeam = (teamId: string) => {
    setTeams(prev => prev.filter(team => team.id !== teamId));
    // Reset timer for this team if it exists
    const timerRef = timerRefs.current[teamId];
    if (timerRef) {
      timerRef.resetAllData();
      delete timerRefs.current[teamId];
    }
    
    toast({
      title: "Equipe Removida",
      description: "Equipe foi removida com sucesso",
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-tactical">
      <InstallPrompt />
      <UpdateNotification />
      
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-tactical/95 backdrop-blur-sm border-b border-military-gold/20">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between flex-col md:flex-row gap-4">
            <div className="text-center flex-1 order-2 md:order-1">
              <div className="flex items-center justify-center gap-4 mb-2 flex-col md:flex-row">
                <img 
                  src="/lovable-uploads/7032a47b-eff7-4654-889f-3d26c95cb414.png" 
                  alt="DiveControl Logo" 
                  className="w-24 h-24 md:w-20 md:h-20"
                />
                <div className="text-center md:text-left">
                  <h1 className="text-2xl md:text-4xl font-bold text-foreground drop-shadow-lg mb-1">
                    DIVECONTROL_1.0
                  </h1>
                  <p className="text-sm md:text-lg text-foreground/80 drop-shadow">
                    Sistema de Controle de Mergulhos Militares
                  </p>
                </div>
              </div>
            </div>
            
            <Button
              variant="tactical"
              size="xl"
              onClick={exportToCSV}
              className="min-w-[150px] order-1 md:order-2 hidden md:flex"
            >
              <Save className="w-5 h-5" />
              SALVAR MG
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content with top padding for fixed header */}
      <div className="pt-32 md:pt-24 p-4">
        <div className="max-w-7xl mx-auto mb-8">
          {/* Timer Grid - Dynamic Teams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {teams.map((team) => (
              <DiveTimer
                key={team.id}
                ref={(ref) => timerRefs.current[team.id] = ref}
                teamId={team.name}
                initialTime={initialTime}
                onDiveComplete={handleDiveComplete}
              />
            ))}
            
            {/* Add Team Button - Shows if less than 3 teams */}
            {teams.length < 3 && (
              <div className="flex items-center justify-center">
                <Button
                  variant="outline"
                  size="xl"
                  onClick={addTeam}
                  className="h-32 w-full border-dashed border-2 border-military-gold/50 hover:border-military-gold text-military-gold hover:bg-military-gold/10"
                >
                  <Plus className="w-8 h-8 mr-2" />
                  ADICIONAR EQUIPE
                </Button>
              </div>
            )}
          </div>

          {/* Control Table */}
          <DiveControlTable
            records={diveRecords}
            onExportCSV={exportToCSV}
            onClearRecords={clearRecords}
          />
        </div>
      </div>
    </div>
  );
}