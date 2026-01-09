export const meta = {
	title: 'Binary Search Tree (BST)',
	what: 'A binary tree where left subtree values are smaller and right subtree values are larger. Enables fast ordered operations.',
	when: [
		'Need sorted data with dynamic inserts/deletes',
		'Range queries or in-order traversal',
		'Building blocks for maps/sets'
	],
	avoid: [
		'Data is already almost sorted (can become unbalanced)',
		'You need guaranteed O(log n) without balancing'
	],
	time: { best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)' },
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

    public void inorder() {
        inorder(root);
    }

    private void inorder(TreeNode node) {
        if (node == null) return;
        inorder(node.left);
        System.out.print(node.key + " ");
        inorder(node.right);
    }
}`;
