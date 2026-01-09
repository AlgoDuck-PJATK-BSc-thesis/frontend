export const meta = {
	title: 'Linked List',
	what: 'A sequence of nodes where each node points to the next.',
	when: [
		'Frequent insert/delete with known position',
		'Implementing stacks/queues',
		'Memory not contiguous'
	],
	avoid: ['When you need fast random indexing', 'When cache locality is critical'],
	time: { best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
	space: 'O(n)',
	flags: { indexing: 'O(n)' }
};

export const java = `class Node {
	int value;
	Node next;

	Node(int value) {
		this.value = value;
		this.next = null;
	}
}

public class LinkedList {
	private Node head;

	public void append(int value) {
		Node n = new Node(value);
		if (head == null) {
			head = n;
			return;
		}
		Node cur = head;
		while (cur.next != null) cur = cur.next;
		cur.next = n;
	}

	public void removeFirst() {
		if (head == null) return;
		head = head.next;
	}

	public boolean contains(int value) {
		Node cur = head;
		while (cur != null) {
			if (cur.value == value) return true;
			cur = cur.next;
		}
		return false;
	}
}`;
