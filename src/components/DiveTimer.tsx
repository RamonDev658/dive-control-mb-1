import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Square, RotateCcw } from "lucide-react";

interface DiveTimerProps {
  teamId: string;
  initialTime: number; // in seconds
  onDiveComplete: (data: DiveData) => void;
}

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

export default function DiveTimer({ teamId, initialTime, onDiveComplete }: DiveTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [diverA, setDiverA] = useState("Mergulhador A");
  const [diverB, setDiverB] = useState("Mergulhador B");
  const [diverC, setDiverC] = useState("Mergulhador C");
  const [activityType, setActivityType] = useState("Patrulhamento");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      setStartTime(new Date());
    }
  };

  const stopTimer = () => {
    if (isRunning && startTime) {
      setIsRunning(false);
      const endTime = new Date();
      
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
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
  }, [isRunning]);

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
            className="w-full px-3 py-2 bg-muted border border-border rounded text-center text-foreground text-sm"
            placeholder="Mergulhador A"
          />
          <input
            type="text"
            value={diverB}
            onChange={(e) => setDiverB(e.target.value)}
            className="w-full px-3 py-2 bg-muted border border-border rounded text-center text-foreground text-sm"
            placeholder="Mergulhador B"
          />
          <input
            type="text"
            value={diverC}
            onChange={(e) => setDiverC(e.target.value)}
            className="w-full px-3 py-2 bg-muted border border-border rounded text-center text-foreground text-sm"
            placeholder="Mergulhador C"
          />
          <input
            type="text"
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
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
            variant="militaryStart"
            size="lg"
            onClick={startTimer}
            disabled={isRunning}
            className="min-w-[100px]"
          >
            <Play className="w-5 h-5" />
            INICIAR
          </Button>

          <Button
            variant="militaryStop"
            size="lg"
            onClick={stopTimer}
            disabled={!isRunning}
            className="min-w-[100px]"
          >
            <Square className="w-5 h-5" />
            PARAR
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
}