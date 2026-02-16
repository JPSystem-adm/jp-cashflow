// src/app/(app)/jogos/sudoku/_lib/sudoku.ts

export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type CellValue = Digit | 0; // 0 = vazio
export type Grid = CellValue[][];

export type Difficulty = "easy" | "medium" | "hard";

export type FixedMap = boolean[][];

export type ConflictMap = boolean[][];

export function makeEmptyGrid(): Grid {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0 as CellValue));
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.slice()) as Grid;
}

export function isDigit(n: number): n is Digit {
  return Number.isInteger(n) && n >= 1 && n <= 9;
}

function getBoxStart(i: number): number {
  return Math.floor(i / 3) * 3;
}

export function isValidPlacement(grid: Grid, r: number, c: number, val: Digit): boolean {
  // linha
  for (let cc = 0; cc < 9; cc++) {
    if (cc !== c && grid[r]?.[cc] === val) return false;
  }
  // coluna
  for (let rr = 0; rr < 9; rr++) {
    if (rr !== r && grid[rr]?.[c] === val) return false;
  }
  // bloco 3x3
  const br = getBoxStart(r);
  const bc = getBoxStart(c);
  for (let rr = br; rr < br + 3; rr++) {
    for (let cc = bc; cc < bc + 3; cc++) {
      if ((rr !== r || cc !== c) && grid[rr]?.[cc] === val) return false;
    }
  }
  return true;
}

export function buildConflictMap(grid: Grid): ConflictMap {
  const conflicts: ConflictMap = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => false));

  // Marca células que violam regra.
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = grid[r]?.[c] ?? 0;
      if (v === 0) continue;
      if (!isDigit(v)) continue;
      if (!isValidPlacement(grid, r, c, v)) conflicts[r]![c] = true;
    }
  }

  return conflicts;
}

export function isSolved(grid: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = grid[r]?.[c] ?? 0;
      if (v === 0) return false;
      if (!isDigit(v)) return false;
      if (!isValidPlacement(grid, r, c, v)) return false;
    }
  }
  return true;
}

function findEmpty(grid: Grid): { r: number; c: number } | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if ((grid[r]?.[c] ?? 0) === 0) return { r, c };
    }
  }
  return null;
}

function shuffledDigits(rand: () => number): Digit[] {
  const arr: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

export function solveGrid(grid: Grid, rand: () => number = Math.random): boolean {
  const empty = findEmpty(grid);
  if (!empty) return true;

  const { r, c } = empty;
  const candidates = shuffledDigits(rand);
  for (const d of candidates) {
    if (isValidPlacement(grid, r, c, d)) {
      grid[r]![c] = d;
      if (solveGrid(grid, rand)) return true;
      grid[r]![c] = 0;
    }
  }
  return false;
}

/**
 * Gera um tabuleiro completo (solucionado)
 */
export function generateSolved(rand: () => number = Math.random): Grid {
  const g = makeEmptyGrid();
  // coloca alguns seeds aleatórios pra variar
  // (opcional, mas ajuda a dar diversidade)
  solveGrid(g, rand);
  return g;
}

function countSolutions(grid: Grid, limit: number = 2): number {
  // backtracking contando soluções até "limit"
  const empty = findEmpty(grid);
  if (!empty) return 1;

  const { r, c } = empty;
  let count = 0;

  for (let n = 1; n <= 9; n++) {
    if (!isDigit(n)) continue;
    if (isValidPlacement(grid, r, c, n)) {
      grid[r]![c] = n;
      count += countSolutions(grid, limit);
      if (count >= limit) {
        grid[r]![c] = 0;
        return count;
      }
      grid[r]![c] = 0;
    }
  }
  return count;
}

function removalCountByDifficulty(diff: Difficulty): number {
  // quantos "buracos" abrir (ajuste fino depois)
  if (diff === "easy") return 40;
  if (diff === "medium") return 50;
  return 58; // hard
}

export type NewGame = {
  puzzle: Grid;
  solution: Grid;
  fixed: FixedMap;
};

export function generatePuzzle(diff: Difficulty, rand: () => number = Math.random): NewGame {
  const solution = generateSolved(rand);
  const puzzle = cloneGrid(solution);

  const fixed: FixedMap = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => true));

  const toRemove = removalCountByDifficulty(diff);

  // lista de posições
  const positions: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) positions.push({ r, c });

  // shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = positions[i]!;
    positions[i] = positions[j]!;
    positions[j] = tmp;
  }

  let removed = 0;
  for (const pos of positions) {
    if (removed >= toRemove) break;

    const { r, c } = pos;
    const old = puzzle[r]![c] ?? 0;
    if (old === 0) continue;

    puzzle[r]![c] = 0;
    fixed[r]![c] = false;

    // garante unicidade (ou pelo menos evita múltiplas soluções)
    const probe = cloneGrid(puzzle);
    const solutions = countSolutions(probe, 2);
    if (solutions !== 1) {
      // reverte
      puzzle[r]![c] = old;
      fixed[r]![c] = true;
      continue;
    }

    removed++;
  }

  // recomputa fixed baseado em puzzle final
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      fixed[r]![c] = (puzzle[r]![c] ?? 0) !== 0;
    }
  }

  return { puzzle, solution, fixed };
}
