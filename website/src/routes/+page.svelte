<script lang="ts">
	import { onMount } from 'svelte';
	import paper from 'paper';

	onMount(() => {
		let mx = 0,
			my = 0;

		addEventListener('mousemove', ({ clientX, clientY }) => {
			mx = clientX;
			my = clientY;
			path.position.x = mx;
			path.position.y = my;
		});

		const stage = document.querySelector('#stage') as HTMLCanvasElement;
		paper.setup(stage);
		const path = new paper.Path.Circle([10, 10], 10);
		path.strokeColor = new paper.Color('red');
	});
</script>

<canvas id="stage">not support canvas!</canvas>
