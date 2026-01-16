export const meta = {
	title: 'Binary Search Tree (BST)',
	what: 'A binary tree where left subtree values are smaller and right subtree values are larger. Search/insert/delete follow one root-to-leaf path, so the cost depends on the tree height. Without balancing, a BST can become a linked list.',
	when: [
		'Need ordered data with inserts/deletes',
		'Need in-order traversal (sorted output)',
		'Range queries (values between A and B)'
	],
	avoid: [
		'Need guaranteed O(log n) without balancing',
		'Input is often sorted or nearly sorted (can skew the tree)'
	],
	time: { best: 'O(1)', avg: 'O(log n) expected', worst: 'O(n)' },
	space: 'O(n)',
	flags: { ordered: true, balanced: false }
};

export const java = `class TreeNode {
    int key;
    TreeNode left;
    TreeNode right;

    TreeNode(int key) {
        this.key = key;
    }
}

public class BinarySearchTree {
    private TreeNode root;

    public BinarySearchTree() {
        reset();
    }

    public void reset() {
        root = null;
        int[] initial = {50, 30, 70, 20, 40, 60, 80};
        for (int i = 0; i < initial.length; i++) {
            root = insert(root, initial[i]);
        }
    }

    public void insert(int key) {
        root = insert(root, key);
    }

    private TreeNode insert(TreeNode node, int key) {
        if (node == null) return new TreeNode(key);
        if (key < node.key) node.left = insert(node.left, key);
        else if (key > node.key) node.right = insert(node.right, key);
        return node;
    }

    public boolean contains(int key) {
        return contains(root, key);
    }

    private boolean contains(TreeNode node, int key) {
        if (node == null) return false;
        if (key == node.key) return true;
        if (key < node.key) return contains(node.left, key);
        return contains(node.right, key);
    }

    public void delete(int key) {
        root = delete(root, key);
    }

    private TreeNode delete(TreeNode node, int key) {
        if (node == null) return null;

        if (key < node.key) {
            node.left = delete(node.left, key);
        } else if (key > node.key) {
            node.right = delete(node.right, key);
        } else {
            if (node.left == null) return node.right;
            if (node.right == null) return node.left;

            TreeNode succ = minNode(node.right);
            node.key = succ.key;
            node.right = delete(node.right, succ.key);
        }
        return node;
    }

    private TreeNode minNode(TreeNode node) {
        while (node.left != null) node = node.left;
        return node;
    }

    public void inorderPrint() {
        inorderPrint(root);
        System.out.println();
    }

    private void inorderPrint(TreeNode node) {
        if (node == null) return;
        inorderPrint(node.left);
        System.out.print(node.key + " ");
        inorderPrint(node.right);
    }
}`;
