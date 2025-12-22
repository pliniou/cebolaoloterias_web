import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { getLotteryBySlug, LotteryInfo } from "@/lib/lotteries";
import { LotteryBall } from "@/components/lottery/LotteryBall";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Trophy, History, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Generate mock data
function generateMockResults(lottery: LotteryInfo) {
  const results = [];
  for (let i = 0; i < 5; i++) {
    const numbers: number[] = [];
    const count = Math.min(lottery.numbers, 6);
    while (numbers.length < count) {
      const num = Math.floor(Math.random() * (lottery.range[1] - lottery.range[0] + 1)) + lottery.range[0];
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    results.push({
      contest: 2800 - i,
      date: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR"),
      numbers: numbers.sort((a, b) => a - b),
      prize: (Math.random() * 50000000 + 1000000).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      winners: Math.floor(Math.random() * 5),
    });
  }
  return results;
}

export function LotteryPage() {
  const { slug } = useParams<{ slug: string }>();
  const lottery = getLotteryBySlug(slug || "");

  if (!lottery) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loteria não encontrada</p>
        </div>
      </Layout>
    );
  }

  const mockResults = generateMockResults(lottery);
  const latestResult = mockResults[0];
  const Icon = lottery.icon;

  return (
    <Layout>
      <div className="p-4 lg:p-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 lg:p-8"
          style={{ backgroundColor: `hsl(var(--${lottery.color}))` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-primary-foreground">
                  {lottery.name}
                </h1>
                <p className="text-primary-foreground/80">{lottery.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-0">
                <Calendar className="h-3 w-3 mr-1" />
                Concurso {latestResult.contest}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-0">
                {latestResult.date}
              </Badge>
            </div>
          </div>
        </div>

        {/* Latest Result */}
        <Card className="border-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-primary" />
              Último Resultado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 justify-center py-4">
              {latestResult.numbers.map((num, index) => (
                <LotteryBall
                  key={index}
                  number={num}
                  color={lottery.color}
                  size="lg"
                  delay={index * 100}
                />
              ))}
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Prêmio Principal</p>
                <p className="text-xl font-bold text-primary">{latestResult.prize}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ganhadores</p>
                <p className="text-xl font-bold">
                  {latestResult.winners > 0 ? `${latestResult.winners} ganhador(es)` : "Acumulou!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Estatísticas</span>
            </TabsTrigger>
            <TabsTrigger value="winners" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Ganhadores</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-4 space-y-3">
            {mockResults.slice(1).map((result) => (
              <Card key={result.contest} className="border">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">Concurso {result.contest}</p>
                      <p className="text-sm text-muted-foreground">{result.date}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.numbers.map((num, index) => (
                        <LotteryBall
                          key={index}
                          number={num}
                          color={lottery.color}
                          size="sm"
                        />
                      ))}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{result.prize}</p>
                      <p className="text-sm text-muted-foreground">
                        {result.winners > 0 ? `${result.winners} ganhador(es)` : "Acumulou"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="statistics" className="mt-4">
            <Card className="border">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Números Mais Sorteados</h3>
                <div className="flex flex-wrap gap-2">
                  {[10, 23, 5, 33, 42, 17, 8, 29, 14, 36].map((num, index) => (
                    <div key={num} className="flex flex-col items-center">
                      <LotteryBall
                        number={num}
                        color={lottery.color}
                        size="md"
                      />
                      <span className="text-xs text-muted-foreground mt-1">
                        {150 - index * 10}x
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="winners" className="mt-4">
            <Card className="border">
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Área de Ganhadores</h3>
                  <p className="text-sm text-muted-foreground">
                    Informações sobre ganhadores serão exibidas aqui.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
