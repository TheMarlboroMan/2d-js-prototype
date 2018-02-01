function Bonus(vx, vy, v_id_memoria)
{
	var x=vx ? vx : 0.0;
	var y=vy ? vy : 0.0;

	this.CAJA=new Caja(x, y, 10, 10);
	this.POSICION=new Punto(x, y);
	this.para_borrar=false;
	this.id_memoria=v_id_memoria ? v_id_memoria : 0;
}
