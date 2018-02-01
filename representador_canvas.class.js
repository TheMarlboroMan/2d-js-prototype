
function Representador_canvas() 
{
	this.CAMARA=null;
	this.usar_camara=false;
}

Representador_canvas.prototype.vincular_camara=function(c)
{
	if(c instanceof Camara)
	{
		this.CAMARA=c;
		this.usar_camara=true;
	}
}

Representador_canvas.prototype.activar_camara=function(c)
{
	if(this.CAMARA) this.usar_camara=true;
}

Representador_canvas.prototype.desactivar_camara=function(c) {this.usar_camara=false;}

Representador_canvas.prototype.representar_caja=function(cx, caja, color)
{
	var x=~~ (caja.x+0.5);
	var y=~~ (caja.y+0.5);
	var w=caja.w;
	var h=caja.h;

	if(this.CAMARA && this.usar_camara)
	{
		x-=this.CAMARA.CAJA.x;
		y-=this.CAMARA.CAJA.y;
	}

	cx.strokeStyle=color;
	cx.fillStyle=color;
	cx.fillRect(x, y, w, h);
}

Representador_canvas.prototype.representar_rectangulo=function(cx, caja, color)
{
	var x=~~ (caja.x+0.5);
	var y=~~ (caja.y+0.5);
	var w=caja.w;
	var h=caja.h;

	if(this.CAMARA && this.usar_camara)
	{
		x-=this.CAMARA.CAJA.x;
		y-=this.CAMARA.CAJA.y;
	}

	cx.beginPath();
	cx.strokeStyle=color;
	cx.fillStyle="transparent";
	cx.rect(x, y, w, h);
	cx.stroke();
}

Representador_canvas.prototype.representar_arco=function(cx, x, y, radio, ini, fin, sentido, color)
{
	var x=~~ (x+0.5);
	var y=~~ (y+0.5);

	if(this.CAMARA && this.usar_camara)
	{
		x-=this.CAMARA.CAJA.x;
		y-=this.CAMARA.CAJA.y;
	}

	cx.strokeStyle = color;
	cx.beginPath();
	cx.arc(x, y, radio, ini, fin, sentido);
//	cx.lineWidth = 15;
	cx.stroke();
}


Representador_canvas.prototype.representar_circulo=function(cx, caja, color)
{
	var x=~~ (caja.x+0.5) + (caja.w/2);
	var y=~~ (caja.y+0.5) + (caja.h/2);
	var radio=caja.w / 2;

	if(this.CAMARA && this.usar_camara)
	{
		x-=this.CAMARA.CAJA.x;
		y-=this.CAMARA.CAJA.y;
	}

	cx.beginPath();
	cx.arc(x, y, radio, 0, 2 * Math.PI, false);
	cx.fillStyle=color;
	cx.fill();
	cx.lineWidth=2;
	cx.strokeStyle='#fff';
	cx.stroke();
}

Representador_canvas.prototype.limpiar_representacion=function(cx, color, w, h)
{
	cx.fillStyle=color;
	cx.fillRect(0, 0, w, h);
	cx.strokeStyle='#800';

	var px=0;
	while(px <= w)
	{
		cx.beginPath();
		cx.moveTo(px, 0);
		cx.lineTo(px, h);
		cx.stroke();
		px+=20;
	}

	var py=0;
	while(py <= h)
	{
		cx.beginPath();
		cx.moveTo(0, py);
		cx.lineTo(w, py);
		cx.stroke();
		py+=20;
	}
}

