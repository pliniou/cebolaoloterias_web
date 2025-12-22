import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSavedGames, SavedGame } from "@/lib/saved-games";
import { GameCard } from "@/components/GameCard";
import { GameForm } from "@/components/GameForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lotteries } from "@/lib/lotteries";

export function MyGames() {
    const { games, addGame, updateGame, deleteGame, toggleFavorite } = useSavedGames();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingGame, setEditingGame] = useState<SavedGame | undefined>(undefined);

    const handleCreate = (data: Omit<SavedGame, "id" | "createdAt" | "isFavorite">) => {
        addGame(data);
    };

    const handleUpdate = (data: Omit<SavedGame, "id" | "createdAt" | "isFavorite">) => {
        if (editingGame) {
            updateGame(editingGame.id, data);
            setEditingGame(undefined);
        }
    };

    const openEdit = (game: SavedGame) => {
        setEditingGame(game);
        setIsFormOpen(true);
    };

    // Group games by lottery for tabs (only those that have games)
    const lotteriesWithGames = lotteries.filter(l => games.some(g => g.lotterySlug === l.slug));
    // Sort them so the ones with games come first or standard order? Standard order is fine.

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Meus Jogos</h1>
                    <p className="text-muted-foreground">
                        Gerencie seus jogos salvos e confira seus números da sorte.
                    </p>
                </div>
                <Button onClick={() => { setEditingGame(undefined); setIsFormOpen(true); }} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Jogo
                </Button>
            </div>

            {games.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/20 border-dashed">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Plus className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Nenhum jogo salvo</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                        Você ainda não salvou nenhum jogo. Crie seu primeiro jogo para começar a acompanhar seus resultados.
                    </p>
                    <Button onClick={() => setIsFormOpen(true)}>Criar meu primeiro jogo</Button>
                </div>
            ) : (
                <Tabs defaultValue="all" className="w-full">
                    <div className="overflow-x-auto pb-2">
                        <TabsList>
                            <TabsTrigger value="all">Todos ({games.length})</TabsTrigger>
                            {lotteriesWithGames.map(l => (
                                <TabsTrigger key={l.slug} value={l.slug}>
                                    {l.name} ({games.filter(g => g.lotterySlug === l.slug).length})
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <TabsContent value="all" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {games.map((game) => (
                                <GameCard
                                    key={game.id}
                                    game={game}
                                    onEdit={openEdit}
                                    onDelete={deleteGame}
                                    onToggleFavorite={toggleFavorite}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    {lotteriesWithGames.map((l) => (
                        <TabsContent key={l.slug} value={l.slug} className="mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {games
                                    .filter((g) => g.lotterySlug === l.slug)
                                    .map((game) => (
                                        <GameCard
                                            key={game.id}
                                            game={game}
                                            onEdit={openEdit}
                                            onDelete={deleteGame}
                                            onToggleFavorite={toggleFavorite}
                                        />
                                    ))}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            )}

            <GameForm
                open={isFormOpen}
                onOpenChange={(open) => {
                    setIsFormOpen(open);
                    if (!open) setEditingGame(undefined);
                }}
                onSave={editingGame ? handleUpdate : handleCreate}
                initialData={editingGame}
                key={editingGame ? editingGame.id : 'new'} // Force re-render on edit change
            />
        </div>
    );
}
