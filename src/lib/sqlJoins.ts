export type JoinKind = "INNER" | "LEFT" | "RIGHT" | "FULL";

export interface StudentRow {
  id: number;
  name: string;
}

export interface ScoreRow {
  studentId: number;
  score: number;
}

export interface ResultRow {
  left: StudentRow | null;
  right: ScoreRow | null;
}

// Deliberately different sample data from the usual users/orders example —
// a classroom roster, which fits a teaching channel.
export const STUDENTS: StudentRow[] = [
  { id: 101, name: "Ayan" },
  { id: 102, name: "Bithi" },
  { id: 103, name: "Rafi" },
];

export const SCORES: ScoreRow[] = [
  { studentId: 101, score: 88 },
  { studentId: 102, score: 74 },
  { studentId: 105, score: 91 },
];

export interface JoinSpec {
  kind: JoinKind;
  label: string;
  keyword: string;
  tagline: string;
  /** Plain-language rule, shown under the heading. */
  rule: string;
}

export const JOINS: JoinSpec[] = [
  {
    kind: "INNER",
    label: "INNER JOIN",
    keyword: "INNER JOIN",
    tagline: "only the pairs",
    rule: "Keeps a row only when both sides match",
  },
  {
    kind: "LEFT",
    label: "LEFT JOIN",
    keyword: "LEFT JOIN",
    tagline: "every student",
    rule: "Keeps every students row, matched or not",
  },
  {
    kind: "RIGHT",
    label: "RIGHT JOIN",
    keyword: "RIGHT JOIN",
    tagline: "every score",
    rule: "Keeps every scores row, matched or not",
  },
  {
    kind: "FULL",
    label: "FULL OUTER JOIN",
    keyword: "FULL OUTER JOIN",
    tagline: "nothing dropped",
    rule: "Keeps everything from both sides",
  },
];

export const matchOf = (student: StudentRow): ScoreRow | undefined =>
  SCORES.find((s) => s.studentId === student.id);

export const isLeftMatched = (student: StudentRow): boolean => matchOf(student) !== undefined;

export const isRightMatched = (score: ScoreRow): boolean =>
  STUDENTS.some((s) => s.id === score.studentId);

/** Rows the given join produces, in the order they should land. */
export function resultRowsFor(kind: JoinKind): ResultRow[] {
  const matched: ResultRow[] = STUDENTS.filter(isLeftMatched).map((s) => ({
    left: s,
    right: matchOf(s) ?? null,
  }));

  const leftOnly: ResultRow[] = STUDENTS.filter((s) => !isLeftMatched(s)).map((s) => ({
    left: s,
    right: null,
  }));

  const rightOnly: ResultRow[] = SCORES.filter((s) => !isRightMatched(s)).map((s) => ({
    left: null,
    right: s,
  }));

  switch (kind) {
    case "INNER":
      return matched;
    case "LEFT":
      return [...matched, ...leftOnly];
    case "RIGHT":
      return [...matched, ...rightOnly];
    case "FULL":
      return [...matched, ...leftOnly, ...rightOnly];
  }
}

/** Whether this join keeps unmatched rows from each side. */
export function keepsUnmatched(kind: JoinKind): { left: boolean; right: boolean } {
  return {
    left: kind === "LEFT" || kind === "FULL",
    right: kind === "RIGHT" || kind === "FULL",
  };
}

export const rowCountFor = (kind: JoinKind): number => resultRowsFor(kind).length;

export const sqlFor = (spec: JoinSpec): { before: string; keyword: string; after: string } => ({
  before: "SELECT * FROM students s ",
  keyword: spec.keyword,
  after: " scores c ON s.id = c.student_id",
});
