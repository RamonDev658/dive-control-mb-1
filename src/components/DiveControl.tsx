import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/contexts/AuthContext";
import { useDiveLogs } from "@/hooks/useDiveLogs";
import DiveTimer from "./DiveTimer";
import DiveControlTable from "./DiveControlTable";
import InstallPrompt from "./InstallPrompt";
import UpdateNotification from "./UpdateNotification";
import DiveHistoryModal from "./DivHistoryModal";
import { Save, Plus, LogOut, User, History } from "lucide-react";

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

  // Ensure only 3 teams are shown initially
  useEffect(() => {
    if (teams.length > 3) {
      const firstThreeTeams = teams.slice(0, 3);
      setTeams(firstThreeTeams);
    }
  }, []);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { logs, saveDiveLog, saveLogOffline } = useDiveLogs();
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

  const handleDiveComplete = async (data: DiveData) => {
    // Create individual records for each diver - each diver gets their own independent record
    const divers = [
      data.diverA,
      data.diverB,
      ...(data.diverC ? [data.diverC] : [])
    ].filter(diver => diver && diver.trim() && 
             !['Mergulhador A', 'Mergulhador B', 'Mergulhador C'].includes(diver));

    let savedCount = 0;
    let offlineCount = 0;

    // Save each diver as a separate independent record in Supabase
    for (const diver of divers) {
      const logData = {
        equipe: data.teamName,
        nome_guerra: diver,
        nome_guerra_2: '', // Empty for individual records
        nome_guerra_3: '', // Empty for individual records
        atividade: data.activityType,
        horario_inicio: data.startTime.toISOString(),
        horario_fim: data.endTime.toISOString(),
        duracao_em_seg: data.duration,
        data: data.startTime.toISOString().split('T')[0] // YYYY-MM-DD format
      };

      // Try to save to Supabase first
      const savedToSupabase = await saveDiveLog(logData);
      
      if (savedToSupabase) {
        savedCount++;
      } else {
        // If fails to save to Supabase, save offline
        const isOnline = navigator.onLine;
        if (!isOnline) {
          saveLogOffline(logData);
          offlineCount++;
        }
      }
    }

    // Show consolidated success message
    if (savedCount > 0) {
      toast({
        title: "Mergulho Registrado",
        description: `${savedCount} mergulhador(es) salvo(s) com sucesso no banco de dados`,
      });
    }

    if (offlineCount > 0) {
      toast({
        title: "Salvo Offline",
        description: `${offlineCount} mergulhador(es) salvo(s) offline. Será sincronizado quando voltar online.`,
      });
    }

    // Maintain localStorage compatibility for local records - one record per team dive
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
      
      // Calculate duration from start and end time difference
      const [startHour, startMin, startSec] = record.startTime.split(':').map(Number);
      const [endHour, endMin, endSec] = record.endTime.split(':').map(Number);
      
      const startTotalSeconds = startHour * 3600 + startMin * 60 + startSec;
      const endTotalSeconds = endHour * 3600 + endMin * 60 + endSec;
      let durationSeconds = endTotalSeconds - startTotalSeconds;
      
      // Handle overnight dives (if end time is next day)
      if (durationSeconds < 0) {
        durationSeconds += 24 * 3600; // Add 24 hours
      }
      
      const formattedDuration = formatDuration(durationSeconds);
      
      divers.forEach(diver => {
        csvRows.push([record.teamName, diver, record.activityType, record.date, record.startTime, record.endTime, formattedDuration].join(','));
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
            {/* User Info */}
            <div className="flex items-center gap-4 order-1 md:order-0">
              <div className="flex items-center gap-2 text-military-gold">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {user?.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-military-gold/80 hover:text-military-gold hover:bg-military-gold/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                SAIR
              </Button>
            </div>

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
            
            <div className="flex gap-2 order-3 md:order-2">
              <DiveHistoryModal
                trigger={
                  <Button
                    variant="outline"
                    size="xl"
                    className="min-w-[150px] border-military-gold/50 text-military-gold hover:bg-military-gold/10"
                  >
                    <History className="w-5 h-5" />
                    HISTÓRICO
                  </Button>
                }
              />
              <Button
                variant="tactical"
                size="xl"
                onClick={exportToCSV}
                className="min-w-[150px] hidden md:flex"
              >
                <Save className="w-5 h-5" />
                SALVAR MG
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with top padding for fixed header */}
      <div className="pt-40 md:pt-24 p-4">
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
            
            {/* Add Team Button - Always visible */}
            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                size="xl"
                onClick={addTeam}
                className="h-32 w-full border-dashed border-2 border-military-gold/50 hover:border-military-gold text-military-gold hover:bg-military-gold/10"
              >
                <Plus className="w-8 h-8 mr-2" />
                ADICIONAR CARD
              </Button>
            </div>
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