"use client";

import { useMemo, useState, useTransition } from "react";
import {
  CopyIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { BereichBadge } from "@/components/textbausteine/bereich-badge";
import {
  createTextbaustein,
  deleteTextbaustein,
  updateTextbaustein,
} from "@/lib/textbausteine/actions";
import { bereichStyles } from "@/lib/textbausteine/bereich-styles";
import {
  BEREICHE,
  type Bereich,
  type Textbaustein,
} from "@/lib/textbausteine/types";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type FormState = {
  titel: string;
  inhalt: string;
  bereich: Bereich;
};

const emptyForm: FormState = {
  titel: "",
  inhalt: "",
  bereich: "allgemein",
};

type TextbausteineViewProps = {
  initialItems: Textbaustein[];
};

export function TextbausteineView({ initialItems }: TextbausteineViewProps) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [bereichFilter, setBereichFilter] = useState<Bereich | "alle">("alle");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Textbaustein | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Textbaustein | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesBereich =
        bereichFilter === "alle" || item.bereich === bereichFilter;
      const matchesSearch =
        !query ||
        item.titel.toLowerCase().includes(query) ||
        item.inhalt.toLowerCase().includes(query);

      return matchesBereich && matchesSearch;
    });
  }, [items, search, bereichFilter]);

  function openCreateDialog() {
    setEditingItem(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(item: Textbaustein) {
    setEditingItem(item);
    setForm({
      titel: item.titel,
      inhalt: item.inhalt,
      bereich: item.bereich,
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = editingItem
        ? await updateTextbaustein(editingItem.id, form)
        : await createTextbaustein(form);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (editingItem) {
        setItems((current) =>
          current.map((item) =>
            item.id === editingItem.id ? result.item : item
          )
        );
        toast.success("Textbaustein aktualisiert.");
      } else {
        setItems((current) => [result.item, ...current]);
        toast.success("Textbaustein angelegt.");
      }

      setDialogOpen(false);
      setEditingItem(null);
      setForm(emptyForm);
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;

    const target = deleteTarget;

    startTransition(async () => {
      const result = await deleteTextbaustein(target.id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setItems((current) => current.filter((item) => item.id !== target.id));
      setDeleteTarget(null);
      toast.success("Textbaustein gelöscht.");
    });
  }

  async function copyInhalt(item: Textbaustein) {
    try {
      await navigator.clipboard.writeText(item.inhalt);
      toast.success("Inhalt in die Zwischenablage kopiert.");
    } catch {
      toast.error("Kopieren fehlgeschlagen.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8">
      <PageHeader
        eyebrow="Wissensbasis"
        title="Textbausteine"
        description="Wiederverwendbare Texte für Schreiben, E-Mails und Vorlagen — strukturiert nach Kanzlei-Bereichen."
      >
        <Button
          onClick={openCreateDialog}
          size="lg"
          className="px-5 shadow-sm shadow-primary/20"
        >
          <PlusIcon data-icon="inline-start" />
          Neuer Textbaustein
        </Button>
      </PageHeader>

      <div className="surface-panel space-y-4 p-4 md:p-5">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Suchen nach Titel oder Inhalt…"
            className="h-11 rounded-xl border-border/80 bg-background/80 pl-10 shadow-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterPill
            active={bereichFilter === "alle"}
            onClick={() => setBereichFilter("alle")}
            label="Alle"
            count={items.length}
            activeClassName="bg-primary text-primary-foreground shadow-sm shadow-primary/20"
          />
          {BEREICHE.map((bereich) => {
            const count = items.filter(
              (item) => item.bereich === bereich.value
            ).length;
            const styles = bereichStyles[bereich.value];

            return (
              <FilterPill
                key={bereich.value}
                active={bereichFilter === bereich.value}
                onClick={() => setBereichFilter(bereich.value)}
                label={bereich.label}
                count={count}
                dotClassName={styles.dot}
                activeClassName={styles.pill}
              />
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>
          {filteredItems.length}{" "}
          {filteredItems.length === 1 ? "Textbaustein" : "Textbausteine"}
        </p>
      </div>

      {filteredItems.length === 0 ? (
        <Empty className="surface-card border-dashed py-16">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="size-12 rounded-none bg-sky-100 text-sky-700"
            >
              <SearchIcon className="size-5" />
            </EmptyMedia>
            <EmptyTitle className="font-heading text-lg">
              {items.length === 0
                ? "Noch keine Textbausteine"
                : "Keine Treffer"}
            </EmptyTitle>
            <EmptyDescription className="max-w-sm text-sm leading-relaxed">
              {items.length === 0
                ? "Lege den ersten Textbaustein an, um wiederkehrende Formulierungen zentral zu verwalten."
                : "Passe Suche oder Bereichsfilter an."}
            </EmptyDescription>
          </EmptyHeader>
          {items.length === 0 && (
            <EmptyContent>
              <Button
                onClick={openCreateDialog}
                size="lg"
              >
                <PlusIcon data-icon="inline-start" />
                Ersten Textbaustein anlegen
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className={cn(
                "surface-card group overflow-hidden border-l-[3px] transition-shadow hover:shadow-[var(--shadow-elevated)]",
                bereichStyles[item.bereich].accent,
                bereichStyles[item.bereich].wash
              )}
            >
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-heading text-lg font-medium tracking-tight">
                      {item.titel}
                    </h2>
                    <BereichBadge bereich={item.bereich} />
                  </div>
                  <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {item.inhalt}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1 sm:opacity-80 sm:transition-opacity group-hover:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-background/80"
                    onClick={() => copyInhalt(item)}
                  >
                    <CopyIcon data-icon="inline-start" />
                    Kopieren
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEditDialog(item)}
                    aria-label="Bearbeiten"
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(item)}
                    aria-label="Löschen"
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingItem(null);
            setForm(emptyForm);
          }
        }}
      >
        <DialogContent className="overflow-hidden rounded-none border-border/80 p-0 sm:max-w-2xl">
          <div className="h-1 bg-gradient-to-r from-sky-400 via-teal-400 to-indigo-400" />
          <div className="border-b border-border/70 px-6 py-5">
            <DialogHeader className="text-left">
              <p className="text-[0.68rem] font-medium tracking-[0.16em] text-primary/70 uppercase">
                {editingItem ? "Bearbeiten" : "Neu anlegen"}
              </p>
              <DialogTitle className="font-heading text-xl font-medium">
                {editingItem ? "Textbaustein bearbeiten" : "Neuer Textbaustein"}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                Titel, Bereich und Textinhalt für die spätere Wiederverwendung
                festlegen.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="grid gap-5 px-6 py-5">
            <div className="grid gap-2">
              <Label htmlFor="titel">Titel</Label>
              <Input
                id="titel"
                value={form.titel}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    titel: event.target.value,
                  }))
                }
                placeholder="z. B. Anschreiben Erstberatung"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bereich">Bereich</Label>
              <Select
                value={form.bereich}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    bereich: value as Bereich,
                  }))
                }
              >
                <SelectTrigger id="bereich" className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BEREICHE.map((bereich) => (
                    <SelectItem key={bereich.value} value={bereich.value}>
                      {bereich.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="inhalt">Inhalt</Label>
              <Textarea
                id="inhalt"
                value={form.inhalt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    inhalt: event.target.value,
                  }))
                }
                placeholder="Text des Bausteins…"
                className="min-h-52 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border/70 bg-muted/30 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isPending}
            >
              Abbrechen
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {editingItem ? "Speichern" : "Anlegen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">
              Textbaustein löschen?
            </AlertDialogTitle>
            <AlertDialogDescription>
              „{deleteTarget?.titel}" wird dauerhaft entfernt. Diese Aktion
              kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
  dotClassName,
  activeClassName = "bg-primary text-primary-foreground shadow-sm",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  dotClassName?: string;
  activeClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm transition-all",
        active
          ? activeClassName
          : "bg-background/70 text-muted-foreground ring-1 ring-border/80 hover:bg-background hover:text-foreground"
      )}
    >
      {dotClassName ? (
        <span className={cn("size-1.5 rounded-full", dotClassName)} />
      ) : null}
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[0.65rem] font-medium",
          active
            ? "bg-primary-foreground/15 text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {count}
      </span>
    </button>
  );
}
