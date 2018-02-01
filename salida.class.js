function Salida(vx, vy, vtipo, vnivel, vid)
{
	var x=vx ? vx : 0.0;
	var y=vy ? vy : 0.0;

	this.tipo=vtipo;
	this.nivel=vnivel;
	this.id=vid;

	this.CAJA=new Caja(x, y, 20, 20);
	this.POSICION=new Punto(x, y);
}

Salida.prototype.en_contacto_con_jugador=function(J)
{
	if(!J instanceof Jugador)
	{
		return false;
	}
	else
	{
		//Misma lógica que la escalera. Activable si estamos 10 píxeles
		//dentro.
		
		if(!this.CAJA.en_colision_con_caja(J.CAJA))
		{
			return false;
		}
		else
		{
			var jxw=J.POSICION.x+J.CAJA.w;
			var txw=this.POSICION.x+this.CAJA.w;

			//Jugador a la izquierda...
			if(J.POSICION.x < this.POSICION.x)
			{
				return jxw-10 >= this.POSICION.x;
			}
			//Jugador a la derecha.
			else if(jxw > txw)
			{
				return J.POSICION.x+10 <= txw;
			}
			//Jugador dentro.
			else return true; 
		}
		
	}
}
