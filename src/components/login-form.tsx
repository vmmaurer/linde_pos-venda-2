"use client"

import * as React from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Lock, User } from "lucide-react"
import { toast } from "sonner"

export function LoginForm() {
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const success = login(username, password)
    if (success) {
      toast.success(`Bem-vindo, ${username}!`)
    } else {
      toast.error("Usuário ou senha incorretos")
    }
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background dark:bg-[#020202] p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[120px]" />

      <Card className="w-full max-w-[400px] shadow-2xl border-0 dark:border dark:border-white/5 rounded-[2.5rem] bg-white/80 dark:bg-zinc-950/40 backdrop-blur-xl p-0 transition-all duration-500 hover:shadow-sky-500/5">
        <CardHeader className="pb-8 pt-10 px-8 text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-2 ring-1 ring-sky-500/20">
            <Lock className="h-8 w-8 text-sky-500" strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
              <CardTitle className="text-3xl font-black tracking-tighter uppercase bg-gradient-to-br from-sky-400 to-sky-600 bg-clip-text text-transparent">
                Linde Vidros
              </CardTitle>
            <CardDescription className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] opacity-70">
              Sistema de Pós-Vendas
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-10 pb-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-3 flex flex-col items-center">
                <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Identificação do Usuário
                </Label>
                <div className="relative w-full">
                  <Input
                    id="username"
                    placeholder="DIGITE SEU USUÁRIO"
                    className="h-12 border-0 bg-muted/50 dark:bg-white/5 focus-visible:ring-1 focus-visible:ring-sky-500/50 text-center font-bold tracking-tight rounded-xl placeholder:text-muted-foreground/30 placeholder:font-medium uppercase text-xs"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-3 flex flex-col items-center">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Senha de Acesso
                </Label>
                <div className="relative w-full">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-12 border-0 bg-muted/50 dark:bg-white/5 focus-visible:ring-1 focus-visible:ring-sky-500/50 text-center font-bold tracking-widest rounded-xl placeholder:text-muted-foreground/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-sky-500 hover:bg-sky-600 text-white shadow-[0_8px_30px_rgb(14,165,233,0.3)] transition-all active:scale-[0.98] h-14 text-sm font-black uppercase tracking-widest rounded-xl" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Autenticar"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
