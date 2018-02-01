function Actor(vx, vy, vw, vh)
{
	var x=vx ? vx : 0.0;
	var y=vy ? vy : 0.0;

	this.CAJA=new Caja(x, y, vw ? vw : 20, vh ? vh : 20);
	this.POSICION=new Punto(x, y);

	this.vector={x:0.0, y:0.0};	//Vector de movimiento propio...
	this.color='rgb('+Math.floor((Math.random()*255)+128)+','+Math.floor((Math.random()*255)+128)+','+Math.floor((Math.random()*255)+128)+')'; 
	this.visible=true;
	this.tipo_colision=Actor.prototype.TIPO_COLISION_NADA;	
}

Actor.prototype.TIPO_COLISION_NADA=1;
Actor.prototype.TIPO_COLISION_CAJA_MOVIL=2;
Actor.prototype.TIPO_COLISION_PLATAFORMA_MOVIL=2;
Actor.prototype.TIPO_COLISION_LETAL_TACTO=3;
Actor.prototype.TIPO_COLISION_SALIDA_NIVEL=3;

Actor.prototype.es_visible=function(){return this.visible;}
Actor.prototype.establecer_tipo_colision=function(v_t){this.tipo_colision=v_t;}
Actor.prototype.obtener_tipo_colision=function(){return this.tipo_colision;}

Actor.prototype.establecer_posicion=function(vx, vy)
{
	if(vx!==false) this.POSICION.x=vx;
	if(vy!==false) this.POSICION.y=vy;
	this.CAJA.recibir_datos(this.POSICION.x, this.POSICION.y, false, false);
}

Actor.prototype.sumar_posicion=function(vx, vy)
{
	if(vx!==false) this.POSICION.x+=vx;
	if(vy!==false) this.POSICION.y+=vy;
	this.CAJA.recibir_datos(this.POSICION.x, this.POSICION.y, false, false);
}

Actor.prototype.establecer_vector=function(vx, vy)
{
	if(vx!==false) this.vector.x=vx;
	if(vy!==false) this.vector.y=vy;
//debug("ESTABLECER VECTOR "+vx+", "+vy);
}

Actor.prototype.recibir_vector=function(vx, vy)
{
	if(vx) this.vector.x+=vx;
	if(vy) this.vector.y+=vy;
}

Actor.prototype.establecer_color=function(v_c) {this.color=v_c;}

//Sin gravedad...

Actor.prototype.actuar=function(delta, tipo)
{
	var resultado=0;

	if(tipo & 1)
	{
		//Si damos un movimiento no calculamos, porque no cuenta...
		var x=this.vector.x;
		var dx=x * delta;
		this.sumar_posicion(dx, false);
	}

	if(tipo & 2)
	{
		var y=this.vector.y;
		var dy=y * delta;

		this.sumar_posicion(false, dy);
	}

	return resultado;
}
