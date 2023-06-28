<script lang="ts">
	import { onMount } from 'svelte';
	import paper from 'paper';
	import { getStageSize, initRender } from '../utils/init';
	import { ceil, random } from 'lodash';
	import { Camera } from '../utils/camera';

	function incr<T extends number>(a: T, b: T) {
		return a - b;
	}
	function desc<T extends number>(a: T, b: T) {
		return b - a;
	}

	function randPt(delta?: paper.PointLike) {
		const { width, height } = getStageSize();
		const position = [width, height].map(random).map(ceil);
		return new paper.Point(position).add(delta ?? [0, 0]);
	}

	function hue(color: paper.Color, newHue: number) {
		color.hue += newHue;
		return color;
	}

	onMount(() => {
		let mx = 0,
			my = 0;

		function drawSomething() {
			drawScreenViewBound();
			for (let i = 0; i < random(40); i++) {
				console.log('SLDKFJ', i);

				const circle = new paper.Path.Circle(new paper.Point([10, 10]), 10);
				const line = new paper.Path.Line(randPt(), randPt());
				// @ts-ignore
				const [r1, r2] = [10, [5, 17]].map(random).sort(desc);
				const star = new paper.Path.Star(randPt(), ceil(random(3, 20)), r1, r2);

				[circle, line, star].map((p) => {
					p.strokeColor = hue(new paper.Color('red'), ceil(random(360)));
					p.strokeWidth = 1;
				});
			}
		}

		function drawScreenViewBound() {
			const { width, height } = getStageSize();
			const rect = new paper.Path.Rectangle(new paper.Point(0, 0), new paper.Point(width, height));
			rect.strokeWidth = 4;
			rect.strokeColor = new paper.Color('#890890');
		}

		addEventListener('mousedown', () => {
			paper.project.clear();
			drawSomething();
		});

		const stage = document.querySelector('#stage')! as HTMLElement;
		const canvas = stage.querySelector('canvas')!;
		initRender(stage);
		const camera = new Camera({ canvas, stage });
		camera.init();

		drawSomething();

		addEventListener('mousemove', ({ clientX, clientY }) => {
			mx = clientX;
			my = clientY;
		});
	});
</script>

<div id="stage">
	<canvas>not support canvas!</canvas>
</div>

<style>
	#stage {
		display: grid;
		width: 100%;
		height: 100vh;
		position: relative;
	}
	#stage > :global(canvas) {
		position: absolute;
		width: 100%;
		height: 100%;
		border: 3px solid rebeccapurple;
		box-sizing: border-box;
	}
</style>
