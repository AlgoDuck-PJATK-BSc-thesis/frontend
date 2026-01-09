export const meta = {
	title: 'Queue',
	what: 'A FIFO structure where the earliest added element is removed first.',
	when: ['Task scheduling', 'BFS', 'Streaming data pipelines'],
	avoid: ['When you need LIFO behavior', 'When you need random access'],
	time: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
	space: 'O(n)',
	flags: { order: 'FIFO' }
};

export const java = `public class QueueArray {
	private int[] items;
	private int front;
	private int rear;
	private int count;

	public QueueArray(int capacity) {
		items = new int[capacity];
		front = 0;
		rear = -1;
		count = 0;
	}

	public void enqueue(int value) {
		if (count == items.length) throw new RuntimeException("Full");
		rear = (rear + 1) % items.length;
		items[rear] = value;
		count++;
	}

	public int dequeue() {
		if (count == 0) throw new RuntimeException("Empty");
		int value = items[front];
		front = (front + 1) % items.length;
		count--;
		return value;
	}

	public int peek() {
		if (count == 0) throw new RuntimeException("Empty");
		return items[front];
	}
}`;
