export type NodeId = number;

export interface TreeNode {
  id: NodeId;
  value: number;
  left: NodeId | null;
  right: NodeId | null;
}

export type NodeState = "idle" | "active" | "swapping" | "done";

export interface Placed {
  id: NodeId;
  value: number;
  x: number;
  y: number;
  state: NodeState;
}

export interface Edge {
  from: NodeId;
  to: NodeId;
}

export type StepKind =
  | "enter"
  | "nullcheck"
  | "goleft"
  | "goright"
  | "swap"
  | "return"
  | "finish";

export interface TreeStep {
  nodes: Placed[];
  edges: Edge[];
  /** Values on the call stack, root-first. */
  stack: number[];
  activeLine: number;
  caption: string;
  kind: StepKind;
}

// --- Canvas geometry -------------------------------------------------------
export const CANVAS_W = 1000;
export const LEVEL_Y = [70, 225, 380];
export const CANVAS_H = 460;
const MARGIN = 78;

// --- The tree --------------------------------------------------------------
// A small 7-node tree keeps every node readable on a phone screen while
// still showing two full levels of recursion.
const build = (): Map<NodeId, TreeNode> => {
  const m = new Map<NodeId, TreeNode>();
  const add = (id: NodeId, value: number, left: NodeId | null, right: NodeId | null) =>
    m.set(id, { id, value, left, right });
  add(0, 5, 1, 2);
  add(1, 3, 3, 4);
  add(2, 8, 5, 6);
  add(3, 1, null, null);
  add(4, 4, null, null);
  add(5, 7, null, null);
  add(6, 9, null, null);
  return m;
};

export const ROOT: NodeId = 0;

/**
 * In-order x placement: a node's horizontal slot is its position in an
 * in-order walk of the *current* tree. Because swapping children reverses
 * that walk for the affected subtree, mirrored nodes slide to mirrored
 * positions automatically — no special-case animation code needed.
 */
function layout(tree: Map<NodeId, TreeNode>): Map<NodeId, { x: number; y: number }> {
  const pos = new Map<NodeId, { x: number; y: number }>();
  const order: { id: NodeId; depth: number }[] = [];

  const walk = (id: NodeId | null, depth: number) => {
    if (id === null) return;
    const n = tree.get(id)!;
    walk(n.left, depth + 1);
    order.push({ id, depth });
    walk(n.right, depth + 1);
  };
  walk(ROOT, 0);

  const step = order.length > 1 ? (CANVAS_W - MARGIN * 2) / (order.length - 1) : 0;
  order.forEach((o, i) => {
    pos.set(o.id, { x: MARGIN + i * step, y: LEVEL_Y[Math.min(o.depth, LEVEL_Y.length - 1)] });
  });
  return pos;
}

function edgesOf(tree: Map<NodeId, TreeNode>): Edge[] {
  const out: Edge[] = [];
  tree.forEach((n) => {
    if (n.left !== null) out.push({ from: n.id, to: n.left });
    if (n.right !== null) out.push({ from: n.id, to: n.right });
  });
  return out;
}

/**
 * Walks the exact recursion of the C++ `invertTree` below, emitting one
 * step per meaningful moment. Precomputed once so the composition stays a
 * pure function of frame -> step index.
 */
export function buildTreeTrace(): TreeStep[] {
  const tree = build();
  const steps: TreeStep[] = [];
  const stack: number[] = [];
  const states = new Map<NodeId, NodeState>();
  tree.forEach((n) => states.set(n.id, "idle"));

  const snap = (activeLine: number, caption: string, kind: StepKind, override?: Map<NodeId, NodeState>) => {
    const pos = layout(tree);
    const useStates = override ?? states;
    steps.push({
      nodes: Array.from(tree.values()).map((n) => ({
        id: n.id,
        value: n.value,
        x: pos.get(n.id)!.x,
        y: pos.get(n.id)!.y,
        state: useStates.get(n.id) ?? "idle",
      })),
      edges: edgesOf(tree),
      stack: [...stack],
      activeLine,
      caption,
      kind,
    });
  };

  const invert = (id: NodeId) => {
    const node = tree.get(id)!;
    stack.push(node.value);
    states.set(id, "active");
    snap(2, `Enter node ${node.value}. Not null, keep going.`, "enter");

    // A null child is one beat, not two — "recurse" and "immediately
    // return" would otherwise eat half the runtime on empty branches.
    const descend = (child: NodeId | null, side: "left" | "right") => {
      const line = side === "left" ? 3 : 4;
      if (child === null) {
        snap(2, `${node.value}'s ${side} is null — return.`, "nullcheck");
        return;
      }
      snap(line, `Recurse into ${node.value}'s ${side} subtree.`, side === "left" ? "goleft" : "goright");
      invert(child);
    };

    descend(node.left, "left");
    descend(node.right, "right");

    // Show the swap moment with both children flashing, then commit it.
    const flash = new Map(states);
    if (node.left !== null) flash.set(node.left, "swapping");
    if (node.right !== null) flash.set(node.right, "swapping");
    snap(5, `Swap ${node.value}'s two children.`, "swap", flash);

    const t = node.left;
    node.left = node.right;
    node.right = t;

    states.set(id, "done");
    stack.pop();
    snap(6, `Node ${node.value} is mirrored. Return.`, "return");
  };

  invert(ROOT);

  const final = steps[steps.length - 1];
  steps.push({
    ...final,
    nodes: final.nodes.map((n) => ({ ...n, state: "done" })),
    stack: [],
    activeLine: 6,
    caption: "Whole tree mirrored.",
    kind: "finish",
  });

  return steps;
}

// --- C++ source shown in the panel ----------------------------------------
export interface CodeLine {
  id: number;
  text: string;
}

export const CPP_LINES: CodeLine[] = [
  { id: 1, text: "TreeNode* invertTree(TreeNode* root) {" },
  { id: 2, text: "    if (!root) return nullptr;" },
  { id: 3, text: "    invertTree(root->left);" },
  { id: 4, text: "    invertTree(root->right);" },
  { id: 5, text: "    swap(root->left, root->right);" },
  { id: 6, text: "    return root;" },
  { id: 7, text: "}" },
];
