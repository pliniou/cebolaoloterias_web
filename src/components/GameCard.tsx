import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { SavedGame } from "@/lib/saved-games";
import { Copy, Edit, Heart, Trash2, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getLotteryBySlug } from "@/lib/lotteries";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GameCardProps {
    game: SavedGame;
    onEdit: (game: SavedGame) => void;
    onDelete: (id: string) => void;
    onToggleFavorite: (id: string) => void;
}

export function GameCard({
    game,
    onEdit,
    onDelete,
    onToggleFavorite,
}: GameCardProps) {
    const lottery = getLotteryBySlug(game.lotterySlug);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(game.numbers.join(", "));
        toast.success("Números copiados!");
    };

    const Icon = lottery?.icon;

    return (
        <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
            <div
                className={`absolute top-0 left-0 w-1 h-full bg-${lottery?.color || "gray"}-500`}
            />
            <CardHeader className="pb-2 pl-5 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className={`h-5 w-5 text-${lottery?.color}-500`} />}
                    <CardTitle className="text-base font-semibold">
                        {game.name || lottery?.name || "Jogo Salvo"}
                    </CardTitle>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${game.isFavorite ? "text-red-500 fill-red-500" : "text-muted-foreground"}`}
                        onClick={() => onToggleFavorite(game.id)}
                    >
                        <Heart className={`h-4 w-4 ${game.isFavorite ? "fill-current" : ""}`} />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(game)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={copyToClipboard}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copiar Números
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => onDelete(game.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="pl-5 pb-3">
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {game.numbers.map((num) => (
                        <span
                            key={num}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-sm font-medium border border-border"
                        >
                            {num.toString().padStart(2, '0')}
                        </span>
                    ))}
                </div>
                {game.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {game.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0 h-5">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
