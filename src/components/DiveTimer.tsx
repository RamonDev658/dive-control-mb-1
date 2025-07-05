import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Square, RotateCcw, Plus, Minus } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface DiveTimerProps {
  teamId: string;
  initialTime: number; // in seconds
  onDiveComplete: (data: DiveData) => void;
}

interface DiveTimerRef {
  resetAllData: () => void;
}

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

const DiveTimer = forwardRef<DiveTimerRef, DiveTimerProps>(({ teamId, initialTime, onDiveComplete }, ref) => {
  // Use localStorage to persist timer state
  const [timerState, setTimerState] = useLocalStorage(`timer-${teamId}`, {
    elapsedTime: 0,
    isRunning: false,
    startTime: null as string | null,
    diverA: "Mergulhador A",
    diverB: "Mergulhador B",
    diverC: "",
    showThirdDiver: false,
    activityType: "Patrulhamento"
  });

  // Local state for the timer
  const [elapsedTime, setElapsedTime] = useState(timerState.elapsedTime);
  const [isRunning, setIsRunning] = useState(timerState.isRunning);
  const [startTime, setStartTime] = useState<Date | null>(
    timerState.startTime ? new Date(timerState.startTime) : null
  );
  const [diverA, setDiverA] = useState(timerState.diverA);
  const [diverB, setDiverB] = useState(timerState.diverB);
  const [diverC, setDiverC] = useState(timerState.diverC);
  const [showThirdDiver, setShowThirdDiver] = useState(timerState.showThirdDiver);
  const [activityType, setActivityType] = useState(timerState.activityType);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetAllData = () => {
    const defaultState = {
      elapsedTime: 0,
      isRunning: false,
      startTime: null as string | null,
      diverA: "Mergulhador A",
      diverB: "Mergulhador B",
      diverC: "",
      showThirdDiver: false,
      activityType: "Patrulhamento"
    };
    
    setTimerState(defaultState);
    setIsRunning(false);
    setElapsedTime(0);
    setStartTime(null);
    setDiverA("Mergulhador A");
    setDiverB("Mergulhador B");
    setDiverC("");
    setShowThirdDiver(false);
    setActivityType("Patrulhamento");
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useImperativeHandle(ref, () => ({
    resetAllData
  }));

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!isRunning) {
      const now = new Date();
      setIsRunning(true);
      setStartTime(now);
      setTimerState(prev => ({
        ...prev,
        isRunning: true,
        startTime: now.toISOString()
      }));
    }
  };

  const stopTimer = () => {
    if (isRunning && startTime) {
      setIsRunning(false);
      const endTime = new Date();
      
      // Clear localStorage after completing dive
      setTimerState({
        elapsedTime: 0,
        isRunning: false,
        startTime: null,
        diverA: "Mergulhador A",
        diverB: "Mergulhador B",
        diverC: "",
        showThirdDiver: false,
        activityType: "Patrulhamento"
      });
      
      onDiveComplete({
        teamName: teamId,
        startTime,
        endTime,
        duration: elapsedTime,
        diverA,
        diverB,
        diverC,
        activityType
      });

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setStartTime(null);
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      elapsedTime: 0,
      startTime: null
    }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newElapsed = prev + 1;
          // Update localStorage with new elapsed time
          setTimerState(currentState => ({
            ...currentState,
            elapsedTime: newElapsed
          }));
          return newElapsed;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, setTimerState]);

  // Initialize and restore timer state on component mount
  useEffect(() => {
    if (timerState.startTime && timerState.isRunning) {
      const now = new Date();
      const start = new Date(timerState.startTime);
      const elapsedSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
      
      // Set all local states correctly
      setElapsedTime(elapsedSeconds);
      setIsRunning(true);
      setStartTime(start);
      
      setTimerState(prev => ({
        ...prev,
        elapsedTime: elapsedSeconds
      }));
    }
  }, []); // Only run on mount

  // Handle visibility change to recalculate elapsed time when app comes back
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isRunning && startTime) {
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsedSeconds);
        setTimerState(prev => ({
          ...prev,
          elapsedTime: elapsedSeconds
        }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, startTime, setTimerState]);

  // Update localStorage when diver data changes
  useEffect(() => {
    setTimerState(prev => ({
      ...prev,
      diverA,
      diverB,
      diverC,
      showThirdDiver,
      activityType
    }));
  }, [diverA, diverB, diverC, showThirdDiver, activityType, setTimerState]);

  // Calculate progress for circular timer (progressive)
  const maxDisplayTime = 3600; // 1 hour max display
  const progress = Math.min((elapsedTime / maxDisplayTime) * 100, 100);
  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card className="p-6 bg-gradient-command border-military-gold/30 shadow-command">
      <div className="text-center space-y-4">
        {/* Team ID */}
        <div className="text-xl font-bold text-military-gold tracking-wider">
          {teamId}
        </div>

        {/* Diver Inputs */}
        <div className="space-y-2">
          <input
            type="text"
            value={diverA}
            onChange={(e) => setDiverA(e.target.value)}
            onFocus={(e) => {
              if (e.target.value === "Mergulhador A") {
                setDiverA("");
              }
            }}
            className="w-full px-3 py-2 bg-muted border border-border rounded text-center text-foreground text-sm"
            placeholder="Mergulhador A"
          />
          <input
            type="text"
            value={diverB}
            onChange={(e) => setDiverB(e.target.value)}
            onFocus={(e) => {
              if (e.target.value === "Mergulhador B") {
                setDiverB("");
              }
            }}
            className="w-full px-3 py-2 bg-muted border border-border rounded text-center text-foreground text-sm"
            placeholder="Mergulhador B"
          />
          
          {/* Third diver input or add button */}
          {showThirdDiver ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={diverC}
                onChange={(e) => setDiverC(e.target.value)}
                onFocus={(e) => {
                  if (e.target.value === "") {
                    // DiverC starts empty, so no need to clear
                  }
                }}
                className="flex-1 px-3 py-2 bg-muted border border-border rounded text-center text-foreground text-sm"
                placeholder="Mergulhador C"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowThirdDiver(false);
                  setDiverC("");
                }}
                className="h-10 w-10 p-0"
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowThirdDiver(true)}
              className="w-full py-2 text-sm"
              disabled={isRunning}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Mergulhador
            </Button>
          )}
          
          <input
            type="text"
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            onFocus={(e) => {
              if (e.target.value === "Patrulhamento") {
                setActivityType("");
              }
            }}
            className="w-full px-3 py-2 bg-muted border border-border rounded text-center text-foreground text-sm"
            placeholder="Tipo de Atividade"
          />
        </div>

        {/* Circular Timer */}
        <div className="relative w-48 h-48 mx-auto">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="hsl(var(--border))"
              strokeWidth="4"
              fill="transparent"
              className="opacity-30"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="hsl(var(--military-gold))"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
              style={{
                filter: isRunning ? 'drop-shadow(0 0 8px hsl(var(--military-gold)))' : 'none'
              }}
            />
          </svg>
          
          {/* Time display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-mono font-bold text-foreground ${isRunning ? 'animate-tactical-pulse' : ''}`}>
                {formatTime(elapsedTime)}
              </div>
              <div className="text-sm text-muted-foreground">
                {isRunning ? 'MERGULHANDO' : 'PRONTO'}
              </div>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="dynamicAction"
            size="lg"
            onClick={isRunning ? stopTimer : startTimer}
            className={`min-w-[150px] ${
              isRunning 
                ? 'bg-military-stop text-foreground hover:bg-military-stop/90' 
                : 'bg-military-start text-black hover:bg-military-start/90'
            }`}
          >
            {isRunning ? (
              <>
                <Square className="w-5 h-5" />
                PARAR
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                INICIAR
              </>
            )}
          </Button>

          <Button
            variant="command"
            size="lg"
            onClick={resetTimer}
            disabled={isRunning}
            className="min-w-[100px]"
          >
            <RotateCcw className="w-5 h-5" />
            RESET
          </Button>
        </div>

        {/* Status */}
        <div className="text-sm text-center">
          {startTime && (
            <div className="text-muted-foreground">
              Início: {startTime.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});

DiveTimer.displayName = "DiveTimer";

export default DiveTimer;