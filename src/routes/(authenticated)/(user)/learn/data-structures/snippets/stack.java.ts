export const meta = {
	title: 'Stack',
	what: 'A LIFO structure where the most recently added element is removed first.',
	when: ['Undo/redo history', 'Backtracking and DFS', 'Parsing / matching brackets'],
	avoid: ['When you need random access', 'When you need FIFO order'],
	time: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
	space: 'O(n)',
	flags: { order: 'LIFO' }
};

export const java = `public class StackArray {
	private int[] items;
	private int top;

	public StackArray(int capacity) {
		items = new int[capacity];
		top = -1;
	}

	public void push(int value) {
		if (top == items.length - 1) throw new RuntimeException("Overflow");
		items[++top] = value;
	}

	public int pop() {
		if (top == -1) throw new RuntimeException("Underflow");
		return items[top--];
	}

	public int peek() {
		if (top == -1) throw new RuntimeException("Empty");
		return items[top];
	}

	public boolean isEmpty() {
		return top == -1;
	}
}`;
