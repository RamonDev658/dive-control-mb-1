import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DiveLogRecord } from "@/hooks/useDiveLogs";

interface DiveLogDeleteButtonProps {
  log: DiveLogRecord;
  onDelete: (id: string) => void;
}

export default function DiveLogDeleteButton({ log, onDelete }: DiveLogDeleteButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-card border-military-gold/30">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-military-gold">
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className="text-foreground">
            Tem certeza que deseja excluir este registro de mergulho? Esta ação não pode ser desfeita.
            <br />
            <strong>Equipe:</strong> {log.equipe} - <strong>Mergulhador:</strong> {log.nome_guerra}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-muted text-foreground hover:bg-muted/80">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onDelete(log.id)}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}