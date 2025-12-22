import { Layout } from "@/components/layout/Layout";
import { LotteryCard } from "@/components/lottery/LotteryCard";
import { lotteries } from "@/lib/lotteries";
import { Sparkles, TrendingUp, Clock, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  // Featured lotteries for hero section
  const featuredLotteries = lotteries.slice(0, 3);
  
  return (
    <Layout>
      <div className="p-4 lg:p-8 space-y-8 animate-fade-in">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-accent p-6 lg:p-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground/80">
                Bem-vindo ao
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-3">
              Cebolão Loterias
            </h1>
            <p className="text-lg text-primary-foreground/90 max-w-xl">
              Acompanhe os resultados de todas as loterias da Caixa em um só lugar. 
              Resultados atualizados, estatísticas e muito mais.
            </p>
            
            {/* Quick stats */}
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-4 py-2">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
                <span className="text-sm text-primary-foreground">11 Loterias</span>
              </div>
              <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-4 py-2">
                <Clock className="h-4 w-4 text-primary-foreground" />
                <span className="text-sm text-primary-foreground">Atualizado em tempo real</span>
              </div>
              <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-4 py-2">
                <Gift className="h-4 w-4 text-primary-foreground" />
                <span className="text-sm text-primary-foreground">100% Gratuito</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Lotteries */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Últimos Resultados</h2>
            <span className="text-sm text-muted-foreground">Atualizado há 5 min</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredLotteries.map((lottery) => (
              <LotteryCard key={lottery.id} lottery={lottery} />
            ))}
          </div>
        </section>

        {/* All Lotteries Grid */}
        <section>
          <h2 className="text-xl font-bold mb-4">Todas as Loterias</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {lotteries.map((lottery) => {
              const Icon = lottery.icon;
              return (
                <a
                  key={lottery.id}
                  href={`/${lottery.slug}`}
                  className="group"
                >
                  <Card className="hover-lift border-2 hover:border-primary transition-colors duration-200">
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110"
                        style={{
                          backgroundColor: `hsl(var(--${lottery.color}))`,
                        }}
                      >
                        <Icon className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <h3 className="font-semibold text-sm">{lottery.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {lottery.description}
                      </p>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        </section>

        {/* Info Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Estatísticas</h3>
              <p className="text-sm text-muted-foreground">
                Análise completa dos números mais sorteados e tendências.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-bold mb-2">Histórico</h3>
              <p className="text-sm text-muted-foreground">
                Consulte resultados anteriores de todos os concursos.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Gift className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="font-bold mb-2">Notificações</h3>
              <p className="text-sm text-muted-foreground">
                Receba alertas quando seus números forem sorteados.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
