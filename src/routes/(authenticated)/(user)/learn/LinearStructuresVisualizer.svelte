<script lang="ts">
	import { Plus, Minus, RotateCcw } from 'lucide-svelte';

	type ListNode = {
		value: number;
		next: number | null;
	};

	let stack: number[] = [1, 2, 3];
	let stackInput = '';

	let queue: number[] = [1, 2, 3, 4];
	let queueInput = '';

	let linkedList: ListNode[] = [
		{ value: 10, next: 1 },
		{ value: 20, next: 2 },
		{ value: 30, next: null }
	];
	let llInput = '';

	let array: number[] = [5, 2, 8, 1, 9];

	const stackJava = `public class Stack {
		private int[] items;
		private int top;
		private int capacity;
		
		public Stack(int size) {
			items = new int[size];
			capacity = size;
			top = -1;
		}
		
		public void push(int item) {
			if (top == capacity - 1) {
				throw new RuntimeException("Stack overflow");
			}
			items[++top] = item;
		}
		
		public int pop() {
			if (isEmpty()) {
				throw new RuntimeException("Stack underflow");
			}
			return items[top--];
		}
		
		public int peek() {
			if (isEmpty()) {
				throw new RuntimeException("Stack is empty");
			}
			return items[top];
		}
		
		public boolean isEmpty() {
			return top == -1;
		}
		
		public int size() {
			return top + 1;
		}
	}`;

	const queueJava = `public class Queue {
		private int[] items;
		private int front;
		private int rear;
		private int capacity;
		private int count;
		
		public Queue(int size) {
			items = new int[size];
			capacity = size;
			front = 0;
			rear = -1;
			count = 0;
		}
		
		public void enqueue(int item) {
			if (count == capacity) {
				throw new RuntimeException("Queue is full");
			}
			rear = (rear + 1) % capacity;
			items[rear] = item;
			count++;
		}
		
		public int dequeue() {
			if (isEmpty()) {
				throw new RuntimeException("Queue is empty");
			}
			int item = items[front];
			front = (front + 1) % capacity;
			count--;
			return item;
		}
		
		public int peek() {
			if (isEmpty()) {
				throw new RuntimeException("Queue is empty");
			}
			return items[front];
		}
		
		public boolean isEmpty() {
			return count == 0;
		}
		
		public int size() {
			return count;
		}
	}`;

	const linkedListJava = `class Node {
		int data;
		Node next;
		
		public Node(int data) {
			this.data = data;
			this.next = null;
		}
	}

	public class LinkedList {
		private Node head;
		
		public LinkedList() {
			this.head = null;
		}
		
		public void append(int data) {
			Node newNode = new Node(data);
			if (head == null) {
				head = newNode;
				return;
			}
			Node current = head;
			while (current.next != null) {
				current = current.next;
			}
			current.next = newNode;
		}
		
		public void prepend(int data) {
			Node newNode = new Node(data);
			newNode.next = head;
			head = newNode;
		}
		
		public void delete(int data) {
			if (head == null) return;
			
			if (head.data == data) {
				head = head.next;
				return;
			}
			
			Node current = head;
			while (current.next != null) {
				if (current.next.data == data) {
					current.next = current.next.next;
					return;
				}
				current = current.next;
			}
		}
		
		public boolean search(int data) {
			Node current = head;
			while (current != null) {
				if (current.data == data) {
					return true;
				}
				current = current.next;
			}
			return false;
		}
		
		public void display() {
			Node current = head;
			while (current != null) {
				System.out.print(current.data + " -> ");
				current = current.next;
			}
			System.out.println("null");
		}
	}`;

	const arrayJava = `public class DynamicArray {
		private int[] items;
		private int size;
		private int capacity;
		
		public DynamicArray() {
			capacity = 10;
			items = new int[capacity];
			size = 0;
		}
		
		public void add(int item) {
			if (size == capacity) {
				resize();
			}
			items[size++] = item;
		}
		
		public void insert(int index, int item) {
			if (index < 0 || index > size) {
				throw new IndexOutOfBoundsException();
			}
			if (size == capacity) {
				resize();
			}
			for (int i = size; i > index; i--) {
				items[i] = items[i - 1];
			}
			items[index] = item;
			size++;
		}
		
		public int get(int index) {
			if (index < 0 || index >= size) {
				throw new IndexOutOfBoundsException();
			}
			return items[index];
		}
		
		public void remove(int index) {
			if (index < 0 || index >= size) {
				throw new IndexOutOfBoundsException();
			}
			for (int i = index; i < size - 1; i++) {
				items[i] = items[i + 1];
			}
			size--;
		}
		
		private void resize() {
			capacity *= 2;
			int[] newItems = new int[capacity];
			System.arraycopy(items, 0, newItems, 0, size);
			items = newItems;
		}
		
		public int size() {
			return size;
		}
	}`;
</script>

<section class="space-y-10">
	<h2 class="text-2xl font-bold text-white md:text-3xl">Linear Data Structures</h2>

	<div
		id="stack"
		class="space-y-6 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg md:p-8"
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 font-semibold text-white"
			>
				1
			</div>
			<div>
				<h3 class="text-xl font-bold text-white md:text-2xl">Stack (LIFO)</h3>
				<p class="text-sm text-slate-300">Visualizing push and pop operations.</p>
			</div>
		</div>

		<div class="rounded-xl bg-slate-800/50 p-6">
			<div class="flex h-64 items-end justify-center gap-2">
				{#each stack as item, idx}
					<div
						class="flex w-20 items-center justify-center rounded-t-lg border-2 border-blue-300 bg-gradient-to-t from-blue-600 to-blue-400 text-xl font-bold text-white shadow-lg transition-all duration-300"
						style={`height: ${(item / Math.max(...stack, 1)) * 200}px; min-height: 60px;`}
					>
						{item}
					</div>
				{/each}
			</div>
			<div class="mt-6 flex flex-wrap justify-center gap-3">
				<input
					type="number"
					bind:value={stackInput}
					placeholder="Value"
					class="w-32 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white"
				/>
				<button
					onclick={() => {
						if (stackInput) {
							const value = parseInt(stackInput, 10);
							if (!Number.isNaN(value)) {
								stack = [...stack, value];
							}
							stackInput = '';
						}
					}}
					class="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-700"
				>
					<Plus size={18} />
					Push
				</button>
				<button
					onclick={() => {
						if (stack.length > 0) {
							stack = stack.slice(0, -1);
						}
					}}
					class="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700"
				>
					<Minus size={18} />
					Pop
				</button>
				<button
					onclick={() => {
						stack = [1, 2, 3];
					}}
					class="flex items-center gap-2 rounded-lg bg-gray-600 px-6 py-2 font-semibold text-white hover:bg-gray-700"
				>
					<RotateCcw size={18} />
					Reset
				</button>
			</div>
		</div>

		<div id="stack-java" class="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
			<h4 class="mb-6 text-lg font-semibold text-white">Java Implementation</h4>
			<pre class="overflow-x-auto text-xs text-gray-300 md:text-sm">
        <code>{stackJava}</code>
      </pre>
		</div>
	</div>

	<div
		id="queue"
		class="space-y-6 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg md:p-8"
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500 font-semibold text-white"
			>
				2
			</div>
			<div>
				<h3 class="text-xl font-bold text-white md:text-2xl">Queue (FIFO)</h3>
				<p class="text-sm text-slate-300">Visualizing enqueue and dequeue operations.</p>
			</div>
		</div>

		<div class="rounded-xl bg-slate-800/50 p-6">
			<div class="flex h-32 items-center justify-center gap-3">
				<div class="font-semibold text-green-400">Front →</div>
				{#each queue as item, idx}
					<div
						class="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-green-300 bg-gradient-to-br from-green-600 to-green-400 text-xl font-bold text-white shadow-lg"
					>
						{item}
					</div>
				{/each}
				<div class="font-semibold text-green-400">← Rear</div>
			</div>
			<div class="mt-6 flex flex-wrap justify-center gap-3">
				<input
					type="number"
					bind:value={queueInput}
					placeholder="Value"
					class="w-32 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white"
				/>
				<button
					onclick={() => {
						if (queueInput) {
							const value = parseInt(queueInput, 10);
							if (!Number.isNaN(value)) {
								queue = [...queue, value];
							}
							queueInput = '';
						}
					}}
					class="rounded-lg bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-700"
				>
					Enqueue
				</button>
				<button
					onclick={() => {
						if (queue.length > 0) {
							queue = queue.slice(1);
						}
					}}
					class="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700"
				>
					Dequeue
				</button>
				<button
					onclick={() => {
						queue = [1, 2, 3, 4];
					}}
					class="rounded-lg bg-gray-600 px-6 py-2 font-semibold text-white hover:bg-gray-700"
				>
					Reset
				</button>
			</div>
		</div>

		<div id="queue-java" class="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
			<h4 class="mb-6 text-lg font-semibold text-white">Java Implementation</h4>
			<pre class="overflow-x-auto text-xs text-gray-300 md:text-sm">
        <code>{queueJava}</code>
      </pre>
		</div>
	</div>

	<div
		id="linked-list"
		class="space-y-6 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg md:p-8"
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500 font-semibold text-white"
			>
				3
			</div>
			<div>
				<h3 class="text-xl font-bold text-white md:text-2xl">Linked List</h3>
				<p class="text-sm text-slate-300">Append and remove operations on nodes.</p>
			</div>
		</div>

		<div class="rounded-xl bg-slate-800/50 p-6">
			<div class="flex flex-wrap items-center justify-center gap-4">
				{#each linkedList as node, idx}
					<div class="flex items-center gap-4">
						<div class="flex flex-col items-center">
							<div
								class="flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-purple-300 bg-gradient-to-br from-purple-600 to-purple-400 text-white shadow-lg"
							>
								<div class="text-xs text-purple-200">Node</div>
								<div class="text-2xl font-bold">{node.value}</div>
								<div class="text-xs text-purple-200">
									next: {node.next !== null ? '→' : 'null'}
								</div>
							</div>
						</div>
						{#if node.next !== null}
							<div class="text-2xl text-purple-400">→</div>
						{/if}
					</div>
				{/each}
			</div>
			<div class="mt-6 flex flex-wrap justify-center gap-3">
				<input
					type="number"
					bind:value={llInput}
					placeholder="Value"
					class="w-32 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white"
				/>
				<button
					onclick={() => {
						if (llInput) {
							const value = parseInt(llInput, 10);
							if (!Number.isNaN(value)) {
								const newList = [...linkedList];
								if (newList.length > 0) {
									newList[newList.length - 1] = {
										...newList[newList.length - 1],
										next: newList.length
									};
								}
								newList.push({ value, next: null });
								linkedList = newList;
							}
							llInput = '';
						}
					}}
					class="rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white hover:bg-purple-700"
				>
					Append
				</button>
				<button
					onclick={() => {
						if (linkedList.length > 0) {
							const newList = linkedList.slice(0, -1);
							if (newList.length > 0) {
								newList[newList.length - 1] = {
									...newList[newList.length - 1],
									next: null
								};
							}
							linkedList = newList;
						}
					}}
					class="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700"
				>
					Remove Last
				</button>
				<button
					onclick={() => {
						linkedList = [
							{ value: 10, next: 1 },
							{ value: 20, next: 2 },
							{ value: 30, next: null }
						];
					}}
					class="rounded-lg bg-gray-600 px-6 py-2 font-semibold text-white hover:bg-gray-700"
				>
					Reset
				</button>
			</div>
		</div>

		<div id="linked-list-java" class="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
			<h4 class="mb-6 text-lg font-semibold text-white">Java Implementation</h4>
			<pre class="overflow-x-auto text-xs text-gray-300 md:text-sm">
        <code>{linkedListJava}</code>
      </pre>
		</div>
	</div>

	<div
		id="dynamic-array"
		class="space-y-6 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg md:p-8"
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 font-semibold text-white"
			>
				4
			</div>
			<div>
				<h3 class="text-xl font-bold text-white md:text-2xl">Dynamic Array</h3>
				<p class="text-sm text-slate-300">Resizable array with indexed access.</p>
			</div>
		</div>

		<div class="rounded-xl bg-slate-800/50 p-6">
			<div class="flex flex-wrap items-center justify-center gap-2">
				{#each array as item, idx}
					<div class="flex flex-col items-center">
						<div class="mb-1 text-xs text-orange-400">[{idx}]</div>
						<div
							class="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-orange-300 bg-gradient-to-br from-orange-600 to-orange-400 text-xl font-bold text-white shadow-lg"
						>
							{item}
						</div>
					</div>
				{/each}
			</div>
			<div class="mt-6 flex flex-wrap justify-center gap-3">
				<button
					onclick={() => {
						const value = Math.floor(Math.random() * 10) + 1;
						array = [...array, value];
					}}
					class="rounded-lg bg-orange-600 px-6 py-2 font-semibold text-white hover:bg-orange-700"
				>
					Add Random
				</button>
				<button
					onclick={() => {
						if (array.length > 0) {
							array = array.slice(0, -1);
						}
					}}
					class="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700"
				>
					Remove
				</button>
				<button
					onclick={() => {
						array = [5, 2, 8, 1, 9];
					}}
					class="rounded-lg bg-gray-600 px-6 py-2 font-semibold text-white hover:bg-gray-700"
				>
					Reset
				</button>
			</div>
		</div>

		<div id="dynamic-array-java" class="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
			<h4 class="mb-6 text-lg font-semibold text-white">Java Implementation</h4>
			<pre class="overflow-x-auto text-xs text-gray-300 md:text-sm">
        <code>{arrayJava}</code>
      </pre>
		</div>
	</div>
</section>
