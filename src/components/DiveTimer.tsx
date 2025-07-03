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
  diver: string;
}

export default function DiveTimer({ teamId, initialTime, onDiveComplete }: DiveTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [diver, setDiver] = useState("Mergulhador A");
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
      const duration = initialTime - timeLeft;
      
      onDiveComplete({
        teamName: teamId,
        startTime,
        endTime,
        duration,
        diver
      });

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
    setStartTime(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
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
  }, [isRunning, timeLeft]);

  // Calculate progress for circular timer
  const progress = ((initialTime - timeLeft) / initialTime) * 100;
  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card className="p-6 bg-gradient-command border-military-gold/30 shadow-command">
      <div className="text-center space-y-4">
        {/* Team ID */}
        <div className="text-xl font-bold text-military-gold tracking-wider">
          {teamId}
        </div>

        {/* Diver Input */}
        <input
          type="text"
          value={diver}
          onChange={(e) => setDiver(e.target.value)}
          className="w-full px-3 py-2 bg-muted border border-border rounded text-center text-foreground"
          placeholder="Nome do Mergulhador"
        />

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
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-muted-foreground">
                {isRunning ? 'MERGULHANDO' : timeLeft === 0 ? 'TEMPO ESGOTADO' : 'PRONTO'}
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
            disabled={isRunning || timeLeft === 0}
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