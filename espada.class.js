function Espada(x, y)
{	
	this.CAJA=new Caja(x, y, 20, 20);
	this.direccion=0;
	this.activa=false;

	this.rep_angulo_ini=0;
	this.rep_angulo_fin=0;
	this.rep_sentido_horario=true;

	this.tics=0;
	this.tiempo_total=0.25;
}

/*La espada tarda 0.25 segundos en hacer 90 grados...
Aquí movemos el ángulo de inicio.
0.25 -> 90
delta -> x
*/

Espada.prototype.turno=function(delta)
{
	if(!this.activa) return;

	++this.tics;
	var cambio=(delta * 90) / 0.25;	

	if(this.direccion==1) 
	{
		this.rep_angulo_ini+=cambio;
		if(this.rep_angulo_ini > this.rep_angulo_fin) 
		{
			this.activa=false;
		}
	}
	else 
	{
		this.rep_angulo_ini-=cambio;
		if(this.rep_angulo_ini < this.rep_angulo_fin)
		{
			this.activa=false;
		}
	}
}

Espada.prototype.en_contacto_con=function(c)
{
	return this.CAJA.en_colision_con_caja(c);
}

/*La espada sólo puede herir en el momento en que
se usa. Se activa con "tic 0", inmediatamente sube
a 1 al pasar su turno y más allá ya no puede herir.*/

Espada.prototype.puede_herir=function()
{
	return this.activa && this.tics < 2;
}

Espada.prototype.activar=function(caja, dir)
{
	if(!caja instanceof Caja)
	{
		return false;
	}
	else
	{	
		this.direccion=dir;
		this.CAJA.y=caja.y;
		this.CAJA.x=this.direccion==1 ? caja.x+caja.w : caja.x-this.CAJA.w;
		this.rep_angulo_ini=this.direccion==1 ? 45 : 315;
		this.rep_angulo_fin=this.direccion==1 ? 135 : 225;
		this.rep_sentido_horario=this.direccion==1;
		this.id_ultimo_ataque=Date.now();
		this.tics=0;
		this.activa=true;

	}

}
