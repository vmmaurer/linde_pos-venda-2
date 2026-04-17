"use client"

import * as React from "react"
import { format } from "date-fns"
import { 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  MoreHorizontal, 
  Search,
  Truck,
  User,
  ExternalLink,
  Trash2
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type ReturnRecord = {
  id: string
  rc: string
  cliente: string
  codigo_cliente: string
  romaneio_1: string
  romaneio_2: string | null
  romaneio_3: string | null
  dia_1: string
  dia_2: string | null
  dia_3: string | null
  usuario: string
  status: 'pending' | 'billing' | 'delivered'
  updated_at: string
}

interface ReturnListProps {
  statusFilter?: 'pending' | 'billing' | 'delivered' | 'all'
  refreshTrigger?: number
}

export function ReturnList({ statusFilter = 'all', refreshTrigger }: ReturnListProps) {
  const [records, setRecords] = React.useState<ReturnRecord[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)
  const [selectedRecordId, setSelectedRecordId] = React.useState<string | null>(null)

  const fetchRecords = React.useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from("returns").select("*")
      
      if (statusFilter !== 'all') {
        query = query.eq("status", statusFilter)
      }

      const { data, error } = await query.order("updated_at", { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error: any) {
      toast.error("Erro ao carregar registros: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  React.useEffect(() => {
    fetchRecords()
  }, [fetchRecords, refreshTrigger])

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from("returns")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast.success("Registro excluído com sucesso!")
      setIsDeleteConfirmOpen(false)
      fetchRecords()
    } catch (error: any) {
      toast.error("Erro ao excluir registro: " + error.message)
    }
  }

  const markAsDelivered = async (id: string) => {
    try {
      const { error } = await supabase
        .from("returns")
        .update({ status: 'delivered', updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      toast.success("Registro marcado como entregue!")
      setIsConfirmOpen(false)
      fetchRecords()
    } catch (error: any) {
      toast.error("Erro ao atualizar status: " + error.message)
    }
  }

  const filteredRecords = records.filter(record => 
    record.rc.toLowerCase().includes(search.toLowerCase()) ||
    record.cliente.toLowerCase().includes(search.toLowerCase()) ||
    record.codigo_cliente.toLowerCase().includes(search.toLowerCase())
  )

    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'pending':
          return <Badge variant="secondary" className="bg-amber-100/50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200/50 dark:border-amber-800"><Clock className="mr-1 h-3 w-3" /> Pendente</Badge>
        case 'billing':
            return <Badge variant="secondary" className="bg-sky-100/50 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 border-sky-200/50 dark:border-sky-800"><CreditCard className="mr-1 h-3 w-3" /> Faturamento</Badge>
        case 'delivered':
          return <Badge variant="secondary" className="bg-emerald-100/50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800"><CheckCircle2 className="mr-1 h-3 w-3" /> Entregue</Badge>
        default:
          return <Badge>{status}</Badge>
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por RC, Cliente ou Código..."
                className="pl-10 focus-visible:ring-sky-400 dark:bg-zinc-950 dark:border-white/10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
        </div>

        <div className="rounded-xl border dark:border-white/10 overflow-hidden shadow-sm bg-background dark:bg-zinc-950/50 backdrop-blur-sm">
          <Table>
            <TableHeader className="border-b dark:border-white/10">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-black text-[10px] uppercase tracking-wider text-muted-foreground/70 py-3">RC</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-wider text-muted-foreground/70">Cliente / Código</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-wider text-muted-foreground/70">Romaneios (1/2/3)</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-wider text-muted-foreground/70">Datas (1/2/3)</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-wider text-muted-foreground/70">Status</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-wider text-muted-foreground/70">Última At.</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-wider text-muted-foreground/70 pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Clock className="h-8 w-8 animate-spin text-sky-400" />
                      <span className="font-medium text-muted-foreground">Carregando registros...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell className="font-bold text-sky-400">{record.rc}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{record.cliente}</span>
                        <span className="text-xs text-muted-foreground font-mono">{record.codigo_cliente}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-[10px]">
                        <span className="bg-muted/50 px-1.5 py-0.5 rounded border border-border truncate max-w-[120px]" title={`Romaneio 1: ${record.romaneio_1}`}>
                          {record.romaneio_1}
                        </span>
                        {record.romaneio_2 && (
                          <span className="bg-muted/30 px-1.5 py-0.5 rounded border border-border/50 truncate max-w-[120px]" title={`Romaneio 2: ${record.romaneio_2}`}>
                            {record.romaneio_2}
                          </span>
                        )}
                        {record.romaneio_3 && (
                          <span className="bg-sky-50/50 dark:bg-sky-900/20 px-1.5 py-0.5 rounded border border-sky-100/50 dark:border-sky-800 truncate max-w-[120px]" title={`Romaneio 3: ${record.romaneio_3}`}>
                            {record.romaneio_3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-[11px] font-medium">
                        <span className="text-muted-foreground">{format(new Date(record.dia_1), "dd/MM/yy")}</span>
                        {record.dia_2 && <span className="text-muted-foreground/80">{format(new Date(record.dia_2), "dd/MM/yy")}</span>}
                        {record.dia_3 && <span className="text-sky-400">{format(new Date(record.dia_3), "dd/MM/yy")}</span>}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-[11px] text-muted-foreground whitespace-nowrap">
                        <span>{format(new Date(record.updated_at), "dd/MM/yy HH:mm")}</span>
                        <div className="flex items-center gap-1 text-foreground/70 font-semibold uppercase">
                          <User className="h-3 w-3 text-sky-400" />
                          <span>{record.usuario}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-muted text-muted-foreground">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Ações do Registro</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {record.status !== 'delivered' && (
                            <DropdownMenuItem className="text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 cursor-pointer" onClick={() => {
                              setSelectedRecordId(record.id)
                              setIsConfirmOpen(true)
                            }}>
                              <Truck className="mr-2 h-4 w-4" />
                              Marcar como Entregue
                            </DropdownMenuItem>
                          )}
                            <DropdownMenuItem className="cursor-pointer text-sky-400" onClick={() => {
                              toast.info("Para editar, use a seção de Cadastro com a RC correspondente.")
                            }}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Ver / Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600 dark:text-red-400 focus:text-red-600 cursor-pointer" 
                              onClick={() => {
                                setSelectedRecordId(record.id)
                                setIsDeleteConfirmOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir Registro
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent className="border-t-4 border-t-red-500">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                <Trash2 className="h-5 w-5" /> Excluir Registro
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação <span className="font-bold text-red-600">NÃO PODE SER DESFEITA</span>. 
                Isso excluirá permanentemente o registro de RC do banco de dados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-200">Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => selectedRecordId && deleteRecord(selectedRecordId)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Excluir Permanentemente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="border-t-4 border-t-emerald-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Truck className="h-5 w-5" /> Confirmar Entrega
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja marcar este registro como <span className="font-bold text-emerald-600">ENTREGUE</span>? 
              Esta ação concluirá o processo e moverá o registro para a lista de Devolvidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedRecordId && markAsDelivered(selectedRecordId)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirmar Entrega
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
