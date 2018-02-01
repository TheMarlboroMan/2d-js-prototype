function Obstaculo_destruible(vx, vy)
{
	var x=vx ? vx : 0.0;
	var y=vy ? vy : 0.0;

	this.CAJA=new Caja(x, y, 20, 20);
	this.POSICION=new Punto(x, y);

	this.para_borrar=false;

	this.resistencia=20;
}

Obstaculo_destruible.prototype.obtener_tipo_colision=function(){return Actor.prototype.TIPO_COLISION_NADA;}

Obstaculo_destruible.prototype.recibir_ataque=function(pot)
{
	this.resistencia-=pot;
	if(this.resistencia <= 0)
	{
		this.para_borrar=true;
		return 1;
	}

	return 0;
}

Obstaculo_destruible.prototype.establecer_posicion=function(vx, vy)
{
	if(vx!==false) this.POSICION.x=vx;
	if(vy!==false) this.POSICION.y=vy;
	this.CAJA.recibir_datos(this.POSICION.x, this.POSICION.y, false, false);
}

Obstaculo_destruible.prototype.sumar_posicion=function(vx, vy)
{
	if(vx!==false) this.POSICION.x+=vx;
	if(vy!==false) this.POSICION.y+=vy;
	this.CAJA.recibir_datos(this.POSICION.x, this.POSICION.y, false, false);
}
