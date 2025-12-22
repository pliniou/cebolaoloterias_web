import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { lotteries } from "@/lib/lotteries";
import { SavedGame } from "@/lib/saved-games";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface GameFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (game: Omit<SavedGame, "id" | "createdAt" | "isFavorite">) => void;
    initialData?: SavedGame; // For editing
}

export function GameForm({ open, onOpenChange, onSave, initialData }: GameFormProps) {
    const [selectedLotterySlug, setSelectedLotterySlug] = useState<string>(
        initialData?.lotterySlug || lotteries[0].slug
    );
    const [numbersInput, setNumbersInput] = useState<string>(
        initialData?.numbers.join(", ") || ""
    );
    const [name, setName] = useState<string>(initialData?.name || "");
    const [tagsInput, setTagsInput] = useState<string>("");
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);

    const selectedLottery = lotteries.find((l) => l.slug === selectedLotterySlug);

    const handleSave = () => {
        if (!selectedLottery) return;

        // Parse and validate numbers
        const numbers = numbersInput
            .split(/[\s,.-]+/) // Split by comma, space, dot, dash
            .map((n) => parseInt(n.trim(), 10))
            .filter((n) => !isNaN(n));

        const uniqueNumbers = Array.from(new Set(numbers)).sort((a, b) => a - b);

        // Validation
        const [min, max] = selectedLottery.range;
        if (uniqueNumbers.some((n) => n < min || n > max)) {
            toast.error(`Números devem estar entre ${min} e ${max} para ${selectedLottery.name}.`);
            return;
        }

        if (uniqueNumbers.length < selectedLottery.numbers) { // Assuming minimum requirement is the lottery standard count. Might need rule adjustment for 'apostas multiplas'
            // For simplicity, let's warn but allow if it's at least close, or just strict check?
            // Let's do a strict check for the standard amount for now to prevent bad data
            // Actually, many people play with more numbers. Let's check MINIMUM.
            if (uniqueNumbers.length < selectedLottery.numbers) {
                toast.error(`${selectedLottery.name} requer pelo menos ${selectedLottery.numbers} números.`);
                return;
            }
        }

        // Max Check (optional, usually ranges like 15-20 for lotofacil)
        // For now let's just warn if it looks huge
        if (uniqueNumbers.length > 50 && selectedLottery.slug !== 'lotomania') {
            toast.error(`Muitos números selecionados.`);
            return;
        }


        onSave({
            lotterySlug: selectedLotterySlug,
            numbers: uniqueNumbers,
            name,
            tags,
        });
        onOpenChange(false);
        resetForm();
    };

    const resetForm = () => {
        // Don't reset lottery slug if creating multiple
        if (!initialData) {
            setNumbersInput("");
            setName("");
            setTags([]);
            setTagsInput("");
        }
    };

    const handleAddTag = () => {
        const tag = tagsInput.trim();
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag]);
            setTagsInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Jogo" : "Novo Jogo"}</DialogTitle>
                    <DialogDescription>
                        Salve seus números da sorte para conferir depois.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="lottery">Loteria</Label>
                        <Select
                            value={selectedLotterySlug}
                            onValueChange={setSelectedLotterySlug}
                            disabled={!!initialData} // Lock lottery when editing to keep simple
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a loteria" />
                            </SelectTrigger>
                            <SelectContent>
                                {lotteries.map((l) => (
                                    <SelectItem key={l.slug} value={l.slug}>
                                        <div className="flex items-center gap-2">
                                            {/* Assuming we can use icons here later, for now just text */}
                                            <span className={`w-2 h-2 rounded-full bg-${l.color}-500`} />
                                            {l.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="numbers">
                            Números
                            <span className="text-xs text-muted-foreground ml-2">
                                (Mínimo: {selectedLottery?.numbers}, Faixa: {selectedLottery?.range[0]}-{selectedLottery?.range[1]})
                            </span>
                        </Label>
                        <Input
                            id="numbers"
                            placeholder="Ex: 01, 05, 12, 45..."
                            value={numbersInput}
                            onChange={(e) => setNumbersInput(e.target.value)}
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                            Separe os números por vírgula ou espaço.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome (Opcional)</Label>
                        <Input
                            id="name"
                            placeholder="Ex: Jogo da Firma, Aniversários..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="tags">Tags</Label>
                        <div className="flex gap-2">
                            <Input
                                id="tags"
                                placeholder="Ex: teimosinha"
                                value={tagsInput}
                                onChange={(e) => setTagsInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            />
                            <Button type="button" variant="secondary" onClick={handleAddTag}>Adicionar</Button>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {tags.map(tag => (
                                <Badge key={tag} variant="outline" className="gap-1">
                                    {tag}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave}>Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
