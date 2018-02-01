/*TODO.
control en aire para rebote no tiene bien feeeling...
realizar plataformas one way móviles que no te aplasten.
definir cajas móviles en json.
definir activación cajas móviles en json.
globales y activación de cosas según los valores globales.

editor???
rampas
escalones.
*/

function Controlador()
{
	this.canvas=document.getElementById('cv');

	this.W=600;
	this.H=400;

	this.canvas.width=this.W;
	this.canvas.height=this.H;

	this.cx=this.canvas.getContext('2d');

	this.INPUT=new Control_input();
	this.INPUT.asignar_control_raton(this.canvas);

	this.CAMARA=new Camara(0,0, this.W, this.H);
	this.CAMARA.establecer_caja_margen(new Caja(200, 100, 200, 200));

	this.REPRESENTADOR=new Representador_canvas();
	this.REPRESENTADOR.vincular_camara(this.CAMARA);

	this.activo=true;
	this.ultimo_momento=0;
	this.delta=0.0;

	//Grupos de funcionalidad.
	this.ATACABLES=Array();		//Cosas que se pueden atacar.
	this.COLISIONABLES=Array();	//Cosas sólidas con las que se choca.

	//Grupos de objetos concretos...
	this.CON_ACCION=Array();	//Cosas que tienen "actuar" en ambos ejes.
	this.OBSTACULOS=Array(); 	//Obstáculos sólidos y estáticos propiamente dichos.
	this.DESTRUIBLES=Array(); 	//Cosas que se pueden destruir.
	this.BONUS=Array();		//Bonus.
	this.ESCALERAS=Array();	//Escaleras.

	this.SALIDAS=Array();		//Salidas del nivel.
	this.INTERVALO=null;

	this.NIVELES={};	//Las cadenas de los niveles...
	this.MEMORIA={};	//Información de los niveles que se mantiene al salir de uno.
	this.indice_memoria=1;
	this.nivel_actual='';	//Cadena del nivel que estamos jugando.

	this.ARRANCADO=false;

	this.direcciones_colisiones_en_turno=0;
	this.aplastamiento=false;
	this.tocado_letal=false;

	this.ESPADA=new Espada(0,0);
}

Controlador.prototype.MODO_JUEGO=1;
Controlador.prototype.MODO_EDITOR=1;

Controlador.prototype.iniciar=function()
{
	var aquello=this;

	this.cx.font='10px monospace';
	this.cx.textBaseline='bottom';

	requestAnimationFrame(this.dibujar.bind(this));
}

Controlador.prototype.arrancar=function()
{
	if(this.ARRANCADO) return;
	else
	{
		var aquello=this;
		this.ARRANCADO=true;
		this.INTERVALO=setInterval(function(){aquello.loop();}, 16.666);
		this.ultimo_momento=Date.now();
	}
}

Controlador.prototype.parar=function()
{
	clearInterval(this.INTERVALO);
	this.ARRANCADO=false;
}

Controlador.prototype.procesar_input=function()
{
	this.INPUT.capturar();

	if(this.INPUT.es_tecla_down('lalt')) this.activo=!this.activo;

	if(!this.activo) return;

	//Control propio del jugador...

	var vx=0.0;
	var vy=0.0;		

	switch(this.J.estado)
	{
		case Jugador.prototype.ESTADO_NORMAL:
	
			if(this.INPUT.es_tecla_pulsada('izquierda')) vx=this.J.obtener_vector_x_izquierda();
			else if(this.INPUT.es_tecla_pulsada('derecha')) vx=this.J.obtener_vector_x_derecha();

			if(this.INPUT.es_tecla_down('espacio'))
			{
				if(this.J.puede_saltar())
				{
					this.J.saltar();
				}
			}

			if(this.INPUT.es_tecla_down('abajo'))
			{
				this.comprobar_salida();
			}


			if(this.INPUT.es_tecla_down('lcontrol')) 
			{
				if(this.J.puede_usar_espada())
				{
					var dir=this.J.usar_espada();
					this.ESPADA.activar(this.J.CAJA, dir);
				}			
			}

			if(this.J.ESCALERA)
			{
				if(this.INPUT.es_tecla_down('arriba') || this.INPUT.es_tecla_down('abajo'))
				{
					this.J.subir_a_escalera(this.J.ESCALERA);
				}
			}	

			if(vx) this.J.recibir_vector(vx, false); 
			else this.J.frenar_vectores(true, false);

			if(vy) this.J.recibir_vector(false, vy);
			else this.J.frenar_vectores(false, true); //No sÃƒÆ’Ã‚Â© si esto hace algo bueno...

			this.J.limitar_vector(true, false);

		break;
	
		case Jugador.prototype.ESTADO_ESCALERA:

			this.J.frenar_vectores(false, true);

			if(this.INPUT.es_tecla_down('espacio')) 
			{
				this.J.saltar();
			}
			else if(this.INPUT.es_tecla_pulsada('arriba')) vy=this.J.obtener_vector_subir_escalera();
			else if(this.INPUT.es_tecla_pulsada('abajo')) vy=this.J.obtener_vector_bajar_escalera();

			if(vy) this.J.recibir_vector(false, vy);

		break;

		case Jugador.prototype.ESTADO_REBOTE:
			if(this.INPUT.es_tecla_down('espacio')) 
			{
				this.J.rebotar();
			}
		break;
	}
}


Controlador.prototype.comprobar_salida=function()
{
	//Salidas del nivel...
	
	var l=this.SALIDAS.length;
	var i=0;

	while(i < l)
	{
		var e=this.SALIDAS[i];
		if(e.en_contacto_con_jugador(this.J))
		{
			this.parar();
			this.nivel_actual=e.nivel;
			this.importar(this.NIVELES[e.nivel], e.id);
			this.arrancar();
			return;
		}

		++i;
	}
}

Controlador.prototype.loop=function(v_delta)
{
	if(v_delta)
	{
		this.delta=v_delta / 1000;
	}
	else
	{
		var ahora=Date.now(); 	//Cogemos el momento actual...
		this.delta=(ahora-this.ultimo_momento) / 1000;
		this.ultimo_momento=ahora; 	//Actualizamos el ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âºltimo momento..
	}

	if(this.delta > 50) this.delta=50;	//Máximo delta permitido. Más allá relentizamos.

	this.procesar_input();

	if(this.activo) 
	{
		var colisiones=Array();
		this.direcciones_colisiones_en_turno=0;
		this.CAMARA.centrar_en(this.J.CAJA);
		this.J.iniciar_turno(this.delta);
		this.ESPADA.turno(this.delta);

		//Aquí los elementos dinámicos se mueven y se almacenan posibles
		//resultados de colisiones con el jugador. Estos elementos pueden
		//cambiar la posición y el vector del jugador.
		this.procesar_colision_con_elementos_dinamicos(colisiones);

		//Aquí es donde el jugador se "Mueve". Choca con los elementos
		//del escenario estáticos y con los dinámicos como si fueran 
		//estáticos.
		this.procesar_colision_con_elementos_estaticos(colisiones, 1, 2);

		//Puede haber muchas colisiones. Aquí se procesan todas. Algunas
		//de las colisiones pueden actuar directamente sobre el jugador.
		if(colisiones.length) this.procesar_colisiones_almacenadas(colisiones);		

		//Evaluar si aún estamos o no unidos a algo.
		this.J.evaluar_union();
/*
var ciz=this.direcciones_colisiones_en_turno & Caja.prototype.IZQUIERDA;
var car=this.direcciones_colisiones_en_turno & Caja.prototype.ARRIBA;
var cde=this.direcciones_colisiones_en_turno & Caja.prototype.DERECHA;
var cab=this.direcciones_colisiones_en_turno & Caja.prototype.ABAJO;
debug(ciz+" "+car+" "+cde+" "+cab);
*/

		this.aplastamiento=(this.direcciones_colisiones_en_turno & Caja.prototype.IZQUIERDA && this.direcciones_colisiones_en_turno & Caja.prototype.DERECHA)
			|| (this.direcciones_colisiones_en_turno & Caja.prototype.ARRIBA && this.direcciones_colisiones_en_turno & Caja.prototype.ABAJO);

		if(this.aplastamiento)
		{
//			debug("APLASTAMIENTO***************************");
			alert("APLASTAMIENTO***************************");
		}

		if(this.tocado_letal)
		{
			alert("TOCADO LETAL****************************");
		}

		//OJO: Esto no haría "step".
		this.actualizar_estado();

		this.evaluar_resultados();
	}
}

//Se hace la colisión del jugador con todos los elementos que pueden comportarse
//como estáticos, esto es, bloques realmente estáticos y luego las cajas móviles
//antes de que se muevan. En caso de producirse colisiones con cajas especiales
//(las móviles) almacenaremos la información de las mismas para procesarlas al
//final de todo.
//Durante esta fase sólo se resuelven colisiones.

//TODO: Sería interesante hacer una versión más refinada de esto para poder
//reusarla en otros sitios, sin código particular de esta aplicación.

Controlador.prototype.procesar_colision_con_elementos_estaticos=function(array_colisiones, eje_1, eje_2)
{
	//Primero en eje X
	var COL_X=new Contacto_actor();
	var COL_Y=new Contacto_actor();

	var correccion=0;

	if(eje_1) 
	{
//debug("INI X ESTATICO");
		correccion=this.obtener_correccion_con_pasos_dinamico_contra_estatico(Caja.prototype.IZQUIERDA, Caja.prototype.DERECHA, COL_X, eje_1);
	}

	if(correccion)
	{
		var correccion_final=COL_X.direccion==Caja.prototype.IZQUIERDA ? -correccion : correccion;
		this.J.sumar_posicion(correccion_final, false);
		this.J.establecer_vector(0.0, false);
		this.direcciones_colisiones_en_turno|=COL_X.direccion;
		array_colisiones.push(COL_X);

		//TODO: Quizás también que la pared lo permita.
		if(this.J.puede_rebotar_en_caja(COL_X.actor_contacto.CAJA))
		{
			this.J.preparar_para_rebote(COL_X.direccion);
		}	

//debug("CHOQUE CON X ESTATICO "+COL_Y.direccion+" "+correccion_final+" QUEDA EN "+this.J.CAJA.como_cadena());
	}

	//Ahora en eje Y. AdemÃ¡s, se evalÃºa si estÃ¡ en el aire.
	correccion=0;
	if(eje_2) 
	{
		correccion=this.obtener_correccion_con_pasos_dinamico_contra_estatico(Caja.prototype.ARRIBA, Caja.prototype.ABAJO, COL_Y, eje_2);
	}

	if(correccion) 
	{
		var correccion_final=COL_Y.direccion==Caja.prototype.ARRIBA ? -correccion : correccion;
		this.J.sumar_posicion(false, correccion_final);
		this.J.establecer_vector(false, 0.0);
		this.direcciones_colisiones_en_turno|=COL_Y.direccion;
		array_colisiones.push(COL_Y);

//debug("CHOQUE CON Y ESTATICO "+COL_Y.direccion+" "+correccion_final+" QUEDA EN "+this.J.CAJA.como_cadena());

		switch(COL_Y.direccion)
		{
			case Caja.prototype.ARRIBA: 
				this.J.poner_en_aire(false); 
				if(this.J.estado==Jugador.prototype.ESTADO_ESCALERA) this.J.sacar_de_escalera();	//Esto es tocar el suelo en una escalera.
			break;
		}
	}
}

/*Movemos cada elemento móvil y lo comparamos con el jugador. Durante todo
este proceso las posiciones relativas de las colisiones son del elemento 
móvil con respecto al jugador, por lo que tendremos que hacer algunas historias
al almacenarlas si queremos luego usarlas...
Al detectar una colisión se repara al momento. Normalmente el vector no se toca
para nada, simplemente corregimos y en el siguiente paso, si el actor lleva 
la dirección adecuada ya se corregirá sólo.*/

//TODO: Sería interesante hacer una versión más refinada de esto para poder
//reusarla en otros sitios, sin código particular de esta aplicación.

Controlador.prototype.procesar_colision_con_elementos_dinamicos=function(array_colisiones)
{
	//Cada elemento con acción realiza su movimiento.

	var l=this.CON_ACCION.length, i=0;
	while(i < l) 
	{
		//OJO CON ESTO: Si las plataformas se mueven DEMASIADO rápido
		//pueden traspasar al jugador. Se puede añadir aquí un poco de 
		//scan para solucionarlo.

		//Sólo se realizarán las comprobaciones si hay vector en ese
		//eje... En caso contrario estaríamos perdiendo el tiempo y,
		//según he comprobado, induciendo nuevos errores de colisiones
		//fantasma.

		var a=this.CON_ACCION[i];

		if(a.vector.x)
		{
			//Mover el eje X...
			a.actuar(this.delta, 1);	

			//Evaluar colisiones con el jugador. Si las hubiera tendríamos que
			//recolocarlo. Durante todo el proceso la posición relativa debe
			//ser la del jugador con respecto a la caja.
			var correccion=0;

			if(a.CAJA.en_colision_con_caja(this.J.CAJA) )
			{
//debug("INI X DINAMICO");
				//Si vamos a la izquierda chocamos por la izquierda...
				var posicion_relativa=a.vector.x < 0 ? Caja.prototype.IZQUIERDA : Caja.prototype.DERECHA;

				//Se calculan los parámetros con la caja primero, el jugador luego.
				correccion=this.obtener_correccion_para_cajas(this.J.CAJA, a.CAJA, posicion_relativa);
				this.direcciones_colisiones_en_turno|=posicion_relativa;

				var COL_X=new Contacto_actor();
				COL_X.almacenar(a, posicion_relativa, correccion, a.obtener_tipo_colision());
				array_colisiones.push(COL_X); 

				this.J.ser_empujado_por(a);	

				var correccion_final=COL_X.direccion==Caja.prototype.IZQUIERDA ? -correccion : correccion;

//debug("CHOQUE CON X DINAMICO "+posicion_relativa+" "+correccion_final+" QUEDA EN "+this.J.CAJA.como_cadena());

				//Para evitar errores de decimales acumulados stablecemos directamente
				//la posición. Antes se añadía el vector de turno pero terminaba por
				//quedar un poco por detrás y volver a colisionar con lo mismo. El vector
				//no lo tocamos: se hace en "ser empujado por".

				this.J.sumar_posicion(correccion_final, false);
			}
		}
		
		if(a.vector.y)
		{
			//Mover el eje Y...
			a.actuar(this.delta, 2);	

			if(a.CAJA.en_colision_con_caja(this.J.CAJA))
			{
				//Como nada se ha movido salvo este actor, si va hacia abajo es que choca con algo por abajo...
				var posicion_relativa=a.vector.y > 0 ? Caja.prototype.ABAJO : Caja.prototype.ARRIBA;
				var correccion=this.obtener_correccion_para_cajas(this.J.CAJA, a.CAJA, posicion_relativa);
				this.direcciones_colisiones_en_turno|=posicion_relativa;

				var COL_Y=new Contacto_actor();
				COL_Y.almacenar(a, posicion_relativa, correccion, a.obtener_tipo_colision());
				array_colisiones.push(COL_Y);

				var correccion_final=COL_Y.direccion==Caja.prototype.ARRIBA ? -correccion : correccion;
				this.J.sumar_posicion(false, correccion_final);

//debug("CHOQUE CON Y DINAMICO "+posicion_relativa+" "+correccion_final+" QUEDA EN "+this.J.CAJA.como_cadena());

				switch(COL_Y.direccion)
				{
					//Si caes sobre algo ya no estás en el aire.
					case Caja.prototype.ARRIBA: this.J.poner_en_aire(false); break;						//Choque con plataforma que baja... Te da un empuje superior al del actor, para que no vuelva a bajar y a darte de nuevo. Ya ha corregido.
					//Choque con plataforma que baja... Te da un empuje superior al del actor, para que no vuelva a bajar y a darte de nuevo. Ya ha corregido.
					case Caja.prototype.ABAJO: this.J.establecer_vector(false, COL_Y.actor_contacto.vector.y * 2); break;	
				}
			}
		}

		++i;
	}
}

//Todas las colisiones almacenadas se procesan. Algunos bloques pueden tener
//efectos especiales, como unirnos a los mismos.

Controlador.prototype.procesar_colisiones_almacenadas=function(array_colisiones)
{
	var l=array_colisiones.length, i=0;

	while(i < l)
	{
		if(array_colisiones[i].valida)
		{
			var c=array_colisiones[i];

			switch(c.tipo)
			{
				//La caja móvil es una que puede empujarte
				//pero en la que también te puedes montar sin problemas.

				case Actor.prototype.TIPO_COLISION_CAJA_MOVIL:
		
					//Ojo con izquierda y derecha, son según la "plataforma"...

					switch(c.direccion)
					{	
						case Caja.prototype.ARRIBA: //Si caemos encima se une.
							this.J.unir_a(c.actor_contacto);
						break;
					}
				break;

				case Actor.prototype.TIPO_COLISION_LETAL_TACTO:
					this.tocado_letal=true;
				break;
			}
		}
		
		++i;
	}
}

Controlador.prototype.actualizar_estado=function()
{
	/**********************************************************************/
	//Recoger items...

	var l=this.BONUS.length, i=0;
	
	while(i < l)
	{
		var b=this.BONUS[i];
		if(this.J.CAJA.en_colision_con_caja(b.CAJA)) this.recoger_bonus(b);
		++i;
	}
	
	//Escaleras...

	l=this.ESCALERAS.length;
	i=0;

	this.J.ESCALERA=null;

	while(i < l)
	{
		var e=this.ESCALERAS[i];
		if(e.en_contacto_con_jugador(this.J))
		{
			this.J.ESCALERA=e;
			break;
		}

		++i;
	}

	//Evaluar si nos salimos de una escalera... 
	if(this.J.estado==Jugador.prototype.ESTADO_ESCALERA && !this.J.ESCALERA) 
	{
		this.J.sacar_de_escalera();
	}

	//Evaluar la espada contra los actores atacables...

	if(this.ESPADA.puede_herir())
	{
		l=this.ATACABLES.length;
		i=0;

		while(i<l)
		{
			var a=this.ATACABLES[i++];
			if(this.ESPADA.en_contacto_con(a.CAJA))
			{
				a.recibir_ataque(10);
			}
		}
	}
}

Controlador.prototype.evaluar_resultados=function()
{
	//Borrar los recogidos...
	var l=this.BONUS.length, i=0;
	while(i < l)
	{
		if(this.BONUS[i].para_borrar)
		{
			//Borrarlo de la memoria.
			var id_memoria=this.BONUS[i].id_memoria;
			this.MEMORIA[this.nivel_actual].b[id_memoria]=null;
			delete this.MEMORIA[this.nivel_actual].b[id_memoria];

			//Borrarlo del array del nivel.
			this.BONUS.splice(i, 1);		
			i=0;
			l=this.BONUS.length;
		}

		++i;
	}	

	//Destruir los destruidos.
	l=this.DESTRUIBLES.length;
	i=0;

	while(i < l)
	{
		var a=this.DESTRUIBLES[i];

		if(a.para_borrar)
		{
			//Lo borramos de colisionables y atacables: funcionalidad o interfaces, por así decirlo.
			var pos=this.COLISIONABLES.indexOf(a);
			if(pos!=-1) this.COLISIONABLES.splice(pos, 1);

			pos=this.ATACABLES.indexOf(a);
			if(pos!=-1) this.ATACABLES.splice(pos, 1);

			//Borrarlo del array.
			this.DESTRUIBLES.splice(i, 1);		
			i=0;
			l=this.DESTRUIBLES.length;
		}

		++i;
	}
}

Controlador.prototype.recoger_bonus=function(bonus)
{
	var a=this.BONUS.indexOf(bonus);
	if(a!=-1) 
	{
		this.BONUS[a].para_borrar=true;
	}
}

Controlador.prototype.obtener_correccion_con_pasos_dinamico_contra_estatico=function(tipo_a, tipo_b, colision, dimension, colisionables)
{
	var ajuste_dimension=0, correccion=0, temp=0, i=0, l=this.COLISIONABLES.length;

	do
	{
		ajuste_dimension=this.J.actuar_correccion_dimension(this.delta, dimension, ajuste_dimension);
		i=0;

		//Se recorre cada actor y se guarda la mayor correcciÃ³n...
		while(i < l)
		{
			//Temp es un valor, siempre positivo, que indica la cantidad de
			//correccion necesaria en un eje. Se asume que sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³lo se puede
			//aplicar la correcciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n en una direcciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n del eje.
			
			if(this.J.CAJA.en_colision_con_caja(this.COLISIONABLES[i].CAJA))
			{
				var posicion_relativa=Caja.prototype.DESCONOCIDA;
				switch(dimension)
				{		
					case 1:
						//En función de si estamos montados en una plataforma o no sumamos el vector de la misma.
						//No se tiene en cuenta si una plataforma nos empuja: esa establece la posición.
						//Es importante sumar el vector de unido_a, para por ejemplo, chocar con una plataforma mientras otra nos lleva.

						if(this.J.UNIDO_A)
						{
							var vx=this.J.vector.x + this.J.UNIDO_A.vector.x;
						}
						//Si nos están empujando pueden pasar varias cosas: estoy quieto y me empujan -
						//me muevo en la dirección que me empujan o me empujan y voy en contra. Esto último
						//es porque si te empujan o no se activa en este mismo paso pero antes. Si se activase todo
						//al final del paso no habría estas comprobaciones.
						else if(this.J.EMPUJADO_POR)
						{
							var vemp=this.J.EMPUJADO_POR.vector.x;
							var vex=this.J.vector.x;

							//Parado o empujado en la misma dirección....
							if(!vex || ( (vex > 0 && vemp > 0) || (vex < 0 && vemp < 0) ) )
							{
								var vx=vemp;
							}
							//Se mueve y va en contra.
							else
							{
								var vx=vex;
							}

						}
						else
						{
							var vx=this.J.vector.x;
						}

						if(vx)
						{
							if(vx > 0) posicion_relativa=Caja.prototype.IZQUIERDA;
							else if(vx < 0) posicion_relativa=Caja.prototype.DERECHA;
						}
					break;

					case 2:
		
						//Caso estrafalario: estamos unidos a algo que sube pero tenemos un vector negativo...
						//...que no es otra cosa que la gravedad. Hacen falta varias comprobaciones: primero 
						//que estamos unidos a algo que sube, luego que tenemos vector parado o que apunta hacia
						//abajo y luego que estemos seguros de que la caja con la que chocamos realmente está sobre
						//el jugador pero al menos un eje está dentro...

						var col=this.COLISIONABLES[i];

						if(this.J.UNIDO_A && this.J.UNIDO_A.vector.y < 0 && this.J.vector.y >= 0
  						&& (this.J.POSICION.y <= col.POSICION.y+col.CAJA.h && this.J.POSICION.y+this.J.CAJA.h >= col.POSICION.y+col.CAJA.h)
						)
						{
							//Recordemos que posición relativa significa "dónde estoy con respecto a la caja"...".
							if(this.J.UNIDO_A.vector.y < 0) posicion_relativa=Caja.prototype.ABAJO;
						}
						else if(this.J.vector.y)
						{
							if(this.J.vector.y > 0) posicion_relativa=Caja.prototype.ARRIBA;
							else if(this.J.vector.y < 0) posicion_relativa=Caja.prototype.ABAJO;
						}
				
					break;
				}

				temp=this.obtener_correccion_para_cajas(this.J.CAJA, this.COLISIONABLES[i].CAJA, posicion_relativa);

				//Si aumentamos la corrección guardamos también la información del 
				//actor con el que colisionamos.
				if(temp > correccion) 
				{
					correccion=temp;
					colision.almacenar(this.COLISIONABLES[i], posicion_relativa, correccion, this.COLISIONABLES[i].obtener_tipo_colision());
				}
			}
			
			++i;
		}
		
		//Si hay correcciÃ³n no tenemos que seguir haciendo el scan.
		if(correccion) break;
	}
	while(ajuste_dimension);

	return correccion;
}

Controlador.prototype.obtener_correccion_para_cajas=function(caja_a, caja_b, posicion_relativa_anterior)
{
	switch(posicion_relativa_anterior)
	{		
		case Caja.prototype.ARRIBA: return caja_a.y+caja_a.h - caja_b.y; break; //El eje inferior a contra el eje superior b...	
		case Caja.prototype.ABAJO: return caja_b.y+caja_b.h - caja_a.y; break; //El eje superior a contra el eje inferior b...
		case Caja.prototype.IZQUIERDA: return caja_a.x+caja_a.w - caja_b.x; break; //El eje derecho a contra el eje izquierdo b
		case Caja.prototype.DERECHA: return caja_b.x+caja_b.w - caja_a.x; break; //El eje izqueirdo a contra el eje derecho b
		default: return 0; break;
	}
}

Controlador.prototype.dibujar=function()
{
	this.REPRESENTADOR.limpiar_representacion(this.cx, this.activo ? "#000" : "#900", this.W, this.H);
	
	var i=0;
	var l=this.ESCALERAS.length;

	while(i < l)
	{
		var a=this.ESCALERAS[i++];
		this.REPRESENTADOR.representar_rectangulo(this.cx, a.CAJA, "#fff");
	}

	i=0;
	l=this.SALIDAS.length;

	while(i < l)
	{
		var s=this.SALIDAS[i++];
		this.REPRESENTADOR.representar_rectangulo(this.cx, s.CAJA, "#090");
	}

	i=0;
	l=this.OBSTACULOS.length;

	while(i < l)
	{
		var a=this.OBSTACULOS[i++];
		if(a.es_visible) this.REPRESENTADOR.representar_caja(this.cx, a.CAJA, a.color);
	}

	i=0;
	l=this.CON_ACCION.length;
	while(i < l)
	{
		var a=this.CON_ACCION[i++];
		if(a.es_visible) this.REPRESENTADOR.representar_caja(this.cx, a.CAJA, a.color);
	}

	i=0;
	l=this.DESTRUIBLES.length;

	while(i < l)
	{
		var a=this.DESTRUIBLES[i++];
		this.REPRESENTADOR.representar_caja(this.cx, a.CAJA, "#F5F");
	}

	i=0;
	var l=this.BONUS.length;

	while(i < l)
	{
		var a=this.BONUS[i++];
		this.REPRESENTADOR.representar_circulo(this.cx, a.CAJA, "#A5B");
	}
	
	if(this.J)
	{
		var color=Caja.prototype.convertir_a_entero ? '#090' : '#FFF';
		this.REPRESENTADOR.representar_caja(this.cx, this.J.CAJA, color); //, this.J.color);
	}

	if(this.ESPADA.activa)
	{
		var x=this.ESPADA.CAJA.x+(this.ESPADA.CAJA.w / 2);
		var y=this.ESPADA.CAJA.y+(this.ESPADA.CAJA.h / 2);

		this.REPRESENTADOR.representar_arco(this.cx, x, y, this.ESPADA.CAJA.w / 2, 			
			this.ESPADA.rep_angulo_ini, 
			this.ESPADA.rep_angulo_fin,
			this.ESPADA.rep_sentido_horario, 
			"#fff");
	}

//	this.REPRESENTADOR.desactivar_camara();
//	this.REPRESENTADOR.representar_rectangulo(this.cx, this.CAMARA.CAJA_MARGEN, "#009");
//	this.REPRESENTADOR.activar_camara();

	requestAnimationFrame(this.dibujar.bind(this));
}

Controlador.prototype.importar_niveles=function(data)
{
	var datos=JSON.parse(data);
	if(!datos.niveles)	
	{
		alert("ERROR: Sin niveles");
	}
	else
	{
		var l=datos.niveles.length;
		var i=0;

		while(i<l)
		{
			var nombre=datos.niveles[i].nombre;
			var datos_nivel=datos.niveles[i].datos;
	
			this.NIVELES[nombre]=datos_nivel;
			++i;
		}
	}

	//Y ahora importamos también la memoria. Se organiza del mismo modo que
	//los niveles: pero cada vez que actuamos sobre un objeto de memoria se
	//guarda la interacción y se recuerda para la próxima. Cuando se cargan
	//estos objetos se asigna un id a cada uno y se usa como índice en la
	//forma "MEMORIA[nivel][tipo][indice], apunte a lo que sea que apunte.
	
	if(datos.memoria)
	{
		var l=datos.memoria.length;
		var i=0;

		while(i<l)
		{
			var nombre=datos.memoria[i].nombre;
		
			//Bonus...
			if(datos.memoria[i].datos.b)
			{
				var lb=datos.memoria[i].datos.b.length;
				var ib=0;
				
				this.MEMORIA[nombre]={"b" : []};

				while(ib < lb)
				{
					var id=this.indice_memoria++;
					var t=datos.memoria[i].datos.b[ib];
					t.id_memoria=id;
					this.MEMORIA[nombre].b[id]=t;
					++ib;
				}
			}
			++i;
		}
	}
}

/*
Importar recibe "data" como un objeto JSON.
Antes de hacer nada eliminará todo lo que hay en el mapa.

La estructura del json

"j" -> array de posiciones de inicio. cada una tiene x, y e id. Por defecto se entra por el id 0.
"s" -> array de salidas del nivel... cada una tendria x, y, t, n, id. t sería Tipo 0 -> por contacto, 1 -> por uso. n sería el id del nivel a cargar. id sería la salida del nuevo nivel por la que apareceremos.
"o" -> array de obstáculo colisionables, definidos según un objeto {x, y, w, h}. Si se pone un parámetro "v" será invisible.
"l" -> array de obstáculos letales, definidos según un objeto {x, y, w, h}. Si se pone un parámetro "v" será invisible.
"e" -> array de escaleras, definidos según un objeto {x, y, h}, siempre tienen el mismo ancho.
"b" -> array de bonus, definidos según un objeto {x, y}

*/

Controlador.prototype.importar_de_json=function(data, v_id_entrada)
{
	var datos=JSON.parse(data);
	this.importar(datos, v_id_entrada);
}

Controlador.prototype.distribuir_elemento=function(elemento)
{
	if(elemento instanceof Escalera)	
	{
		this.ESCALERAS.push(elemento);
	}
	else if(elemento instanceof Salida)
	{
		this.SALIDAS.push(elemento);
	}
	else if(elemento instanceof Actor)
	{
		this.COLISIONABLES.push(elemento);
		this.OBSTACULOS.push(elemento);
	}
	else if(elemento instanceof Obstaculo_destruible)
	{
		this.DESTRUIBLES.push(elemento);
		this.ATACABLES.push(elemento);
		this.COLISIONABLES.push(elemento);
	}
	else if(elemento instanceof Bonus)
	{
		this.BONUS.push(elemento);
	}
}

Controlador.prototype.importar=function(datos, v_id_entrada)
{
	if(this.INTERVALO) clearInterval(this.INTERVALO);

	if(this.J) delete this.J;

	this.ATACABLES.length=0;		//Cosas que se pueden atacar.
	this.COLISIONABLES.length=0;	//Cosas sólidas con las que se choca.
	this.CON_ACCION.length=0;	//Cosas que tienen "actuar" en ambos ejes.
	this.OBSTACULOS.length=0; 	//Obstáculos sólidos y estáticos propiamente dichos.
	this.DESTRUIBLES.length=0; 	//Cosas que se pueden destruir.
	this.BONUS.length=0;		//Bonus.
	this.ESCALERAS.length=0;	//Escaleras.
	this.SALIDAS.length=0;

	if(!datos.j)
	{
		alert('Sin entrada jugador');
	}
	else
	{
		var l=datos.j.length;
		var id_entrada_deseada=v_id_entrada ? v_id_entrada : 0;
		
		var i=0;
		while(i<l)
		{
			var x=datos.j[i].x;
			var y=datos.j[i].y;
			var id=datos.j[i].id;

			if(id==id_entrada_deseada)
			{
				this.J=new Jugador(x, y);
				break;
			}

			++i;
		}

		if(!this.J) alert('No se ha definido entrada por defecto o que coincida con la deseada');
	}

	if(datos.e)
	{
		var l=datos.e.length;
		var i=0;

		while(i<l)
		{
			var x=datos.e[i].x;
			var y=datos.e[i].y;
			var h=datos.e[i].h;

			var t=new Escalera(x, y, h);
			this.distribuir_elemento(t);
			++i;
		}
	}

	if(datos.s)
	{
		var l=datos.s.length;
		var i=0;

		while(i<l)
		{
			var x=datos.s[i].x;
			var y=datos.s[i].y;
			var t=datos.s[i].t;
			var n=datos.s[i].n;
			var id=datos.s[i].id;

			var s=new Salida(x, y, t, n, id);
			this.distribuir_elemento(s);
			++i;
		}
	}

	if(datos.o)
	{
		var l=datos.o.length;
		var i=0;

		while(i<l)
		{
			var x=datos.o[i].x;
			var y=datos.o[i].y;
			var w=datos.o[i].w;
			var h=datos.o[i].h;

			var t=new Actor(x, y, w, h);
			if(datos.o[i].v) t.visible=false;
			this.distribuir_elemento(t);
			++i;
		}
	}

	if(datos.l)
	{
		var l=datos.l.length;
		var i=0;

		while(i<l)
		{
			var x=datos.l[i].x;
			var y=datos.l[i].y;
			var w=datos.l[i].w;
			var h=datos.l[i].h;

			var t=new Actor(x, y, w, h);
			t.establecer_tipo_colision(Actor.prototype.TIPO_COLISION_LETAL_TACTO);
			if(datos.o[i].v) t.visible=false;
			t.color='#F00';
			this.distribuir_elemento(t);
			++i;
		}
	}

	//Destruibles...
	if(datos.d)
	{
		var l=datos.d.length;
		var i=0;

		while(i<l)
		{
			var x=datos.d[i].x;
			var y=datos.d[i].y;
			var d=new Obstaculo_destruible(x, y);
			this.distribuir_elemento(d);
			++i;
		}
	}

	//Metainformación...

	if(datos.meta)
	{
		{
			var x=datos.meta.limite_camara.x;
			var y=datos.meta.limite_camara.y;
			var w=datos.meta.limite_camara.w;
			var h=datos.meta.limite_camara.h;

			if(w < this.W) w=this.W;
			if(h < this.H) h=this.H;

			var caja_l=new Caja(x, y, w, h);
			this.CAMARA.establecer_caja_limite(caja_l);
		}		

	}

	
	//Y ahora cargamos las cosas de la memoria...

	if(this.MEMORIA[this.nivel_actual])
	{
		//Bonus...

		if(this.MEMORIA[this.nivel_actual].b)
		{
			var i;
			for(i in this.MEMORIA[this.nivel_actual].b)
			{
				var x=this.MEMORIA[this.nivel_actual].b[i].x;
				var y=this.MEMORIA[this.nivel_actual].b[i].y;
				var id=this.MEMORIA[this.nivel_actual].b[i].id_memoria;
				var b=new Bonus(x, y, id);
				this.distribuir_elemento(b);	
				++i;
			}
		}
	}

	//TODO: Ok es muy importante ponerlos que sean colisionables aquí!!!. Así también son cajas normales.
/*
	cosa=new Actor(50, 100, 200, 4);
	cosa.recibir_vector(0.0, 20.0);
	cosa.establecer_tipo_colision(Actor.prototype.TIPO_COLISION_PLATAFORMA_MOVIL);
	this.CON_ACCION.push(cosa);
	this.COLISIONABLES.push(cosa);

	cosa=new Actor(380, 390, 20, 4);
	cosa.recibir_vector(-40.0, 0.0);
	cosa.establecer_tipo_colision(Actor.prototype.TIPO_COLISION_PLATAFORMA_MOVIL);
	this.CON_ACCION.push(cosa);
	this.COLISIONABLES.push(cosa);

	cosa=new Actor(0, 390, 20, 4);
	cosa.recibir_vector(40.0, 0.0);
	cosa.establecer_tipo_colision(Actor.prototype.TIPO_COLISION_PLATAFORMA_MOVIL);
	this.CON_ACCION.push(cosa);
	this.COLISIONABLES.push(cosa);


	cosa=new Actor(20, 240, 20, 4);
	cosa.recibir_vector(0.0, -20.0);
	cosa.establecer_tipo_colision(Actor.prototype.TIPO_COLISION_PLATAFORMA_MOVIL);
	this.CON_ACCION.push(cosa);
	this.COLISIONABLES.push(cosa);
*/
}
