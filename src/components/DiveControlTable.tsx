import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Download, Trash2, History } from "lucide-react";
import DiveHistoryModal from "./DivHistoryModal";

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

interface DiveControlTableProps {
  records: DiveRecord[];
  onExportCSV: () => void;
  onClearRecords: () => void;
}

export default function DiveControlTable({ records, onExportCSV, onClearRecords }: DiveControlTableProps) {
  return (
    <Card className="bg-gradient-command border-military-gold/30 shadow-command">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between md:flex-row flex-col gap-4">
          <CardTitle className="text-xl font-bold text-military-gold text-center md:text-left order-1">
            CONTROLE DE MERGULHOS
          </CardTitle>
          {/* Desktop buttons */}
          <div className="hidden md:flex gap-2 order-2 md:order-2">
            <DiveHistoryModal
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm border-military-gold/50 text-military-gold hover:bg-military-gold/10"
                >
                  <History className="w-4 h-4" />
                  HISTÓRICO
                </Button>
              }
            />
            <Button
              variant="tactical"
              size="sm"
              onClick={onExportCSV}
              className="text-sm"
            >
              <Download className="w-4 h-4" />
              SALVAR MG
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  LIMPAR
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-military-gold/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-military-gold">Confirmar Limpeza</AlertDialogTitle>
                  <AlertDialogDescription className="text-foreground">
                    Esta ação irá limpar todos os registros de mergulho e resetar todos os dados dos mergulhadores. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-muted text-foreground hover:bg-muted/80">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={onClearRecords}
                    className="bg-military-stop text-foreground hover:bg-military-stop/90"
                  >
                    Confirmar Limpeza
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Mobile buttons - only HISTÓRICO and SALVAR MG */}
          <div className="flex md:hidden gap-2 order-2">
            <DiveHistoryModal
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm border-military-gold/50 text-military-gold hover:bg-military-gold/10"
                >
                  <History className="w-4 h-4" />
                  HISTÓRICO
                </Button>
              }
            />
            <Button
              variant="tactical"
              size="sm"
              onClick={onExportCSV}
              className="text-sm"
            >
              <Download className="w-4 h-4" />
              SALVAR MG
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border border-military-gold/20 overflow-hidden">
          {/* Mobile View */}
          <div className="block md:hidden">
            {records.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 px-4">
                Nenhum registro de mergulho encontrado
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {records.map((record) => (
                  <div key={record.id} className="bg-muted/20 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-military-gold">{record.teamName}</div>
                      <div className="text-sm text-muted-foreground">{record.date}</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-foreground mb-1">
                        <span className="text-muted-foreground">Mergulhadores:</span> {[record.diverA, record.diverB, record.diverC].filter(diver => diver && diver.trim()).join(' / ')}
                      </div>
                      <div className="text-foreground mb-1">
                        <span className="text-muted-foreground">Atividade:</span> {record.activityType}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Início:</span>
                        <span className="text-foreground">{record.startTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Término:</span>
                        <span className="text-foreground">{record.endTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duração:</span>
                        <span className="text-foreground font-mono">{record.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Mobile LIMPAR button - positioned at bottom of records */}
            <div className="flex justify-center pt-4 border-t border-military-gold/20 mt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm w-full max-w-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    LIMPAR
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-military-gold/30">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-military-gold">Confirmar Limpeza</AlertDialogTitle>
                    <AlertDialogDescription className="text-foreground">
                      Esta ação irá limpar todos os registros de mergulho e resetar todos os dados dos mergulhadores. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-muted text-foreground hover:bg-muted/80">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={onClearRecords}
                      className="bg-military-stop text-foreground hover:bg-military-stop/90"
                    >
                      Confirmar Limpeza
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Desktop Table View */}
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow className="bg-military-blue/20 hover:bg-military-blue/30">
                <TableHead className="text-military-gold font-semibold">Equipe</TableHead>
                <TableHead className="text-military-gold font-semibold">Mergulhadores</TableHead>
                <TableHead className="text-military-gold font-semibold">Atividade</TableHead>
                <TableHead className="text-military-gold font-semibold">Data</TableHead>
                <TableHead className="text-military-gold font-semibold">Início</TableHead>
                <TableHead className="text-military-gold font-semibold">Término</TableHead>
                <TableHead className="text-military-gold font-semibold">Duração</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum registro de mergulho encontrado
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow 
                    key={record.id} 
                    className="hover:bg-muted/30 border-border/50"
                  >
                    <TableCell className="font-medium text-foreground">{record.teamName}</TableCell>
                    <TableCell className="text-foreground">
                      {[record.diverA, record.diverB, record.diverC].filter(diver => diver && diver.trim()).join(' / ')}
                    </TableCell>
                    <TableCell className="text-foreground">{record.activityType}</TableCell>
                    <TableCell className="text-foreground">{record.date}</TableCell>
                    <TableCell className="text-foreground">{record.startTime}</TableCell>
                    <TableCell className="text-foreground">{record.endTime}</TableCell>
                    <TableCell className="text-foreground font-mono">{record.duration}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {records.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Total de mergulhos registrados: {records.length}
          </div>
        )}
      </CardContent>
    </Card>
  );
}