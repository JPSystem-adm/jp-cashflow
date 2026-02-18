// src/app/(app)/jogos/sudoku/_components/SudokuGame.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

import type { CellValue, Difficulty, FixedMap, Grid, Digit } from "../_lib/sudoku";
import { generatePuzzle, isDigit, makeEmptyGrid } from "../_lib/sudoku";

type Selected = { r: number; c: number } | null;

type Persisted = {
  grid: Grid;
  fixed: FixedMap;
  solution: Grid;
  difficulty: Difficulty;
  mistakes: number;
  gameOver: boolean;
};

const STORAGE_KEY = "jp-cashflow:sudoku:v9";
const MAX_MISTAKES = 3;

function cellKey(r: number, c: number): string {
  return `${r}-${c}`;
}

function makeFixedGrid(value: boolean): FixedMap {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => value));
}

function isBoxAltGreen(r: number, c: number): boolean {
  const br = Math.floor(r / 3);
  const bc = Math.floor(c / 3);
  return (br + bc) % 2 === 0;
}

function isSameRowOrCol(sel: Selected, r: number, c: number): boolean {
  if (!sel) return false;
  return sel.r === r || sel.c === c;
}

function isSameBox(sel: Selected, r: number, c: number): boolean {
  if (!sel) return false;
  const br = Math.floor(r / 3);
  const bc = Math.floor(c / 3);
  const sbr = Math.floor(sel.r / 3);
  const sbc = Math.floor(sel.c / 3);
  return br === sbr && bc === sbc;
}

function gridsEqual(a: Grid, b: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if ((a[r]?.[c] ?? 0) !== (b[r]?.[c] ?? 0)) return false;
    }
  }
  return true;
}

function buildWrongMap(grid: Grid, fixed: FixedMap, solution: Grid): boolean[][] {
  const out: boolean[][] = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => false));
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = grid[r]?.[c] ?? 0;
      if (v === 0) continue;
      if (fixed[r]?.[c]) continue;
      const sol = solution[r]?.[c] ?? 0;
      if (v !== sol) out[r]![c] = true;
    }
  }
  return out;
}

function safeParsePersisted(raw: string): Persisted | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const obj = parsed as Record<string, unknown>;

    const grid = obj.grid;
    const fixed = obj.fixed;
    const solution = obj.solution;
    const difficulty = obj.difficulty;
    const mistakes = obj.mistakes;
    const gameOver = obj.gameOver;

    if (!Array.isArray(grid) || !Array.isArray(fixed) || !Array.isArray(solution)) return null;
    if (difficulty !== "easy" && difficulty !== "medium" && difficulty !== "hard") return null;
    if (typeof mistakes !== "number" || !Number.isFinite(mistakes) || mistakes < 0) return null;
    if (typeof gameOver !== "boolean") return null;

    if (grid.length !== 9 || fixed.length !== 9 || solution.length !== 9) return null;

    for (let r = 0; r < 9; r++) {
      const row = grid[r];
      const frow = fixed[r];
      const srow = solution[r];
      if (!Array.isArray(row) || row.length !== 9) return null;
      if (!Array.isArray(frow) || frow.length !== 9) return null;
      if (!Array.isArray(srow) || srow.length !== 9) return null;

      for (let c = 0; c < 9; c++) {
        const v = row[c];
        const fv = frow[c];
        const sv = srow[c];
        if (typeof v !== "number" || !Number.isInteger(v) || v < 0 || v > 9) return null;
        if (typeof fv !== "boolean") return null;
        if (typeof sv !== "number" || !Number.isInteger(sv) || sv < 0 || sv > 9) return null;
      }
    }

    return {
      grid: grid as Grid,
      fixed: fixed as FixedMap,
      solution: solution as Grid,
      difficulty,
      mistakes: Math.min(MAX_MISTAKES, Math.max(0, Math.floor(mistakes))),
      gameOver,
    };
  } catch {
    return null;
  }
}

export default function SudokuGame(): JSX.Element {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [grid, setGrid] = useState<Grid>(() => makeEmptyGrid());
  const [fixed, setFixed] = useState<FixedMap>(() => makeFixedGrid(false));
  const [solution, setSolution] = useState<Grid>(() => makeEmptyGrid());

  const [selected, setSelected] = useState<Selected>(null);
  const [ready, setReady] = useState<boolean>(false);

  const [mistakes, setMistakes] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const [showWin, setShowWin] = useState<boolean>(false);

  const wrongMap = useMemo(() => buildWrongMap(grid, fixed, solution), [grid, fixed, solution]);
  const solved = useMemo(() => (ready ? gridsEqual(grid, solution) : false), [grid, solution, ready]);

  const startNewGame = useCallback((diff: Difficulty) => {
    const g = generatePuzzle(diff);
    setDifficulty(diff);
    setGrid(g.puzzle);
    setFixed(g.fixed);
    setSolution(g.solution);
    setSelected(null);
    setMistakes(0);
    setGameOver(false);
    setShowWin(false);
  }, []);

  const setCell = useCallback((r: number, c: number, value: CellValue) => {
    setGrid((prev) => {
      const next = prev.map((row) => row.slice()) as Grid;
      next[r]![c] = value;
      return next;
    });
  }, []);

  const clearCell = useCallback(() => {
    if (!ready || gameOver || solved) return;
    if (!selected) return;
    const { r, c } = selected;
    if (fixed[r]?.[c]) return;
    setCell(r, c, 0);
  }, [fixed, selected, setCell, ready, gameOver, solved]);

  const registerMistake = useCallback(() => {
    setMistakes((prev) => {
      const next = prev + 1;
      if (next >= MAX_MISTAKES) {
        setGameOver(true);
        return MAX_MISTAKES;
      }
      return next;
    });
  }, []);

  const inputDigit = useCallback(
    (d: Digit) => {
      if (!ready || gameOver || solved) return;
      if (!selected) return;
      const { r, c } = selected;
      if (fixed[r]?.[c]) return;

      const current = grid[r]?.[c] ?? 0;
      if (current === d) return;

      const expected = solution[r]?.[c] ?? 0;
      if (d !== expected) registerMistake();

      setCell(r, c, d);
    },
    [fixed, selected, setCell, ready, gameOver, solved, grid, solution, registerMistake]
  );

  useEffect(() => {
    let loaded = false;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = safeParsePersisted(raw);
        if (parsed) {
          setDifficulty(parsed.difficulty);
          setGrid(parsed.grid);
          setFixed(parsed.fixed);
          setSolution(parsed.solution);
          setMistakes(parsed.mistakes);
          setGameOver(parsed.gameOver);
          loaded = true;
        }
      }
    } catch {
      // ignora
    }

    if (!loaded) {
      const g = generatePuzzle("easy");
      setDifficulty("easy");
      setGrid(g.puzzle);
      setFixed(g.fixed);
      setSolution(g.solution);
      setMistakes(0);
      setGameOver(false);
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const payload: Persisted = { grid, fixed, solution, difficulty, mistakes, gameOver };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignora
    }
  }, [grid, fixed, solution, difficulty, mistakes, gameOver, ready]);

  useEffect(() => {
    if (!ready) return;
    if (!solved) return;
    if (gameOver) return;

    setShowWin(true);
    const t = window.setTimeout(() => setShowWin(false), 2200);
    return () => window.clearTimeout(t);
  }, [solved, ready, gameOver]);

  useEffect(() => {
    if (!ready) return;

    function onKeyDown(ev: KeyboardEvent): void {
      if (gameOver || solved) return;

      if (ev.key === "Backspace" || ev.key === "Delete") {
        ev.preventDefault();
        clearCell();
        return;
      }
      if (ev.key >= "1" && ev.key <= "9") {
        ev.preventDefault();
        const n = Number(ev.key);
        if (isDigit(n)) inputDigit(n);
        return;
      }

      if (!selected) return;
      const { r, c } = selected;

      if (ev.key === "ArrowUp") setSelected({ r: Math.max(0, r - 1), c });
      if (ev.key === "ArrowDown") setSelected({ r: Math.min(8, r + 1), c });
      if (ev.key === "ArrowLeft") setSelected({ r, c: Math.max(0, c - 1) });
      if (ev.key === "ArrowRight") setSelected({ r, c: Math.min(8, c + 1) });
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clearCell, inputDigit, selected, ready, gameOver, solved]);

  const numberPad = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8, 9] as const, []);

  // ✅ botão padronizado (tamanhos/labels)
  const btnKeyClass = "h-11 lg:h-11 text-sm lg:text-sm px-0";
  const btnActionClass = "h-9 text-sm px-2 sm:px-4";

  if (!ready) {
    return (
      <div className="w-full max-w-6xl mx-auto p-2 sm:p-4 pb-10">
        <Card className="shadow-sm">
          <CardHeader className="py-3">
            <CardTitle className="text-lg sm:text-2xl">Sudoku</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Carregando…</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-16px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(320px) rotate(360deg); opacity: 0; }
        }
      `}</style>

      <AlertDialog open={gameOver}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erro, fim do jogo</AlertDialogTitle>
            <AlertDialogDescription>
              Você atingiu o limite de {MAX_MISTAKES} erros.
              <br />
              Quer iniciar um novo jogo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <Button type="button" onClick={() => startNewGame(difficulty)}>
              Novo jogo
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showWin ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/25" />
          <div className="relative z-10 pointer-events-none">
            <div className="rounded-2xl border bg-background/95 backdrop-blur px-5 py-4 shadow-lg text-center animate-in zoom-in">
              <div className="text-2xl font-bold">🎉 Parabéns!</div>
              <div className="mt-1 text-sm text-muted-foreground">Sudoku completo.</div>
            </div>

            <div className="absolute inset-0 -z-10">
              {Array.from({ length: 18 }).map((_, i) => {
                const left = (i * 6) % 100;
                const delay = (i % 6) * 0.05;
                const duration = 1.0 + (i % 7) * 0.08;
                return (
                  <span
                    key={i}
                    className="absolute top-0 h-2 w-1 rounded-sm bg-foreground/70"
                    style={{
                      left: `${left}%`,
                      animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* ✅ margem inferior extra pra não colar no rodapé/bottom-nav */}
      <div className="w-full max-w-6xl mx-auto p-2 sm:p-4 pb-16 sm:pb-10">
        <Card className="shadow-sm">
          <CardHeader className="py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg sm:text-2xl">Sudoku</CardTitle>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground cursor-help hidden sm:inline">Regras</span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[320px] text-xs leading-relaxed">
                    Erro conta quando o número é diferente da solução.
                  </TooltipContent>
                </Tooltip>

                <div
                  className={[
                    "ml-1 rounded-full border px-2 py-1 text-[11px] sm:text-sm whitespace-nowrap",
                    mistakes >= 2 ? "border-destructive/40 text-destructive" : "text-muted-foreground",
                  ].join(" ")}
                >
                  Erros: <span className="font-semibold">{mistakes}</span>/{MAX_MISTAKES}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-2 sm:w-auto">
                <Select value={difficulty} onValueChange={(v) => startNewGame(v as Difficulty)}>
                  <SelectTrigger className={["h-9 text-sm", "sm:w-[160px]"].join(" ")}>
                    <SelectValue placeholder="Dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                  </SelectContent>
                </Select>

                <Button type="button" variant="secondary" className={btnActionClass} onClick={() => startNewGame(difficulty)}>
                  Novo
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className={btnActionClass}
                  onClick={clearCell}
                  disabled={gameOver || solved}
                >
                  Limpar
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 pb-4">
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(360px,520px)_minmax(280px,1fr)] lg:items-start">
              {/* Tabuleiro */}
              <div className="w-full flex justify-center lg:justify-start">
                <div className="w-[min(92vw,520px)]">
                  <div className={["grid grid-cols-9 rounded-md overflow-hidden border", gameOver ? "opacity-70" : ""].join(" ")}>
                    {grid.map((row, r) =>
                      row.map((val, c) => {
                        const isFixedCell = fixed[r]?.[c] ?? false;
                        const isSelected = selected?.r === r && selected?.c === c;
                        const isWrong = wrongMap[r]?.[c] ?? false;

                        const thickRight = (c + 1) % 3 === 0 && c !== 8;
                        const thickBottom = (r + 1) % 3 === 0 && r !== 8;

                        const alt = isBoxAltGreen(r, c);
                        const bg = alt
                          ? "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/30"
                          : "bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-950/55 dark:to-emerald-900/40";

                        const focus =
                          selected && !isSelected && (isSameRowOrCol(selected, r, c) || isSameBox(selected, r, c))
                            ? "brightness-[0.99] dark:brightness-110"
                            : "";

                        const numberStyle = isWrong
                          ? "text-destructive font-bold"
                          : isFixedCell
                            ? "font-semibold text-foreground"
                            : "font-normal text-foreground";

                        const selectedStyle = isSelected ? "ring-2 ring-sky-500 ring-inset" : "";

                        return (
                          <button
                            key={cellKey(r, c)}
                            type="button"
                            onClick={() => {
                              if (gameOver || solved) return;
                              setSelected({ r, c });
                            }}
                            disabled={gameOver || solved}
                            className={[
                              "aspect-square w-full flex items-center justify-center",
                              "border border-border select-none",
                              "text-base sm:text-xl",
                              bg,
                              focus,
                              numberStyle,
                              selectedStyle,
                              thickRight ? "border-r-2" : "",
                              thickBottom ? "border-b-2" : "",
                              gameOver || solved ? "cursor-not-allowed" : "cursor-pointer",
                            ].join(" ")}
                            aria-label={`Linha ${r + 1}, Coluna ${c + 1}`}
                          >
                            {val === 0 ? "" : String(val)}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Teclado / Ações */}
              <div className="w-full flex justify-center lg:justify-start">
                <div className="w-[min(92vw,380px)] lg:w-full">
                  {/* Mobile: 1 linha */}
                  <div className="grid grid-cols-10 gap-1 lg:hidden">
                    {numberPad.map((n) => (
                      <Button
                        key={n}
                        type="button"
                        variant="secondary"
                        className="h-9 px-0 text-sm"
                        disabled={gameOver || solved}
                        onClick={() => {
                          if (isDigit(n)) inputDigit(n);
                        }}
                      >
                        {n}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 px-0 text-sm"
                      onClick={clearCell}
                      disabled={gameOver || solved}
                      title="Limpar célula"
                      aria-label="Limpar célula"
                    >
                      ⌫
                    </Button>
                  </div>

                  {/* Desktop: teclado + botões padronizados */}
                  <div className="hidden lg:block">
                    <div className="grid grid-cols-3 gap-2">
                      {numberPad.map((n) => (
                        <Button
                          key={n}
                          type="button"
                          variant="secondary"
                          className={btnKeyClass}
                          disabled={gameOver || solved}
                          onClick={() => {
                            if (isDigit(n)) inputDigit(n);
                          }}
                        >
                          {n}
                        </Button>
                      ))}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button type="button" variant="outline" className={btnActionClass} onClick={clearCell} disabled={gameOver || solved}>
                        Limpar
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        className={btnActionClass}
                        onClick={() => startNewGame(difficulty)}
                      >
                        Novo jogo
                      </Button>
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground">
                      Dica: clique na célula e use 1–9. Backspace também limpa.
                      <br />
                      Limite: {MAX_MISTAKES} erros.
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] sm:text-xs text-muted-foreground lg:hidden">
                    Dica: toque na célula e escolha 1–9. ⌫ limpa. Limite: {MAX_MISTAKES} erros.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
