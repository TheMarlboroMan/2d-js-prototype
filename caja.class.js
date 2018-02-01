function Caja(vx, vy, vw, vh)
{
	this.x=0.0;
	this.y=0.0;
	this.w=0.0;
	this.h=0.0;	
	this.recibir_datos(vx, vy, vw, vh);
}

Caja.prototype.como_cadena=function()
{
	return this.x+', '+this.y+' ['+this.w+', '+this.h+']';
}

Caja.prototype.DESCONOCIDA=0;
Caja.prototype.IZQUIERDA=1;
Caja.prototype.ARRIBA=2;
Caja.prototype.DERECHA=4;
Caja.prototype.ABAJO=8;

Caja.prototype.DENTRO_X=1;
Caja.prototype.DENTRO_Y=2;


Caja.prototype.recibir_datos=function(vx, vy, vw, vh)
{
/*	if(Caja.prototype.convertir_a_entero)
	{
		if(vx!==false) this.x=parseInt(vx, 10);
		if(vy!==false) this.y=parseInt(vy, 10);
		if(vw!==false) this.w=parseInt(vw, 10);
		if(vh!==false) this.h=parseInt(vh, 10);
	}
	else
	{
*/
		if(vx!==false) this.x=vx;
		if(vy!==false) this.y=vy;
		if(vw!==false) this.w=vw;
		if(vh!==false) this.h=vh;
/*
	}
*/
}

//Caja.prototype.convertir_a_entero=false;

Caja.prototype.copiar_de=function(v_otra)
{
	if(v_otra instanceof Caja)
	{
		this.x=v_otra.x;
		this.y=v_otra.y;
		this.w=v_otra.w;
		this.h=v_otra.h;
	}
}

Caja.prototype.posicion_relativa_con=function(v_otra)
{
	var resultado=0;

	if(v_otra instanceof Caja)
	{
		if(this.x+this.w <= v_otra.x) resultado=resultado | Caja.prototype.IZQUIERDA;
		else if(this.x >= v_otra.x + v_otra.w) resultado=resultado | Caja.prototype.DERECHA;

		if(this.y+this.h <= v_otra.y) resultado=resultado | Caja.prototype.ARRIBA;
		else if(this.y >= v_otra.y + v_otra.h) resultado=resultado | Caja.prototype.ABAJO;
	}

	//Cuando esto ocurre es porque las cajas anteriores ya chocan entre si!.

	if(!resultado)
	{	
		debug("*******************************************************");
		debug("ERROR: SIN POSICION ANTERIOR ENTRE "+this.como_cadena()+" y "+v_otra.como_cadena());
	}

	return resultado;
}

Caja.prototype.en_colision_con_caja=function(comparado)
{
	var dentro_x=false;
        var dentro_y=false;

	var x=this.x; //.toFixed(1);
	var y=this.y; //.toFixed(1);
	var w=this.w; //.toFixed(1);
	var h=this.h; //.toFixed(1);

	var cx=comparado.x; //.toFixed(1);
	var cy=comparado.y; //.toFixed(1);
	var cw=comparado.w; //.toFixed(1);
	var ch=comparado.h; //.toFixed(1);

	var cwf=cx+cw;
	var chf=cy+ch;
	
	var twf=x+w;
	var thf=y+h;

	dentro_x=!( (cwf <= x) || (cx >= twf) );

	if(!dentro_x) return false;
	else 
	{
		dentro_y=!( (chf <= y) || (cy >= thf) );
		return dentro_y;
	}
}

Caja.prototype.calcular_posicion_relativa_x=function(comparado)
{
	var dentro_x=false;
	var x=this.x;
	var w=this.w;
	var cx=comparado.x;
	var cw=comparado.w;
	var cwf=cx+cw;	
	var twf=x+w;

	dentro_x=!( (cwf <= x) || (cx >= twf) );

	if(dentro_x) return Caja.prototype.DESCONOCIDA; //Dentro.
	else 
	{
		if(twf <= cx) Caja.prototype.IZQUIERDA;
		else return Caja.prototype.DERECHA;
	}
}

Caja.prototype.calcular_posicion_relativa_y=function(comparado)
{
	var dentro_y=false;
	var y=this.y;
	var h=this.h;
	var cy=comparado.y;
	var ch=comparado.h;
	var chf=cy+ch;
	var thf=y+h;
	dentro_y=!( (chf <= y) || (cy >= thf) );

	if(dentro_y) return Caja.prototype.DESCONOCIDA; //Dentro.
	{
		if(thf <= cy) return Caja.prototype.ARRIBA;
		else return Caja.prototype.ABAJO;
	}
}
