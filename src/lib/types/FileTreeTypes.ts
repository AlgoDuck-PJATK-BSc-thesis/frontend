
interface FileTreeNode {
    depth: number;
    label: string;
}

export interface FileTreeRootType extends FileTreeNode {
    nearRootBranches?: FileTreeBranchType[];
}

export interface FileTreeBranchType extends FileTreeNode {
    branchingBranches?: FileTreeBranchType[];
    leaves?: FileTreeLeafType[];
}

export interface FileTreeLeafType extends FileTreeNode {
    selectObject: (event: MouseEvent) => void;
}