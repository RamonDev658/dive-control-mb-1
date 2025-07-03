import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Download, Trash2 } from "lucide-react";

interface DiveRecord {
  id: string;
  teamName: string;
  diver: string;
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-military-gold">
            CONTROLE DE MERGULHOS
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="tactical"
              size="sm"
              onClick={onExportCSV}
              className="text-sm"
            >
              <Download className="w-4 h-4" />
              SALVAR MG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearRecords}
              className="text-sm"
            >
              <Trash2 className="w-4 h-4" />
              LIMPAR
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border border-military-gold/20 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-military-blue/20 hover:bg-military-blue/30">
                <TableHead className="text-military-gold font-semibold">Equipe</TableHead>
                <TableHead className="text-military-gold font-semibold">Mergulhador(es)</TableHead>
                <TableHead className="text-military-gold font-semibold">Data</TableHead>
                <TableHead className="text-military-gold font-semibold">Início</TableHead>
                <TableHead className="text-military-gold font-semibold">Término</TableHead>
                <TableHead className="text-military-gold font-semibold">Duração</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
                    <TableCell className="text-foreground">{record.diver}</TableCell>
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