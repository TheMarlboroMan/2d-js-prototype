
function Jugador(vx, vy, vw, vh)
{
	var x=vx ? vx : 0.0;
	var y=vy ? vy : 0.0;

	this.CAJA=new Caja(x, y, vw ? vw : 20, vh ? vh : 20);
	this.POSICION=new Punto(x, y);

	this.vector={x:0.0, y:0.0};	//Vector de movimiento propio...
	this.max_vector={x:170.0, y:300.0};
	this.freno_vector={x:10.0, y:5.0};
	this.gravedad=400.0;

	this.direccion=1; //-1 izquierda, 1 derecha.

	this.en_aire=true;

	//Control del salto doble.
	this.habilitado_salto_doble=true;
	this.realizado_salto_doble=false;
	this.tiempo_rebote=0.0;
	this.tiempo_max_rebote=0.250;

	//Control del rebote.
	this.habilitado_rebote=true;
	this.vector_x_siguiente_rebote=0.0;

	//Control de espada.
	this.habilitada_espada=true;
	this.tiempo_espada=0.0;
	this.tiempo_max_espada=0.3;
	
	this.UNIDO_A=null; //Unido a es "montado en".
	this.EMPUJADO_POR=null; //Empujado por es... "una caja que te ha empujado horizontalmente".
	this.ESCALERA=null;	//Escalera a la que nos unimos.

	this.estado=Jugador.prototype.ESTADO_NORMAL;
}

Jugador.prototype.ESTADO_NORMAL=1;
Jugador.prototype.ESTADO_ESCALERA=2;
Jugador.prototype.ESTADO_REBOTE=3;
Jugador.prototype.ESTADO_ESPADA=4;

Jugador.prototype.establecer_posicion=function(vx, vy)
{
	if(vx!==false) this.POSICION.x=vx;
	if(vy!==false) this.POSICION.y=vy;
	this.CAJA.recibir_datos(this.POSICION.x, this.POSICION.y, false, false);
}

/*El salto doble puede realizarse cuando estamos habilitados para ello y no
lo hemos hecho ya...*/

Jugador.prototype.puede_realizar_salto_doble=function() 
{
	return this.habilitado_salto_doble && !this.realizado_salto_doble;
}

Jugador.prototype.preparar_para_rebote=function(pos_siguiente)
{
	this.establecer_vector(0.0, 0.0);
	this.estado=Jugador.prototype.ESTADO_REBOTE;
	this.vector_x_siguiente_rebote=pos_siguiente==Caja.prototype.IZQUIERDA ? -280 : 280;
	this.tiempo_rebote=0.0;
}

Jugador.prototype.rebotar=function()
{
	this.estado=Jugador.prototype.ESTADO_NORMAL;
	this.establecer_vector(this.vector_x_siguiente_rebote, false);
	this.saltar();
}

Jugador.prototype.iniciar_turno=function(delta)
{
	this.EMPUJADO_POR=null;

	switch(this.estado)
	{
		case Jugador.prototype.ESTADO_REBOTE:
			this.tiempo_rebote+=delta;
			if(this.tiempo_rebote >= this.tiempo_max_rebote)
			{
				this.estado=Jugador.prototype.ESTADO_NORMAL;
			}
		break;

		case Jugador.prototype.ESTADO_ESPADA:
			this.tiempo_espada+=delta;
			if(this.tiempo_espada >= this.tiempo_max_espada) 
			{
				this.tiempo_espada=0;
				this.estado=Jugador.prototype.ESTADO_NORMAL;
			}
		break;
	}
}

Jugador.prototype.obtener_vector_x_izquierda=function()
{
	if(this.en_aire) return -5.0;
	else return -10.0;
}

Jugador.prototype.obtener_vector_x_derecha=function()
{
	if(this.en_aire) return 5.0;
	else return 10.0;
}

Jugador.prototype.obtener_vector_subir_escalera=function(){return -100;}
Jugador.prototype.obtener_vector_bajar_escalera=function(){return 100;}

Jugador.prototype.puede_rebotar_en_caja=function(c) 
{
	if(!c instanceof Caja)
	{
		return false;
	}
	else
	{
		var resultado=
		this.POSICION.y >= c.y && 
		this.POSICION.y+this.CAJA.h <= c.y+c.h &&
		this.habilitado_rebote && this.vector.y < 0 && this.es_en_aire();

		return resultado;
	}
}
Jugador.prototype.es_en_aire=function() {return this.en_aire;}
Jugador.prototype.poner_en_aire=function(v) 
{
	this.en_aire=v;
	
	if(!v)
	{
		this.realizado_salto_doble=false;
	}
}

Jugador.prototype.unir_a=function(va)
{
	if(va instanceof Jugador && va != this.UNIDO_A)
	{
		this.UNIDO_A=va;
		this.poner_en_aire(false);
	}
}

/*La lógica del salto: cuando tenemos un sólo salto solo podemos saltar si no
estamos en el aire. Cuando tenemos dos saltos podemos saltar desde el suelo una
vez y luego una segunda, o bien, desde el aire (cayendo, por ejemplo) una vez 
más.
*/

Jugador.prototype.puede_saltar=function()
{
	if(!this.habilitado_salto_doble) 
	{
		return !this.es_en_aire();
	}
	else
	{
		if(!this.es_en_aire()) 
		{
			return true;
		}
		else 
		{
			return !this.realizado_salto_doble;
		}
	}
}

/*Para usar la espada tenemos que estar en el estado correcto y tener habilitada
la espada.*/

Jugador.prototype.puede_usar_espada=function()
{
	return this.habilitada_espada &&
		this.estado!=Jugador.prototype.ESTADO_ESPADA &&
		this.tiempo_espada==0;		
}
Jugador.prototype.usar_espada=function()
{
	resultado=this.direccion;
	if(!this.es_en_aire()) this.establecer_vector(0.0, false);
	this.estado=Jugador.prototype.ESTADO_ESPADA;

	return resultado;
}


/*Cuando el jugador acaba de ser empujado almacenará el "EMPUJADO POR" pero
no se moverá del sitio: guardará el vector y saldrá de la colisión cuando llegue
el turno. */

Jugador.prototype.ser_empujado_por=function(va)
{
	if(va instanceof Jugador && va != this.EMPUJADO_POR)
	{
		this.EMPUJADO_POR=va;
	}
}

Jugador.prototype.saltar=function()
{
	this.estado=Jugador.prototype.ESTADO_NORMAL;
	this.UNIDO_A=null;
	this.establecer_vector(false, -160.0);

	if(this.es_en_aire())
	{
		this.realizado_salto_doble=true;
	}

	this.poner_en_aire(true);
}

Jugador.prototype.sumar_posicion=function(vx, vy)
{
	if(vx!==false) this.POSICION.x+=vx;
	if(vy!==false) this.POSICION.y+=vy;
	this.CAJA.recibir_datos(this.POSICION.x, this.POSICION.y, false, false);
}

Jugador.prototype.establecer_vector=function(vx, vy)
{
	if(vx!==false) 
	{
		this.vector.x=vx;
		if(vx) this.direccion=vx > 0 ? 1 : -1;
	}
	if(vy!==false) this.vector.y=vy;
//debug("ESTABLECER VECTOR "+vx+", "+vy);
}

Jugador.prototype.recibir_vector=function(vx, vy)
{
	if(vx) 
	{
		this.vector.x+=vx;
		this.direccion=vx > 0 ? 1 : -1;
	}
	if(vy) this.vector.y+=vy;
}

Jugador.prototype.limitar_vector=function(vx, vy)
{
	if(vx) 
	{
		var x=Math.abs(this.vector.x);
		if(x > this.max_vector.x) 
		{
			x=this.max_vector.x;
			if(this.vector.x > 0) this.vector.x=x;
			else this.vector.x=-x;
		}
	}

	if(vy)
	{
		var y=Math.abs(this.vector.y);

		if(y > this.max_vector.y)
		{
			y=this.max_vector.y;
			if(this.vector.y > 0) this.vector.y=y;
			else this.vector.y=-y;
		}
	}
}

Jugador.prototype.frenar_vectores=function(vx, vy)
{
	switch(this.estado)
	{
		case Jugador.prototype.ESTADO_NORMAL:

			if(this.vector.x && vx)
			{
				var x=Math.abs(this.vector.x) - this.freno_vector.x;
				if(x < 0) x=0.0;

				this.vector.x=this.vector.x > 0 ? x : -x;
			}
		break;

		case Jugador.prototype.ESTADO_ESCALERA:
			
			this.vector.y=0;
	
		break;
	}

/*
	if(this.vector.y && vy)
	{
		var y=Math.abs(this.vector.y) - this.freno_vector.y;
		if(y < 0) y=0.0;

		if(this.vector.y > 0) this.vector.y=y;
		else this.vector.y=-y;
	}
*/
}

Jugador.prototype.actuar_correccion_dimension=function(delta, tipo, cantidad)
{
	var resultado=0;

	//Movimiento eje X.

	if(tipo & 1)
	{
		var dx=0;
	
		switch(this.estado)
		{
			case Jugador.prototype.ESTADO_ESPADA:
				if(!this.es_en_aire()) break;
		
			case Jugador.prototype.ESTADO_NORMAL:
		
				if(cantidad)
				{
					dx=cantidad;
				}
				else
				{ 
					var x=this.vector.x;
					if(this.UNIDO_A) x+=this.UNIDO_A.vector.x;
					dx=x*delta;
				}

				if(Math.abs(dx) >= this.CAJA.w) 
				{
					resultado=dx-this.CAJA.w;
					dx=this.CAJA.w;			
				}

			break;
					
			case Jugador.prototype.ESTADO_REBOTE:
			case Jugador.prototype.ESTADO_ESCALERA:

			break;
		}		
	
		this.sumar_posicion(dx, false);
	}

	//Movimiento eje Y con gravedad.

	if(tipo & 2)
	{
		var dy=0;

		switch(this.estado)
		{
			case Jugador.prototype.ESTADO_NORMAL:
			case Jugador.prototype.ESTADO_ESPADA:

				//Si estamos unidos a algo empezamos por colocarnos en la posición Y
				//correspondiente.
				if(this.UNIDO_A)
				{
					var y=this.UNIDO_A.POSICION.y - this.CAJA.h;
					this.establecer_posicion(false, y);
				}

				//Ahora ya podemos empezar con la gracia.
	
				var ov=this.vector.y;
				this.vector.y+=this.gravedad * delta;
				var y=ov + this.vector.y;
		
				dy=cantidad ? cantidad : (y) * 0.5 * delta;
		
				if(Math.abs(dy) >= this.CAJA.h) 
				{
					resultado=dy-this.CAJA.h;
					dy=this.CAJA.h;
				}

				this.sumar_posicion(false, dy);
			break;
		
			case Jugador.prototype.ESTADO_REBOTE:
				//Nada de nada.
			break;

			case Jugador.prototype.ESTADO_ESCALERA:
				var y=this.vector.y;
				var dy=y * delta;

				this.sumar_posicion(false, dy);

				//Un detalle, si estamos fuera de la escalera reajustamos...

				if(this.POSICION.y < this.ESCALERA.POSICION.y) 
				{
					this.establecer_posicion(false, this.POSICION.y=this.ESCALERA.POSICION.y);
					this.establecer_vector(false, 0.0);
				}

			break;
		}


	}

	return resultado;
}

Jugador.prototype.evaluar_union=function()
{
	if(this.UNIDO_A)
	{
		if(
			(this.POSICION.x+this.CAJA.w < this.UNIDO_A.POSICION.x ||
			this.POSICION.x > this.UNIDO_A.POSICION.x+this.UNIDO_A.CAJA.w || 
			this.POSICION.y+this.CAJA.h < this.UNIDO_A.POSICION.y
			)
		) 
		{
			this.UNIDO_A=null;
			this.poner_en_aire(true); //Presumiblemente.
		}
	}
}

Jugador.prototype.subir_a_escalera=function(E)
{
	this.estado=Jugador.prototype.ESTADO_ESCALERA;
	this.establecer_vector(0.0, false);
	this.establecer_posicion(E.POSICION.x, false);

	this.UNIDO_A=null;	
}

Jugador.prototype.sacar_de_escalera=function()
{
	this.estado=Jugador.prototype.ESTADO_NORMAL;
	if(this.vector.y > 0) this.establecer_vector(false, 0.0);	//Para no saltar por arriba
}
