function Camara(vx, vy, vw, vh)
{
	this.CAJA=new Caja(vx, vy, vw, vh);
	this.CAJA_LIMITE=null;
	this.CAJA_MARGEN=null;
}

Camara.prototype.desplazar=function(vx, vy)
{
	this.CAJA.x+=vx;
	this.CAJA.y+=vy;
}

Camara.prototype.ir_a=function(vx, vy)
{
	this.CAJA.x=vx;
	this.CAJA.y=vy;
}

Camara.prototype.establecer_caja_limite=function(c)
{
	if(!c instanceof Caja)
	{
		this.CAJA_LIMITE=null;
	}	
	else
	{
		this.CAJA_LIMITE=c;
	}
}

Camara.prototype.establecer_caja_margen=function(c)
{
	if(!c instanceof Caja)
	{
		this.CAJA_MARGEN=null;
	}	
	else
	{
		this.CAJA_MARGEN=c;
	}
}

Camara.prototype.centrar_en=function(c)
{
	if(c instanceof Caja)
	{

		var x=0, y=0;

		//Esto sería para mantener la caja en el centro siempre.
		if(!this.CAJA_MARGEN)
		{
			x=c.x-(this.CAJA.w / 2);
			y=c.y-(this.CAJA.h / 2);
		}
		//Además, puede que haya un márgen de movimiento.
		else 
		{
			//Si lo que estamos centrando está dentro de la "caja de márgen"
			//entonces no moveremos nada...  Si se sale, moveremos lo que
			//se haya salido.

			x=this.CAJA.x;
			y=this.CAJA.y;		

			//En primer lugar, convertimos la caja a coordenadas de cámara primero.

			var cx=c.x-this.CAJA.x;
			var cy=c.y-this.CAJA.y;

			var caja_t=new Caja(cx, cy, c.w, c.h);

			//Si hay colisión de cajas no hay problemas: estamos
			//centrados en la zona de seguridad...
			if(this.CAJA_MARGEN.en_colision_con_caja(caja_t))
			{
				x=this.CAJA.x;
				y=this.CAJA.y;
			}
			//Si estamos fuera hay que ajustar por los lados que
			//correspondan.
			else
			{
				//Cuántos píxeles se sale por cada lado???. Si la diferencia
				//es positiva es que estamos fuera y eso es lo que tendremos
				//que sumar.

				var difx_izq=this.CAJA_MARGEN.x - (cx+c.w);
				var difx_der=(cx) - (this.CAJA_MARGEN.x+this.CAJA_MARGEN.w);
				var dify_arr=this.CAJA_MARGEN.y - (cy+c.w);
				var dify_aba=(cy) - (this.CAJA_MARGEN.y+this.CAJA_MARGEN.h);

				if(difx_der > 0) x+=difx_der;
				else if(difx_izq > 0) x-=difx_izq;

				if(dify_arr > 0) y-=dify_arr;
				else if(dify_aba > 0) y+=dify_aba;
			}
		}

		//Una última comprobación es que no apuntamos más allá de lo permitido.
		if(this.CAJA_LIMITE)
		{
			if(x < this.CAJA_LIMITE.x) x=this.CAJA_LIMITE.x;
			else if(x+this.CAJA.w > this.CAJA_LIMITE.x+this.CAJA_LIMITE.w) x=this.CAJA_LIMITE.x+this.CAJA_LIMITE.w-this.CAJA.w;

			if(y < this.CAJA_LIMITE.y) y=this.CAJA_LIMITE.y;
			else if(y+this.CAJA.h > this.CAJA_LIMITE.y+this.CAJA_LIMITE.h) y=this.CAJA_LIMITE.y+this.CAJA_LIMITE.h-this.CAJA.h;
		}

		this.CAJA.x=x;
		this.CAJA.y=y;
	}
}
