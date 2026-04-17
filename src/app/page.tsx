"use client"

import * as React from "react"
import {
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  PlusCircle,
  Truck
} from "lucide-react"

import { ModeToggle } from "@/components/mode-toggle"
import { ReturnForm } from "@/components/return-form"
import { ReturnList } from "@/components/return-list"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"

export default function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background dark:bg-[#050505]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-white/10 dark:bg-black/80">
        <div className="mx-auto flex h-14 items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-5 w-5 text-sky-400" />
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight leading-none text-foreground/90 uppercase">Linde Vidros</span>
              <span className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest">Pós-Vendas</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl flex-1 space-y-4 p-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight dark:text-white">Controle de Devoluções</h2>
        </div>

        <Tabs defaultValue="todos" className="space-y-4">
          <div className="flex items-center justify-between overflow-x-auto pb-1 scrollbar-none">
            <TabsList className="bg-muted/50 border dark:border-white/10 dark:bg-zinc-900/50 p-1 h-9">
              <TabsTrigger value="todos" className="h-7 text-xs flex items-center gap-1.5 data-[state=active]:bg-sky-400 data-[state=active]:text-white">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Registros
              </TabsTrigger>
              <TabsTrigger value="pendentes" className="h-7 text-xs flex items-center gap-1.5 data-[state=active]:bg-sky-400 data-[state=active]:text-white">
                <ClipboardList className="h-3.5 w-3.5" />
                Pendentes
              </TabsTrigger>
              <TabsTrigger value="faturamento" className="h-7 text-xs flex items-center gap-1.5 data-[state=active]:bg-sky-400 data-[state=active]:text-white">
                <CreditCard className="h-3.5 w-3.5" />
                Faturamento
              </TabsTrigger>
              <TabsTrigger value="devolvidos" className="h-7 text-xs flex items-center gap-1.5 data-[state=active]:bg-sky-400 data-[state=active]:text-white">
                <Truck className="h-3.5 w-3.5" />
                Devolvidos
              </TabsTrigger>
              <TabsTrigger value="cadastro" className="h-7 text-xs flex items-center gap-1.5 font-bold data-[state=active]:bg-sky-400 data-[state=active]:text-white">
                <PlusCircle className="h-3.5 w-3.5" />
                Novo / Editar
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="todos" className="m-0">
            <Card className="shadow-2xl overflow-hidden border dark:border-white/10 rounded-[2rem] bg-card dark:bg-zinc-900/80 backdrop-blur-md p-0">
              <CardHeader className="pb-4 pt-6 px-8 text-left">
                <CardTitle className="text-xl font-black text-sky-600 dark:text-sky-400">Todos os Registros</CardTitle>
                <CardDescription className="text-muted-foreground font-semibold text-xs mt-0.5">
                  Visualização completa de todas as devoluções cadastradas.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 px-8 pb-6">
                <ReturnList statusFilter="all" refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pendentes" className="m-0">
            <Card className="shadow-2xl overflow-hidden border dark:border-white/10 rounded-[2rem] bg-card dark:bg-zinc-900/80 backdrop-blur-md p-0">
              <CardHeader className="pb-4 pt-6 px-8 text-left">
                <CardTitle className="text-xl font-black text-sky-600 dark:text-sky-400">Registros Pendentes</CardTitle>
                <CardDescription className="text-muted-foreground font-semibold text-xs mt-0.5">
                  Itens aguardando processamento inicial ou conferência.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 px-8 pb-6">
                <ReturnList statusFilter="pending" refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faturamento" className="m-0">
            <Card className="shadow-2xl overflow-hidden border dark:border-white/10 rounded-[2rem] bg-card dark:bg-zinc-900/80 backdrop-blur-md p-0">
              <CardHeader className="pb-4 pt-6 px-8 text-left">
                <CardTitle className="text-xl font-black text-sky-600 dark:text-sky-400">Para Faturamento</CardTitle>
                <CardDescription className="text-muted-foreground font-semibold text-xs mt-0.5">
                  Devoluções aprovadas e prontas para emissão de nota.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 px-8 pb-6">
                <ReturnList statusFilter="billing" refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devolvidos" className="m-0">
            <Card className="shadow-2xl overflow-hidden border dark:border-white/10 rounded-[2rem] bg-card dark:bg-zinc-900/80 backdrop-blur-md p-0">
              <CardHeader className="pb-4 pt-6 px-8 text-left">
                <CardTitle className="text-xl font-black text-sky-600 dark:text-sky-400">Registros Devolvidos</CardTitle>
                <CardDescription className="text-muted-foreground font-semibold text-xs mt-0.5">
                  Histórico de processos de devolução finalizados.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 px-8 pb-6">
                <ReturnList statusFilter="delivered" refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cadastro" className="m-0">
            <Card className="mx-auto max-w-6xl shadow-2xl overflow-hidden border dark:border-white/10 rounded-[2rem] bg-card dark:bg-zinc-900/80 backdrop-blur-md p-0">
              <CardHeader className="pb-4 pt-6 px-8 text-left">
                <CardTitle className="text-xl font-black text-sky-600 dark:text-sky-400">Cadastro de Devolução</CardTitle>
                <CardDescription className="text-muted-foreground font-semibold text-xs mt-0.5">
                  Insira uma nova RC ou digite uma existente para editar.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 px-8 pb-6">
                <ReturnForm onSuccess={handleRefresh} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-3 bg-muted/5 dark:bg-black/40 dark:border-white/10 mt-auto">
        <div className="container mx-auto max-w-7xl px-4 flex justify-between items-center text-center">
          <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            Vinicius Maciel Maurer <span className="mx-2 text-sky-500/30">•</span> Sistema Linde Vidros <span className="mx-2 text-sky-500/30">•</span> {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}
