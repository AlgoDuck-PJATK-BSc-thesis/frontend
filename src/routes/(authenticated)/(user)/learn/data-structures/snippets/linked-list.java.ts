export const meta = {
	title: 'Linked List',
	what: 'A linked list is a chain of nodes where each node stores a value and a reference to the next node. Appending means walking to the end and linking a new node. Removing the last node means walking to the second-to-last node and cutting off its next reference.',
	when: [
		'Frequent insert/delete when you already have a node reference',
		'Implementing stacks/queues conceptually',
		'Memory does not need to be contiguous'
	],
	avoid: ['When you need fast random indexing', 'When cache locality is critical'],
	time: { best: 'O(1) at head / with reference', avg: 'O(n)', worst: 'O(n)' },
	space: 'O(n)',
	flags: { indexing: 'O(n)' }
};

export const java = `public class LinkedList {
    static class Node {
        int value;
        Node next;

        Node(int value) {
            this.value = value;
            this.next = null;
        }
    }

    private Node head;

    public LinkedList() {
        reset();
    }

    public void reset() {
        head = null;
        append(10);
        append(20);
        append(30);
    }

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

    public void removeLast() {
        if (head == null) return;
        if (head.next == null) {
            head = null;
            return;
        }
        Node cur = head;
        while (cur.next.next != null) cur = cur.next;
        cur.next = null;
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
