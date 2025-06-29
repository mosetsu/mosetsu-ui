export const createBaseModule = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
	ctx.strokeStyle = '#8a8a8a';
	ctx.fillStyle = '#FDFDFD';
	ctx.lineWidth = 0.5;
	ctx.beginPath();
	ctx.roundRect(x, y, 240, 102, [1]);
	ctx.fill();
	ctx.stroke();
};
