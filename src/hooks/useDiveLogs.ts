import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface DiveLogData {
  equipe: string;
  nome_guerra: string;
  nome_guerra_2: string;
  nome_guerra_3: string;
  atividade: string;
  horario_inicio: string;
  horario_fim: string;
  duracao_em_seg: number;
  data: string;
}

export interface DiveLogRecord {
  id: string;
  equipe: string;
  nome_guerra: string;
  nome_guerra_2: string;
  nome_guerra_3: string;
  atividade: string;
  horario_inicio: string;
  horario_fim: string;
  duracao_em_seg: number;
  data: string;
  created_at: string;
}

export const useDiveLogs = () => {
  const [logs, setLogs] = useState<DiveLogRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch logs from Supabase
  const fetchLogs = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mergulho_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching logs:', error);
        // Only show error toast if user is online
        if (navigator.onLine) {
          toast({
            title: "Erro de Conexão",
            description: "Não foi possível carregar os registros. Verifique sua conexão.",
            variant: "destructive",
          });
        }
      } else {
        setLogs(data || []);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      // Handle network errors more gracefully
      if (navigator.onLine) {
        toast({
          title: "Erro de Rede",
          description: "Falha na conexão com o servidor. Tente novamente.",
          variant: "destructive",
        });
      }
    }
    setLoading(false);
  };

  // Save log to Supabase
  const saveDiveLog = async (logData: DiveLogData): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('mergulho_logs')
        .insert({
          user_id: user.id,
          ...logData
        });

      if (error) {
        console.error('Error saving log:', error);
        // Only show toast for first save attempt
        if (navigator.onLine) {
          toast({
            title: "Erro ao Salvar",
            description: "Não foi possível salvar no servidor. Tentando salvar offline...",
            variant: "destructive",
          });
        }
        return false;
      }

      // Refresh logs after saving (but don't wait for it)
      fetchLogs().catch(err => console.error('Error refreshing logs:', err));
      
      // Only show success toast once per dive completion
      return true;
    } catch (error) {
      console.error('Error saving log:', error);
      return false;
    }
  };

  // Save log to localStorage for offline support
  const saveLogOffline = (logData: DiveLogData) => {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('offline_dive_logs') || '[]');
      const newLog = {
        ...logData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        user_id: user?.id || 'offline'
      };
      
      existingLogs.push(newLog);
      localStorage.setItem('offline_dive_logs', JSON.stringify(existingLogs));
      
      toast({
        title: "Salvo Offline",
        description: "Registro salvo localmente. Será sincronizado quando voltar online.",
      });
      
      return true;
    } catch (error) {
      console.error('Error saving offline log:', error);
      return false;
    }
  };

  // Sync offline logs when online
  const syncOfflineLogs = async () => {
    if (!user) return;
    
    try {
      const offlineLogs = JSON.parse(localStorage.getItem('offline_dive_logs') || '[]');
      
      if (offlineLogs.length === 0) return;
      
      for (const log of offlineLogs) {
        await supabase
          .from('mergulho_logs')
          .insert({
            user_id: user.id,
            equipe: log.equipe,
            nome_guerra: log.nome_guerra,
            nome_guerra_2: log.nome_guerra_2 || '',
            nome_guerra_3: log.nome_guerra_3 || '',
            atividade: log.atividade,
            horario_inicio: log.horario_inicio,
            horario_fim: log.horario_fim,
            duracao_em_seg: log.duracao_em_seg,
            data: log.data
          });
      }
      
      // Clear offline logs after sync
      localStorage.removeItem('offline_dive_logs');
      
      toast({
        title: "Sincronização Concluída",
        description: `${offlineLogs.length} registros offline foram sincronizados`,
      });
      
      // Refresh logs
      await fetchLogs();
    } catch (error) {
      console.error('Error syncing offline logs:', error);
    }
  };

  // Delete log
  const deleteLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mergulho_logs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting log:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o registro",
          variant: "destructive",
        });
        return false;
      }

      await fetchLogs();
      toast({
        title: "Registro Excluído",
        description: "Registro removido com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting log:', error);
      return false;
    }
  };

  // Load logs on mount and user change
  useEffect(() => {
    if (user) {
      fetchLogs();
      syncOfflineLogs(); // Sync any offline logs when user logs in
    }
  }, [user]);

  return {
    logs,
    loading,
    saveDiveLog,
    saveLogOffline,
    syncOfflineLogs,
    deleteLog,
    fetchLogs
  };
};