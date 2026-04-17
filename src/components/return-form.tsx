"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Search, Trash2, ClipboardList, User, Hash, FileText, Calendar as CalendarLucide, X } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { Calendar } from "@/components/ui/calendar"
import { supabase } from "@/lib/supabase"

const parseBrazilianDate = (str: string) => {
  const digits = str.replace(/\D/g, "")
  if (digits.length !== 8) return null
  
  const day = parseInt(digits.substring(0, 2), 10)
  const month = parseInt(digits.substring(2, 4), 10) - 1
  const year = parseInt(digits.substring(4, 8), 10)
  
  const date = new Date(year, month, day)
  if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
    return date
  }
  return null
}

const formatBrazilianDate = (date: Date | null | undefined) => {
  if (!date) return ""
  return format(date, "dd/MM/yyyy")
}

const SmartDateInput = ({ 
  value, 
  onChange, 
  placeholder = "dd/mm/aaaa", 
  className,
  optional = false
}: { 
  value: Date | null | undefined, 
  onChange: (date: Date | null) => void,
  placeholder?: string,
  className?: string,
  optional?: boolean
}) => {
  const [inputValue, setInputValue] = React.useState(formatBrazilianDate(value))

  React.useEffect(() => {
    setInputValue(formatBrazilianDate(value))
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "")
    if (val.length > 8) val = val.slice(0, 8)
    
    let formatted = val
    if (val.length > 2) formatted = val.slice(0, 2) + "/" + val.slice(2)
    if (val.length > 4) formatted = formatted.slice(0, 5) + "/" + formatted.slice(5)
    
    setInputValue(formatted)
    
    if (val.length === 8) {
      const parsed = parseBrazilianDate(formatted)
      if (parsed) {
        onChange(parsed)
      }
    } else if (val.length === 0 && optional) {
      onChange(null)
    }
  }

  return (
    <div className="relative group">
      <Popover>
        <div className="flex items-center">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={cn("pr-12", className)}
          />
          <div className="absolute right-0 flex items-center pr-2 gap-1">
            {optional && value && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-muted"
                onClick={() => {
                  onChange(null)
                  setInputValue("")
                }}
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            )}
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md hover:bg-muted"
              >
                <CalendarLucide className="h-4 w-4 text-sky-500 opacity-70 group-hover:opacity-100 transition-opacity" />
              </Button>
            </PopoverTrigger>
          </div>
        </div>
        <PopoverContent className="w-auto p-0 rounded-xl overflow-hidden shadow-2xl border-none" align="start">
          <Calendar
            mode="single"
            selected={value || undefined}
            onSelect={(date) => {
              onChange(date || null)
              if (date) setInputValue(formatBrazilianDate(date))
            }}
            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

const formSchema = z.object({
  rc: z.string().min(1, "RC é obrigatório"),
  cliente: z.string().min(1, "Cliente é obrigatório"),
  codigo_cliente: z.string().min(1, "Código do Cliente é obrigatório"),
  romaneio_1: z.string().min(1, "Romaneio 1 é obrigatório"),
  romaneio_2: z.string().optional().nullable(),
  romaneio_3: z.string().optional().nullable(),
  dia_1: z.date({
    required_error: "Dia 1 é obrigatório",
  }),
  dia_2: z.date().optional().nullable(),
  dia_3: z.date().optional().nullable(),
}).refine((data) => {
  if (data.romaneio_2 && !data.dia_2) return false;
  return true;
}, {
  message: "Data do Dia 2 é obrigatória se houver romaneio",
  path: ["dia_2"],
}).refine((data) => {
  if (data.romaneio_3 && !data.dia_3) return false;
  return true;
}, {
  message: "Data do Dia 3 é obrigatória se houver romaneio",
  path: ["dia_3"],
})

export function ReturnForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSearching, setIsSearching] = React.useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)
  const [existingRecord, setExistingRecord] = React.useState<any>(null)
  const user = "sistema"

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rc: "",
      cliente: "",
      codigo_cliente: "",
      romaneio_1: "",
      romaneio_2: "",
      romaneio_3: "",
      dia_1: new Date(),
      dia_2: null,
      dia_3: null,
    },
  })

  const deleteRecord = async () => {
    if (!existingRecord) return
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("returns")
        .delete()
        .eq("id", existingRecord.id)

      if (error) throw error

      toast.success("Registro excluído com sucesso!")
      form.reset({
        rc: "",
        cliente: "",
        codigo_cliente: "",
        romaneio_1: "",
        romaneio_2: "",
        romaneio_3: "",
        dia_1: new Date(),
        dia_2: null,
        dia_3: null,
      })
      setExistingRecord(null)
      setIsDeleteConfirmOpen(false)
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error("Erro ao excluir registro: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const checkRC = async (rc: string) => {
    if (!rc) return
    setIsSearching(true)
    try {
      const { data, error } = await supabase
        .from("returns")
        .select("*")
        .eq("rc", rc)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setExistingRecord(data)
        form.reset({
          rc: data.rc,
          cliente: data.cliente,
          codigo_cliente: data.codigo_cliente,
          romaneio_1: data.romaneio_1 || "",
          romaneio_2: data.romaneio_2 || "",
          romaneio_3: data.romaneio_3 || "",
          dia_1: new Date(data.dia_1),
          dia_2: data.dia_2 ? new Date(data.dia_2) : null,
          dia_3: data.dia_3 ? new Date(data.dia_3) : null,
        })
        toast.info("Registro existente encontrado. Carregando dados para edição.")
      } else {
        if (existingRecord) {
          form.reset({
            rc: rc,
            cliente: "",
            codigo_cliente: "",
            romaneio_1: "",
            romaneio_2: "",
            romaneio_3: "",
            dia_1: new Date(),
            dia_2: null,
            dia_3: null,
          })
          setExistingRecord(null)
        }
      }
    } catch (error: any) {
      toast.error("Erro ao verificar RC: " + error.message)
    } finally {
      setIsSearching(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const status = values.dia_3 ? "billing" : "pending"
      
      const payload = {
        rc: values.rc,
        cliente: values.cliente,
        codigo_cliente: values.codigo_cliente,
        romaneio_1: values.romaneio_1,
        romaneio_2: values.romaneio_2 || null,
        romaneio_3: values.romaneio_3 || null,
        dia_1: format(values.dia_1, "yyyy-MM-dd"),
        dia_2: values.dia_2 ? format(values.dia_2, "yyyy-MM-dd") : null,
        dia_3: values.dia_3 ? format(values.dia_3, "yyyy-MM-dd") : null,
        usuario: user,
        status: status,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("returns")
        .upsert(payload, { onConflict: "rc" })

      if (error) throw error

      toast.success(existingRecord ? "Registro atualizado com sucesso!" : "Registro criado com sucesso!")
      form.reset({
        rc: "",
        cliente: "",
        codigo_cliente: "",
        romaneio_1: "",
        romaneio_2: "",
        romaneio_3: "",
        dia_1: new Date(),
        dia_2: null,
        dia_3: null,
      })
      setExistingRecord(null)
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error("Erro ao salvar registro: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Row 1: Primary Info */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-end">
          <FormField
            control={form.control}
            name="rc"
            render={({ field }) => (
              <FormItem className="lg:col-span-1">
                <FormLabel className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5 mb-1">
                  <Hash className="h-3 w-3 text-sky-500" />
                  Número da RC
                </FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input 
                      placeholder="RC..." 
                      className="focus-visible:ring-sky-500 text-sm font-black h-9 rounded-lg bg-background dark:bg-zinc-950 shadow-sm border-sky-100 dark:border-white/20"
                      {...field} 
                      onBlur={() => checkRC(field.value)} 
                    />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-9 w-9 rounded-lg text-sky-500 hover:bg-sky-50 dark:border-white/20 dark:hover:bg-zinc-800 shadow-sm shrink-0"
                    size="icon" 
                    onClick={() => checkRC(field.value)}
                    disabled={isSearching}
                  >
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cliente"
            render={({ field }) => (
              <FormItem className="lg:col-span-2">
                <FormLabel className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5 mb-1">
                  <User className="h-3 w-3 text-sky-500" />
                  Nome do Cliente
                </FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome completo" className="focus-visible:ring-sky-500 h-9 rounded-lg bg-background dark:bg-zinc-950 shadow-sm border-sky-100 dark:border-white/20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="codigo_cliente"
            render={({ field }) => (
              <FormItem className="lg:col-span-1">
                <FormLabel className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5 mb-1">
                  <Hash className="h-3 w-3 text-sky-500" />
                  Cód. Cliente
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 12345" className="focus-visible:ring-sky-500 h-9 rounded-lg bg-background dark:bg-zinc-950 shadow-sm border-sky-100 dark:border-white/20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: Billing Sections (Side by Side) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Primeira Cobrança */}
          <div className="space-y-2 p-3 rounded-xl bg-muted/20 dark:bg-zinc-800/40 border border-sky-100/50 dark:border-white/20 shadow-sm relative overflow-hidden group hover:bg-muted/30 dark:hover:bg-zinc-800/60 transition-colors">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              <h3 className="font-black text-sky-600 dark:text-sky-400 text-[8px] uppercase tracking-[0.2em]">1ª Cobrança</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="dia_1"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[8px] font-bold text-muted-foreground/60 uppercase">Data</FormLabel>
                      <FormControl>
                        <SmartDateInput
                          value={field.value}
                          onChange={field.onChange}
                          className="font-bold text-[11px] h-8 rounded-md border-sky-100 dark:border-white/10 bg-background/50 dark:bg-zinc-900/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="romaneio_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[8px] font-bold text-muted-foreground/60 uppercase">Romaneio</FormLabel>
                    <FormControl>
                      <Input placeholder="Nº" className="h-8 text-[11px] font-bold rounded-md border-sky-100 dark:border-white/10 bg-background/50 dark:bg-zinc-900/50 focus-visible:ring-sky-500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

            {/* Segunda Cobrança */}
            <div className="space-y-2 p-3 rounded-xl bg-muted/20 dark:bg-zinc-800/40 border border-sky-100/50 dark:border-white/20 shadow-sm relative overflow-hidden group hover:bg-muted/30 dark:hover:bg-zinc-800/60 transition-colors">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                <h3 className="font-black text-sky-600 dark:text-sky-400 text-[8px] uppercase tracking-[0.2em]">2ª Cobrança</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="dia_2"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-[8px] font-bold text-muted-foreground/60 uppercase">Data</FormLabel>
                        <FormControl>
                          <SmartDateInput
                            value={field.value}
                            onChange={field.onChange}
                            optional
                            placeholder="Opcional"
                            className="font-bold text-[11px] h-8 rounded-md border-sky-100 dark:border-white/10 bg-background/50 dark:bg-zinc-900/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <FormField
                  control={form.control}
                  name="romaneio_2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[8px] font-bold text-muted-foreground/60 uppercase">Romaneio</FormLabel>
                      <FormControl>
                        <Input placeholder="Nº" className="h-8 text-[11px] font-bold rounded-md border-sky-100 dark:border-white/10 bg-background/50 dark:bg-zinc-900/50 focus-visible:ring-sky-500" value={field.value || ""} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Terceira Cobrança (Finaliza) */}
            <div className="space-y-2 p-3 rounded-xl bg-muted/20 dark:bg-zinc-800/40 border-2 border-sky-100/50 dark:border-white/20 shadow-md relative overflow-hidden group hover:bg-muted/30 dark:hover:bg-zinc-800/60 transition-colors">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                  <h3 className="font-black text-sky-600 dark:text-sky-400 text-[8px] uppercase tracking-[0.2em]">3ª Cobrança (Final)</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="dia_3"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-[8px] font-bold text-muted-foreground/60 uppercase">Data Final</FormLabel>
                        <FormControl>
                          <SmartDateInput
                            value={field.value}
                            onChange={field.onChange}
                            optional
                            placeholder="Finalizar"
                            className="font-bold text-[11px] h-8 rounded-md border-sky-100 dark:border-white/10 bg-background/50 dark:bg-zinc-900/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <FormField
                  control={form.control}
                  name="romaneio_3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[8px] font-bold text-muted-foreground/60 uppercase">Romaneio</FormLabel>
                      <FormControl>
                        <Input placeholder="Nº" className="h-8 text-[11px] font-bold rounded-md border-sky-100 dark:border-white/10 bg-background/50 dark:bg-zinc-900/50 focus-visible:ring-sky-500" value={field.value || ""} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-sky-100/50 dark:border-white/10">
          <div className="flex items-center gap-2 order-2 sm:order-1">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => {
                form.reset({
                  rc: "",
                  cliente: "",
                  codigo_cliente: "",
                  romaneio_1: "",
                  romaneio_2: "",
                  romaneio_3: "",
                  dia_1: new Date(),
                  dia_2: null,
                  dia_3: null,
                })
                setExistingRecord(null)
              }}
              className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all px-4 h-8"
            >
              Limpar
            </Button>
            
            {existingRecord && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all px-4 h-8 flex items-center gap-1.5"
              >
                <Trash2 className="h-3 w-3" />
                Excluir RC
              </Button>
            )}
          </div>

          <Button type="submit" className="w-full sm:w-auto sm:min-w-[240px] bg-sky-600 hover:bg-sky-700 text-white shadow-xl shadow-sky-600/20 h-9 rounded-xl text-xs font-black tracking-tight transition-all hover:scale-[1.01] active:scale-[0.99] order-1 sm:order-2" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingRecord ? "ATUALIZAR REGISTRO" : "CADASTRAR DEVOLUÇÃO"}
          </Button>
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
                onClick={deleteRecord}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Excluir Permanentemente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </Form>
  )
}
