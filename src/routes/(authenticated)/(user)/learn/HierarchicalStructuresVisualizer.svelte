<script lang="ts">
	import { Plus, RotateCcw } from 'lucide-svelte';

	type BstNode = {
		value: number;
		left: BstNode | null;
		right: BstNode | null;
	};

	type PositionedNode = {
		x: number;
		y: number;
		value: number;
		key: string;
	};

	type Edge = {
		fromX: number;
		fromY: number;
		toX: number;
		toY: number;
	};

	let bstTree: BstNode = {
		value: 50,
		left: {
			value: 30,
			left: { value: 20, left: null, right: null },
			right: { value: 40, left: null, right: null }
		},
		right: {
			value: 70,
			left: { value: 60, left: null, right: null },
			right: { value: 80, left: null, right: null }
		}
	};
	let bstInput = '';

	let minHeap: number[] = [10, 20, 15, 30, 40, 50, 100];
	let minHeapInput = '';

	let maxHeap: number[] = [100, 70, 90, 40, 30, 60, 80];
	let maxHeapInput = '';

	const graph = {
		A: ['B', 'D'],
		B: ['A', 'C', 'E'],
		C: ['B', 'F'],
		D: ['A', 'E', 'G'],
		E: ['B', 'D', 'H'],
		F: ['C', 'H'],
		G: ['D', 'H'],
		H: ['E', 'F', 'G']
	};

	let trieWords: string[] = ['cat', 'car', 'card', 'care', 'dog', 'dodge'].sort((a, b) =>
		a.localeCompare(b)
	);
	let trieInput = '';

	let bstNodes: PositionedNode[] = [];
	let bstEdges: Edge[] = [];

	let minHeapNodes: PositionedNode[] = [];
	let minHeapEdges: Edge[] = [];

	let maxHeapNodes: PositionedNode[] = [];
	let maxHeapEdges: Edge[] = [];

	function resetBst() {
		bstTree = {
			value: 50,
			left: {
				value: 30,
				left: { value: 20, left: null, right: null },
				right: { value: 40, left: null, right: null }
			},
			right: {
				value: 70,
				left: { value: 60, left: null, right: null },
				right: { value: 80, left: null, right: null }
			}
		};
	}

	function insertBstNode(node: BstNode | null, value: number): BstNode {
		if (!node) {
			return { value, left: null, right: null };
		}
		if (value < node.value) {
			return { ...node, left: insertBstNode(node.left, value) };
		}
		if (value > node.value) {
			return { ...node, right: insertBstNode(node.right, value) };
		}
		return node;
	}

	function layoutBst(
		node: BstNode | null,
		x: number,
		y: number,
		level: number,
		offset: number,
		parent?: { x: number; y: number }
	) {
		if (!node) return;
		const key = `${x}-${y}-${node.value}-${level}`;
		bstNodes.push({ x, y, value: node.value, key });
		if (parent) {
			bstEdges.push({
				fromX: parent.x,
				fromY: parent.y + 15,
				toX: x,
				toY: y - 15
			});
		}
		const childY = y + 80;
		const leftX = x - offset / (level + 1);
		const rightX = x + offset / (level + 1);
		if (node.left) {
			layoutBst(node.left, leftX, childY, level + 1, offset, { x, y });
		}
		if (node.right) {
			layoutBst(node.right, rightX, childY, level + 1, offset, { x, y });
		}
	}

	function computeHeapLayout(values: number[]): { nodes: PositionedNode[]; edges: Edge[] } {
		const nodes: PositionedNode[] = [];
		const edges: Edge[] = [];
		for (let i = 0; i < values.length; i++) {
			const level = Math.floor(Math.log2(i + 1));
			const posInLevel = i - (Math.pow(2, level) - 1);
			const totalInLevel = Math.pow(2, level);
			const spacing = 600 / (totalInLevel + 1);
			const x = 100 + spacing * (posInLevel + 1);
			const y = 60 + level * 80;
			if (i > 0) {
				const parentIdx = Math.floor((i - 1) / 2);
				const parentLevel = Math.floor(Math.log2(parentIdx + 1));
				const parentPosInLevel = parentIdx - (Math.pow(2, parentLevel) - 1);
				const parentTotalInLevel = Math.pow(2, parentLevel);
				const parentSpacing = 600 / (parentTotalInLevel + 1);
				const parentX = 100 + parentSpacing * (parentPosInLevel + 1);
				const parentY = 60 + parentLevel * 80;
				edges.push({
					fromX: parentX,
					fromY: parentY + 26,
					toX: x,
					toY: y - 26
				});
			}
			const key = `${i}-${x}-${y}-${values[i]}`;
			nodes.push({ x, y, value: values[i], key });
		}
		return { nodes, edges };
	}

	function insertIntoMinHeap(value: number) {
		const heap = [...minHeap];
		heap.push(value);
		let index = heap.length - 1;
		while (index > 0) {
			const parent = Math.floor((index - 1) / 2);
			if (heap[index] < heap[parent]) {
				const temp = heap[index];
				heap[index] = heap[parent];
				heap[parent] = temp;
				index = parent;
			} else {
				break;
			}
		}
		minHeap = heap;
	}

	function extractFromMinHeap() {
		if (minHeap.length === 0) {
			return;
		}
		if (minHeap.length === 1) {
			minHeap = [];
			return;
		}
		const heap = [...minHeap];
		heap[0] = heap[heap.length - 1];
		heap.pop();
		let index = 0;
		const length = heap.length;
		while (true) {
			const left = 2 * index + 1;
			const right = 2 * index + 2;
			let smallest = index;
			if (left < length && heap[left] < heap[smallest]) {
				smallest = left;
			}
			if (right < length && heap[right] < heap[smallest]) {
				smallest = right;
			}
			if (smallest !== index) {
				const temp = heap[index];
				heap[index] = heap[smallest];
				heap[smallest] = temp;
				index = smallest;
			} else {
				break;
			}
		}
		minHeap = heap;
	}

	function insertIntoMaxHeap(value: number) {
		const heap = [...maxHeap];
		heap.push(value);
		let index = heap.length - 1;
		while (index > 0) {
			const parent = Math.floor((index - 1) / 2);
			if (heap[index] > heap[parent]) {
				const temp = heap[index];
				heap[index] = heap[parent];
				heap[parent] = temp;
				index = parent;
			} else {
				break;
			}
		}
		maxHeap = heap;
	}

	function extractFromMaxHeap() {
		if (maxHeap.length === 0) {
			return;
		}
		if (maxHeap.length === 1) {
			maxHeap = [];
			return;
		}
		const heap = [...maxHeap];
		heap[0] = heap[heap.length - 1];
		heap.pop();
		let index = 0;
		const length = heap.length;
		while (true) {
			const left = 2 * index + 1;
			const right = 2 * index + 2;
			let largest = index;
			if (left < length && heap[left] > heap[largest]) {
				largest = left;
			}
			if (right < length && heap[right] > heap[largest]) {
				largest = right;
			}
			if (largest !== index) {
				const temp = heap[index];
				heap[index] = heap[largest];
				heap[largest] = temp;
				index = largest;
			} else {
				break;
			}
		}
		maxHeap = heap;
	}

	$: {
		bstNodes = [];
		bstEdges = [];
		layoutBst(bstTree, 450, 50, 0, 260);
	}

	$: ({ nodes: minHeapNodes, edges: minHeapEdges } = computeHeapLayout(minHeap));
	$: ({ nodes: maxHeapNodes, edges: maxHeapEdges } = computeHeapLayout(maxHeap));

	const bstJava = `class TreeNode {
    int data;
    TreeNode left, right;

    public TreeNode(int data) {
        this.data = data;
        this.left = null;
        this.right = null;
    }
}

public class BinarySearchTree {
    private TreeNode root;

    public BinarySearchTree() {
        this.root = null;
    }

    public void insert(int data) {
        root = insertRec(root, data);
    }

    private TreeNode insertRec(TreeNode root, int data) {
        if (root == null) {
            root = new TreeNode(data);
            return root;
        }

        if (data < root.data) {
            root.left = insertRec(root.left, data);
        } else if (data > root.data) {
            root.right = insertRec(root.right, data);
        }

        return root;
    }

    public boolean search(int data) {
        return searchRec(root, data);
    }

    private boolean searchRec(TreeNode root, int data) {
        if (root == null) return false;
        if (root.data == data) return true;

        if (data < root.data) {
            return searchRec(root.left, data);
        }
        return searchRec(root.right, data);
    }

    public void inorder() {
        inorderRec(root);
    }

    private void inorderRec(TreeNode root) {
        if (root != null) {
            inorderRec(root.left);
            System.out.print(root.data + " ");
            inorderRec(root.right);
        }
    }

    public void delete(int data) {
        root = deleteRec(root, data);
    }

    private TreeNode deleteRec(TreeNode root, int data) {
        if (root == null) return root;

        if (data < root.data) {
            root.left = deleteRec(root.left, data);
        } else if (data > root.data) {
            root.right = deleteRec(root.right, data);
        } else {
            if (root.left == null) return root.right;
            if (root.right == null) return root.left;

            root.data = minValue(root.right);
            root.right = deleteRec(root.right, root.data);
        }
        return root;
    }

    private int minValue(TreeNode root) {
        int min = root.data;
        while (root.left != null) {
            min = root.left.data;
            root = root.left;
        }
        return min;
    }
}`;

	const heapJava = `public class MinHeap {
    private int[] heap;
    private int size;
    private int capacity;

    public MinHeap(int capacity) {
        this.capacity = capacity;
        this.size = 0;
        this.heap = new int[capacity];
    }

    private int parent(int i) { return (i - 1) / 2; }
    private int leftChild(int i) { return 2 * i + 1; }
    private int rightChild(int i) { return 2 * i + 2; }

    private void swap(int i, int j) {
        int temp = heap[i];
        heap[i] = heap[j];
        heap[j] = temp;
    }

    public void insert(int value) {
        if (size == capacity) {
            throw new RuntimeException("Heap is full");
        }

        heap[size] = value;
        int current = size;
        size++;

        while (current != 0 && heap[current] < heap[parent(current)]) {
            swap(current, parent(current));
            current = parent(current);
        }
    }

    public int extractMin() {
        if (size <= 0) {
            throw new RuntimeException("Heap is empty");
        }
        if (size == 1) {
            size--;
            return heap[0];
        }

        int root = heap[0];
        heap[0] = heap[size - 1];
        size--;
        heapify(0);

        return root;
    }

    private void heapify(int i) {
        int left = leftChild(i);
        int right = rightChild(i);
        int smallest = i;

        if (left < size && heap[left] < heap[smallest]) {
            smallest = left;
        }
        if (right < size && heap[right] < heap[smallest]) {
            smallest = right;
        }

        if (smallest != i) {
            swap(i, smallest);
            heapify(smallest);
        }
    }

    public int peek() {
        if (size <= 0) {
            throw new RuntimeException("Heap is empty");
        }
        return heap[0];
    }

    public int size() {
        return size;
    }

    public boolean isEmpty() {
        return size == 0;
    }
}`;

	const maxHeapJava = `public class MaxHeap {
    private int[] heap;
    private int size;
    private int capacity;

    public MaxHeap(int capacity) {
        this.capacity = capacity;
        this.size = 0;
        this.heap = new int[capacity];
    }

    private int parent(int i) { return (i - 1) / 2; }
    private int leftChild(int i) { return 2 * i + 1; }
    private int rightChild(int i) { return 2 * i + 2; }

    private void swap(int i, int j) {
        int temp = heap[i];
        heap[i] = heap[j];
        heap[j] = temp;
    }

    public void insert(int value) {
        if (size == capacity) {
            throw new RuntimeException("Heap is full");
        }

        heap[size] = value;
        int current = size;
        size++;

        while (current != 0 && heap[current] > heap[parent(current)]) {
            swap(current, parent(current));
            current = parent(current);
        }
    }

    public int extractMax() {
        if (size <= 0) {
            throw new RuntimeException("Heap is empty");
        }
        if (size == 1) {
            size--;
            return heap[0];
        }

        int root = heap[0];
        heap[0] = heap[size - 1];
        size--;
        heapify(0);

        return root;
    }

    private void heapify(int i) {
        int left = leftChild(i);
        int right = rightChild(i);
        int largest = i;

        if (left < size && heap[left] > heap[largest]) {
            largest = left;
        }
        if (right < size && heap[right] > heap[largest]) {
            largest = right;
        }

        if (largest != i) {
            swap(i, largest);
            heapify(largest);
        }
    }

    public int peek() {
        if (size <= 0) {
            throw new RuntimeException("Heap is empty");
        }
        return heap[0];
    }

    public int size() {
        return size;
    }

    public boolean isEmpty() {
        return size == 0;
    }
}`;

	const graphJava = `import java.util.*;

public class Graph {
    private Map<Integer, List<Integer>> adjList;

    public Graph() {
        adjList = new HashMap<>();
    }

    public void addVertex(int vertex) {
        adjList.putIfAbsent(vertex, new ArrayList<>());
    }

    public void addEdge(int v1, int v2) {
        adjList.putIfAbsent(v1, new ArrayList<>());
        adjList.putIfAbsent(v2, new ArrayList<>());
        adjList.get(v1).add(v2);
        adjList.get(v2).add(v1);
    }

    public void removeEdge(int v1, int v2) {
        List<Integer> v1Neighbors = adjList.get(v1);
        List<Integer> v2Neighbors = adjList.get(v2);
        if (v1Neighbors != null) v1Neighbors.remove(Integer.valueOf(v2));
        if (v2Neighbors != null) v2Neighbors.remove(Integer.valueOf(v1));
    }

    public void removeVertex(int vertex) {
        List<Integer> neighbors = adjList.get(vertex);
        if (neighbors != null) {
            for (int neighbor : neighbors) {
                List<Integer> list = adjList.get(neighbor);
                if (list != null) {
                    list.remove(Integer.valueOf(vertex));
                }
            }
        }
        adjList.remove(vertex);
    }

    public void bfs(int start) {
        if (!adjList.containsKey(start)) {
            return;
        }
        Set<Integer> visited = new HashSet<>();
        Queue<Integer> queue = new LinkedList<>();

        visited.add(start);
        queue.offer(start);

        while (!queue.isEmpty()) {
            int vertex = queue.poll();
            System.out.print(vertex + " ");

            for (int neighbor : adjList.getOrDefault(vertex, Collections.emptyList())) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    queue.offer(neighbor);
                }
            }
        }
    }

    public void dfs(int start) {
        if (!adjList.containsKey(start)) {
            return;
        }
        Set<Integer> visited = new HashSet<>();
        dfsHelper(start, visited);
    }

    private void dfsHelper(int vertex, Set<Integer> visited) {
        visited.add(vertex);
        System.out.print(vertex + " ");

        for (int neighbor : adjList.getOrDefault(vertex, Collections.emptyList())) {
            if (!visited.contains(neighbor)) {
                dfsHelper(neighbor, visited);
            }
        }
    }

    public boolean hasPath(int v1, int v2) {
        if (!adjList.containsKey(v1) || !adjList.containsKey(v2)) {
            return false;
        }
        Set<Integer> visited = new HashSet<>();
        return hasPathHelper(v1, v2, visited);
    }

    private boolean hasPathHelper(int current, int target, Set<Integer> visited) {
        if (current == target) return true;
        visited.add(current);

        for (int neighbor : adjList.getOrDefault(current, Collections.emptyList())) {
            if (!visited.contains(neighbor)) {
                if (hasPathHelper(neighbor, target, visited)) {
                    return true;
                }
            }
        }
        return false;
    }
}`;

	const trieJava = `import java.util.*;

class TrieNode {
    Map<Character, TrieNode> children;
    boolean isEndOfWord;

    public TrieNode() {
        children = new HashMap<>();
        isEndOfWord = false;
    }
}

public class Trie {
    private TrieNode root;

    public Trie() {
        root = new TrieNode();
    }

    public void insert(String word) {
        TrieNode current = root;

        for (char ch : word.toCharArray()) {
            current.children.putIfAbsent(ch, new TrieNode());
            current = current.children.get(ch);
        }

        current.isEndOfWord = true;
    }

    public boolean search(String word) {
        TrieNode current = root;

        for (char ch : word.toCharArray()) {
            current = current.children.get(ch);
            if (current == null) {
                return false;
            }
        }

        return current.isEndOfWord;
    }

    public boolean startsWith(String prefix) {
        TrieNode current = root;

        for (char ch : prefix.toCharArray()) {
            current = current.children.get(ch);
            if (current == null) {
                return false;
            }
        }

        return true;
    }

    public void delete(String word) {
        deleteHelper(root, word, 0);
    }

    private boolean deleteHelper(TrieNode current, String word, int index) {
        if (index == word.length()) {
            if (!current.isEndOfWord) {
                return false;
            }
            current.isEndOfWord = false;
            return current.children.isEmpty();
        }

        char ch = word.charAt(index);
        TrieNode node = current.children.get(ch);
        if (node == null) {
            return false;
        }

        boolean shouldDeleteCurrentNode = deleteHelper(node, word, index + 1);

        if (shouldDeleteCurrentNode) {
            current.children.remove(ch);
            return current.children.isEmpty() && !current.isEndOfWord;
        }

        return false;
    }

    public List<String> autocomplete(String prefix) {
        List<String> results = new ArrayList<>();
        TrieNode current = root;

        for (char ch : prefix.toCharArray()) {
            current = current.children.get(ch);
            if (current == null) {
                return results;
            }
        }

        findAllWords(current, prefix, results);
        return results;
    }

    private void findAllWords(TrieNode node, String prefix, List<String> results) {
        if (node.isEndOfWord) {
            results.add(prefix);
        }

        for (Map.Entry<Character, TrieNode> entry : node.children.entrySet()) {
            findAllWords(entry.getValue(), prefix + entry.getKey(), results);
        }
    }
}`;

	const hashTableJava = `import java.util.*;

public class HashTable {
    private static final int SIZE = 10;
    private LinkedList<Entry>[] table;

    static class Entry {
        String key;
        int value;

        public Entry(String key, int value) {
            this.key = key;
            this.value = value;
        }
    }

    @SuppressWarnings("unchecked")
    public HashTable() {
        table = new LinkedList[SIZE];
        for (int i = 0; i < SIZE; i++) {
            table[i] = new LinkedList<>();
        }
    }

    private int hash(String key) {
        return Math.abs(key.hashCode() % SIZE);
    }

    public void put(String key, int value) {
        int index = hash(key);
        LinkedList<Entry> bucket = table[index];

        for (Entry entry : bucket) {
            if (entry.key.equals(key)) {
                entry.value = value;
                return;
            }
        }

        bucket.add(new Entry(key, value));
    }

    public Integer get(String key) {
        int index = hash(key);
        LinkedList<Entry> bucket = table[index];

        for (Entry entry : bucket) {
            if (entry.key.equals(key)) {
                return entry.value;
            }
        }

        return null;
    }

    public void remove(String key) {
        int index = hash(key);
        LinkedList<Entry> bucket = table[index];

        bucket.removeIf(entry -> entry.key.equals(key));
    }

    public boolean containsKey(String key) {
        return get(key) != null;
    }

    public int size() {
        int count = 0;
        for (LinkedList<Entry> bucket : table) {
            count += bucket.size();
        }
        return count;
    }
}`;
</script>

<section class="space-y-10">
	<h2 class="text-2xl font-bold text-white md:text-3xl">
		Hierarchical & Non-Linear Data Structures
	</h2>

	<div
		id="bst"
		class="space-y-6 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg md:p-8"
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500 font-semibold text-white"
			>
				1
			</div>
			<div>
				<h3 class="text-xl font-bold text-white md:text-2xl">Binary Search Tree</h3>
				<p class="text-sm text-slate-200">Interactive visual tree with nodes and connections.</p>
			</div>
		</div>

		<div class="overflow-x-auto rounded-xl bg-slate-800/50 p-6">
			<svg
				viewBox="-200 0 1300 800"
				class="mx-auto h-[26rem] w-full min-w-[52rem]"
				preserveAspectRatio="xMidYMin meet"
			>
				<defs>
					<linearGradient id="treeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stop-color="#a78bfa" />
						<stop offset="100%" stop-color="#7c3aed" />
					</linearGradient>
				</defs>
				{#each bstEdges as edge}
					<line
						x1={edge.fromX}
						y1={edge.fromY}
						x2={edge.toX}
						y2={edge.toY}
						stroke="#8b5cf6"
						stroke-width="2"
					/>
				{/each}
				{#each bstNodes as node}
					<g>
						<circle
							cx={node.x}
							cy={node.y}
							r="30"
							fill="url(#treeGradient)"
							stroke="#a78bfa"
							stroke-width="2"
						/>
						<text
							x={node.x}
							y={node.y + 6}
							text-anchor="middle"
							fill="white"
							font-size="18"
							font-weight="bold"
						>
							{node.value}
						</text>
					</g>
				{/each}
			</svg>
			<div class="mt-6 flex flex-wrap justify-center gap-3">
				<input
					type="number"
					bind:value={bstInput}
					placeholder="Value"
					class="w-32 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white"
				/>
				<button
					onclick={() => {
						if (bstInput) {
							const value = parseInt(bstInput, 10);
							if (!Number.isNaN(value)) {
								bstTree = insertBstNode(bstTree, value);
							}
							bstInput = '';
						}
					}}
					class="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white hover:bg-purple-700"
				>
					<Plus size={18} />
					Insert
				</button>
				<button
					onclick={() => {
						resetBst();
						bstInput = '';
					}}
					class="flex items-center gap-2 rounded-lg bg-gray-600 px-6 py-2 font-semibold text-white hover:bg-gray-700"
				>
					<RotateCcw size={18} />
					Reset
				</button>
			</div>
		</div>

		<div id="bst-java" class="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
			<h4 class="mb-6 text-lg font-semibold text-white">Java Implementation</h4>
			<pre class="overflow-x-auto text-xs text-gray-300 md:text-sm">
        <code>{bstJava}</code>
      </pre>
		</div>
	</div>

	<div
		id="heap"
		class="space-y-6 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg md:p-8"
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 font-semibold text-white"
			>
				2
			</div>
			<div>
				<h3 class="text-xl font-bold text-white md:text-2xl">Min Heap</h3>
				<p class="text-sm text-slate-200">Array-based min heap with tree visualization.</p>
			</div>
		</div>

		<div class="overflow-x-auto rounded-xl bg-slate-800/50 p-6">
			<svg
				viewBox="0 0 900 600"
				class="mx-auto h-[28rem] w-full min-w-[52rem]"
				preserveAspectRatio="xMidYMin meet"
			>
				<defs>
					<linearGradient id="heapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stop-color="#fbbf24" />
						<stop offset="100%" stop-color="#f59e0b" />
					</linearGradient>
				</defs>
				{#each minHeapEdges as edge}
					<line
						x1={edge.fromX}
						y1={edge.fromY}
						x2={edge.toX}
						y2={edge.toY}
						stroke="#f59e0b"
						stroke-width="2"
					/>
				{/each}
				{#each minHeapNodes as node}
					<g>
						<circle
							cx={node.x}
							cy={node.y}
							r="24"
							fill="url(#heapGradient)"
							stroke="#fbbf24"
							stroke-width="2"
						/>
						<text
							x={node.x}
							y={node.y + 6}
							text-anchor="middle"
							fill="white"
							font-size="16"
							font-weight="bold"
						>
							{node.value}
						</text>
					</g>
				{/each}
			</svg>
			<div class="mt-6 text-center">
				<div class="mb-4 text-sm text-orange-300">
					Array representation: [{minHeap.join(', ')}]
				</div>
				<div class="flex flex-wrap justify-center gap-3">
					<input
						type="number"
						bind:value={minHeapInput}
						placeholder="Value"
						class="w-32 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white"
					/>
					<button
						onclick={() => {
							if (minHeapInput) {
								const value = parseInt(minHeapInput, 10);
								if (!Number.isNaN(value)) {
									insertIntoMinHeap(value);
								}
								minHeapInput = '';
							}
						}}
						class="rounded-lg bg-orange-600 px-6 py-2 font-semibold text-white hover:bg-orange-700"
					>
						Insert
					</button>
					<button
						onclick={() => {
							extractFromMinHeap();
						}}
						class="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700"
					>
						Extract Min
					</button>
					<button
						onclick={() => {
							minHeap = [10, 20, 15, 30, 40, 50, 100];
							minHeapInput = '';
						}}
						class="rounded-lg bg-gray-600 px-6 py-2 font-semibold text-white hover:bg-gray-700"
					>
						Reset
					</button>
				</div>
			</div>
		</div>

		<div id="heap-java" class="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
			<h4 class="mb-6 text-lg font-semibold text-white">Java Implementation (Min Heap)</h4>
			<pre class="overflow-x-auto text-xs text-gray-300 md:text-sm">
        <code>{heapJava}</code>
      </pre>
		</div>
	</div>

	<div
		id="max-heap"
		class="space-y-6 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg md:p-8"
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 font-semibold text-white"
			>
				3
			</div>
			<div>
				<h3 class="text-xl font-bold text-white md:text-2xl">Max Heap</h3>
				<p class="text-sm text-slate-200">
					Array-based max heap using the same tree layout, colored like the stack.
				</p>
			</div>
		</div>

		<div class="overflow-x-auto rounded-xl bg-slate-800/50 p-6">
			<svg
				viewBox="0 0 900 600"
				class="mx-auto h-[28rem] w-full min-w-[52rem]"
				preserveAspectRatio="xMidYMin meet"
			>
				<defs>
					<linearGradient id="maxHeapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stop-color="#38bdf8" />
						<stop offset="100%" stop-color="#0ea5e9" />
					</linearGradient>
				</defs>
				{#each maxHeapEdges as edge}
					<line
						x1={edge.fromX}
						y1={edge.fromY}
						x2={edge.toX}
						y2={edge.toY}
						stroke="#38bdf8"
						stroke-width="2"
					/>
				{/each}
				{#each maxHeapNodes as node}
					<g>
						<circle
							cx={node.x}
							cy={node.y}
							r="24"
							fill="url(#maxHeapGradient)"
							stroke="#38bdf8"
							stroke-width="2"
						/>
						<text
							x={node.x}
							y={node.y + 6}
							text-anchor="middle"
							fill="white"
							font-size="16"
							font-weight="bold"
						>
							{node.value}
						</text>
					</g>
				{/each}
			</svg>
			<div class="mt-6 text-center">
				<div class="mb-4 text-sm text-sky-300">
					Array representation: [{maxHeap.join(', ')}]
				</div>
				<div class="flex flex-wrap justify-center gap-3">
					<input
						type="number"
						bind:value={maxHeapInput}
						placeholder="Value"
						class="w-32 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white"
					/>
					<button
						onclick={() => {
							if (maxHeapInput) {
								const value = parseInt(maxHeapInput, 10);
								if (!Number.isNaN(value)) {
									insertIntoMaxHeap(value);
								}
								maxHeapInput = '';
							}
						}}
						class="rounded-lg bg-sky-600 px-6 py-2 font-semibold text-white hover:bg-sky-700"
					>
						Insert
					</button>
					<button
						onclick={() => {
							extractFromMaxHeap();
						}}
						class="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700"
					>
						Extract Max
					</button>
					<button
						onclick={() => {
							maxHeap = [100, 70, 90, 40, 30, 60, 80];
							maxHeapInput = '';
						}}
						class="rounded-lg bg-gray-600 px-6 py-2 font-semibold text-white hover:bg-gray-700"
					>
						Reset
					</button>
				</div>
			</div>
		</div>

		<div id="max-heap-java" class="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
			<h4 class="mb-6 text-lg font-semibold text-white">Java Implementation (Max Heap)</h4>
			<pre class="overflow-x-auto text-xs text-gray-300 md:text-sm">
        <code>{maxHeapJava}</code>
      </pre>
		</div>
	</div>

	<div
		id="graph"
		class="space-y-6 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg md:p-8"
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 font-semibold text-white"
			>
				4
			</div>
			<div>
				<h3 class="text-xl font-bold text-white md:text-2xl">Graph (Undirected)</h3>
				<p class="text-sm text-slate-200">
					Medium-sized undirected graph with 8 vertices, multiple paths and cycles, and its
					adjacency list representation.
				</p>
			</div>
		</div>

		<div class="rounded-xl bg-slate-800/50 p-6">
			<svg width="620" height="420" class="mx-auto">
				<defs>
					<linearGradient id="graphGradient" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stop-color="#06b6d4" />
						<stop offset="100%" stop-color="#0891b2" />
					</linearGradient>
				</defs>

				<line x1="150" y1="80" x2="300" y2="80" stroke="#22d3ee" stroke-width="2" />
				<line x1="300" y1="80" x2="450" y2="80" stroke="#22d3ee" stroke-width="2" />
				<line x1="150" y1="80" x2="100" y2="220" stroke="#22d3ee" stroke-width="2" />
				<line x1="100" y1="220" x2="260" y2="220" stroke="#22d3ee" stroke-width="2" />
				<line x1="260" y1="220" x2="300" y2="80" stroke="#22d3ee" stroke-width="2" />
				<line x1="450" y1="80" x2="420" y2="220" stroke="#22d3ee" stroke-width="2" />
				<line x1="260" y1="220" x2="340" y2="340" stroke="#22d3ee" stroke-width="2" />
				<line x1="420" y1="220" x2="340" y2="340" stroke="#22d3ee" stroke-width="2" />
				<line x1="100" y1="220" x2="180" y2="340" stroke="#22d3ee" stroke-width="2" />
				<line x1="180" y1="340" x2="340" y2="340" stroke="#22d3ee" stroke-width="2" />

				<g>
					<circle
						cx="150"
						cy="80"
						r="30"
						fill="url(#graphGradient)"
						stroke="#22d3ee"
						stroke-width="2"
					/>
					<text x="150" y="88" text-anchor="middle" fill="white" font-size="18" font-weight="bold">
						A
					</text>
				</g>
				<g>
					<circle
						cx="300"
						cy="80"
						r="30"
						fill="url(#graphGradient)"
						stroke="#22d3ee"
						stroke-width="2"
					/>
					<text x="300" y="88" text-anchor="middle" fill="white" font-size="18" font-weight="bold">
						B
					</text>
				</g>
				<g>
					<circle
						cx="450"
						cy="80"
						r="30"
						fill="url(#graphGradient)"
						stroke="#22d3ee"
						stroke-width="2"
					/>
					<text x="450" y="88" text-anchor="middle" fill="white" font-size="18" font-weight="bold">
						C
					</text>
				</g>
				<g>
					<circle
						cx="100"
						cy="220"
						r="30"
						fill="url(#graphGradient)"
						stroke="#22d3ee"
						stroke-width="2"
					/>
					<text x="100" y="228" text-anchor="middle" fill="white" font-size="18" font-weight="bold">
						D
					</text>
				</g>
				<g>
					<circle
						cx="260"
						cy="220"
						r="30"
						fill="url(#graphGradient)"
						stroke="#22d3ee"
						stroke-width="2"
					/>
					<text x="260" y="228" text-anchor="middle" fill="white" font-size="18" font-weight="bold">
						E
					</text>
				</g>
				<g>
					<circle
						cx="420"
						cy="220"
						r="30"
						fill="url(#graphGradient)"
						stroke="#22d3ee"
						stroke-width="2"
					/>
					<text x="420" y="228" text-anchor="middle" fill="white" font-size="18" font-weight="bold">
						F
					</text>
				</g>
				<g>
					<circle
						cx="180"
						cy="340"
						r="30"
						fill="url(#graphGradient)"
						stroke="#22d3ee"
						stroke-width="2"
					/>
					<text x="180" y="348" text-anchor="middle" fill="white" font-size="18" font-weight="bold">
						G
					</text>
				</g>
				<g>
					<circle
						cx="340"
						cy="340"
						r="30"
						fill="url(#graphGradient)"
						stroke="#22d3ee"
						stroke-width="2"
					/>
					<text x="340" y="348" text-anchor="middle" fill="white" font-size="18" font-weight="bold">
						H
					</text>
				</g>
			</svg>
			<div class="mt-4 text-center text-sm text-cyan-300">
				<div class="mb-2 font-semibold">Adjacency List:</div>
				{#each Object.entries(graph) as [vertex, edges]}
					<div>
						{vertex} → [{(edges as string[]).join(', ')}]
					</div>
				{/each}
			</div>
		</div>

		<div id="graph-java" class="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
			<h4 class="mb-6 text-lg font-semibold text-white">Java Implementation</h4>
			<pre class="overflow-x-auto text-xs text-gray-300 md:text-sm">
        <code>{graphJava}</code>
      </pre>
		</div>
	</div>

	<div
		id="trie"
		class="space-y-6 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg md:p-8"
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500 font-semibold text-white"
			>
				5
			</div>
			<div>
				<h3 class="text-xl font-bold text-white md:text-2xl">Trie (Prefix Tree)</h3>
				<p class="text-sm text-slate-200">Prefix-based storage for efficient word lookup.</p>
			</div>
		</div>

		<div class="space-y-4 rounded-xl bg-slate-800/50 p-6">
			<div class="mb-2 flex flex-wrap justify-center gap-3">
				{#each [...trieWords].sort((a, b) => a.localeCompare(b)) as word}
					<div
						class="rounded-lg bg-gradient-to-r from-pink-600 to-pink-400 px-4 py-2 font-semibold text-white shadow-lg"
					>
						{word}
					</div>
				{/each}
			</div>
			<div class="text-center text-sm text-pink-300">
				Words sharing prefixes are stored along shared paths in the trie, and the list above is
				sorted lexicographically.
			</div>
			<div class="mt-2 flex flex-wrap justify-center gap-3">
				<input
					type="text"
					bind:value={trieInput}
					placeholder="Word"
					class="w-40 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white"
				/>
				<button
					onclick={() => {
						const normalized = trieInput.trim().toLowerCase();
						if (normalized && !trieWords.includes(normalized)) {
							trieWords = [...trieWords, normalized].sort((a, b) => a.localeCompare(b));
						}
						trieInput = '';
					}}
					class="flex items-center gap-2 rounded-lg bg-pink-600 px-6 py-2 font-semibold text-white hover:bg-pink-700"
				>
					<Plus size={18} />
					Add Word
				</button>
				<button
					onclick={() => {
						trieWords = ['cat', 'car', 'card', 'care', 'dog', 'dodge'].sort((a, b) =>
							a.localeCompare(b)
						);
						trieInput = '';
					}}
					class="flex items-center gap-2 rounded-lg bg-gray-600 px-6 py-2 font-semibold text-white hover:bg-gray-700"
				>
					<RotateCcw size={18} />
					Reset
				</button>
			</div>
		</div>

		<div id="trie-java" class="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
			<h4 class="mb-6 text-lg font-semibold text-white">Java Implementation</h4>
			<pre class="overflow-x-auto text-xs text-gray-300 md:text-sm">
        <code>{trieJava}</code>
      </pre>
		</div>
	</div>

	<div
		id="hash-table"
		class="space-y-6 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg md:p-8"
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 font-semibold text-white"
			>
				6
			</div>
			<div>
				<h3 class="text-xl font-bold text-white md:text-2xl">Hash Table</h3>
				<p class="text-sm text-slate-200">Key-value storage backed by a hash function.</p>
			</div>
		</div>

		<div class="rounded-xl bg-slate-800/50 p-6">
			<div class="grid grid-cols-5 gap-3">
				{#each Array.from({ length: 10 }, (_, i) => i) as bucket}
					<div class="flex flex-col items-center">
						<div class="mb-2 text-xs text-emerald-400">[{bucket}]</div>
						<div
							class="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-emerald-300 bg-gradient-to-br from-emerald-600 to-emerald-400 font-bold text-white"
						>
							{bucket % 3 === 0 ? '🔑' : ''}
						</div>
					</div>
				{/each}
			</div>
			<div class="mt-6 text-center text-sm text-emerald-300">
				Example hash function (Java-style): hash(key) = |key.hashCode() % 10|. <br />Buckets 0, 3, 6
				and 9 are shown as containing keys to illustrate how different keys can hash to indices that
				are multiples of 3 in this table of size 10.
			</div>
		</div>

		<div id="hash-table-java" class="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
			<h4 class="mb-6 text-lg font-semibold text-white">Java Implementation</h4>
			<pre class="overflow-x-auto text-xs text-gray-300 md:text-sm">
        <code>{hashTableJava}</code>
      </pre>
		</div>
	</div>
</section>
