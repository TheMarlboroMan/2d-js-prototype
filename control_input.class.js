function Control_input()
{
	this.capturando=false;

	this.pos_raton_x=0;
	this.pos_raton_y=0;

	this.dif_raton_x=0;
	this.dif_raton_y=0;

	this.TECLAS_DOWN={'izquierda' : 0, 'arriba' : 0, 'derecha' : 0, 'abajo' : 0, 'espacio' : 0, 'lcontrol' : 0};
	this.TECLAS_PULSADAS={'izquierda' : 0, 'arriba' : 0, 'derecha' : 0, 'abajo' : 0, 'espacio' : 0, 'lcontrol' : 0};
	this.COPIA_ACTUAL_DOWN={'izquierda' : 0, 'arriba' : 0, 'derecha' : 0, 'abajo' : 0, 'espacio' : 0, 'lcontrol' : 0};
	this.COPIA_ACTUAL_PULSADAS={'izquierda' : 0, 'arriba' : 0, 'derecha' : 0, 'abajo' : 0, 'espacio' : 0, 'lcontrol' : 0};

	var aquello=this;
	document.onkeydown=function(event) {return aquello.procesar_evento_teclado(event, 1);}
	document.onkeyup=function(event) {return aquello.procesar_evento_teclado(event, 0);}
	document.onkeypress=function(event) {return true;}
}

Control_input.prototype.asignar_control_raton=function(cliente)
{
	var aquello=this;
	cliente.onclick=function(event){aquello.procesar_evento_raton(event, 0, cliente);}
	cliente.onmousemove=function(event){aquello.procesar_evento_raton(event, 1, cliente);}
}

Control_input.prototype.capturar=function()
{
	this.capturando=true;
	for(i in this.TECLAS_DOWN) 
	{
		this.COPIA_ACTUAL_DOWN[i]=this.TECLAS_DOWN[i];
		this.TECLAS_DOWN[i]=0;
	}

	for(i in this.TECLAS_PULSADAS) this.COPIA_ACTUAL_PULSADAS[i]=this.TECLAS_PULSADAS[i];
	this.capturando=false;
}

Control_input.prototype.procesar_evento_teclado=function(event, tipo)
{
	var evento=event ? event : window.event;

	//Keydown...
	switch(tipo)
	{
		case 1:
			if(this.capturando) break;

			switch(evento.keyCode)
			{
				//OJO: Como hay keypress repetidas comprobamos antes si ya estÃƒÂ¡ pulsada para no generar varios keydown.
				//El navegador de por si puede generar muchos keydowns si dejamos pulsado, pero lo intepretaremos como uno.
				case 17: 
					if(this.TECLAS_PULSADAS['lcontrol']) break;  
					this.TECLAS_DOWN['lcontrol']=1;
					this.TECLAS_PULSADAS['lcontrol']=1;  
				break;	
				case 32: 
					if(this.TECLAS_PULSADAS['espacio']) break;
					this.TECLAS_DOWN['espacio']=1;
					this.TECLAS_PULSADAS['espacio']=1;  
				break;	
				case 37: 
					if(this.TECLAS_PULSADAS['izquierda']) break;
					this.TECLAS_DOWN['izquierda']=1;
					this.TECLAS_PULSADAS['izquierda']=1;  
				break;	//Izquierda
				case 38: 
					if(this.TECLAS_PULSADAS['arriba']) break;
					this.TECLAS_DOWN['arriba']=1;
					this.TECLAS_PULSADAS['arriba']=1;   
				break;	//Arriba.
				case 39: 
					if(this.TECLAS_PULSADAS['derecha']) break;
					this.TECLAS_DOWN['derecha']=1;
					this.TECLAS_PULSADAS['derecha']=1;    
				break; //Derecha.
				case 40: 
					if(this.TECLAS_PULSADAS['abajo']) break;
					this.TECLAS_DOWN['abajo']=1; 
					this.TECLAS_PULSADAS['abajo']=1;  
				break;	//Abajo.
			}
		break;

		case 0:
			switch(evento.keyCode)
			{
				case 17: 
					this.TECLAS_PULSADAS['lcontrol']=0; 
					this.TECLAS_DOWN['lcontrol']=0; 
				break;
				case 32: 
					this.TECLAS_PULSADAS['espacio']=0; 
					this.TECLAS_DOWN['espacio']=0; 
				break;
				case 37: 
					this.TECLAS_PULSADAS['izquierda']=0; 
					this.TECLAS_DOWN['izquierda']=0; 
				break;	//Izquierda
				case 38: 
					this.TECLAS_PULSADAS['arriba']=0; 
					this.TECLAS_DOWN['arriba']=0; 
				break;	//Arriba.
				case 39: 
					this.TECLAS_PULSADAS['derecha']=0; 
					this.TECLAS_DOWN['derecha']=0; 
				break; //Derecha.
				case 40: 
					this.TECLAS_PULSADAS['abajo']=0; 
					this.TECLAS_DOWN['abajo']=0; 
				break;	//Abajo.
			}
		break;
	}

	return true;
}

Control_input.prototype.procesar_evento_raton=function(event, tipo, cliente)
{
	var evento=event ? event : window.event;

	switch(tipo)
	{
		//Click.
		case 0:
			var x=event.clientX;
			var y=event.clientY;

			var rect=cliente.getBoundingClientRect();

//			var t=new Actor(x, y);
//			t.establecer_vector(this.dif_raton_x * 10, this.dif_raton_y * 10);
//			this.COLISIONABLES.push(t);
		break;

		//Move.
		case 1:
			var x=event.clientX;
			var y=event.clientY;

			this.dif_raton_x=x-this.pos_raton_x;
			this.dif_raton_y=y-this.pos_raton_y;			

			this.pos_raton_x=x;
			this.pos_raton_y=y;

			document.getElementById('raton').value=x+','+y;
		break;
	}
}

Control_input.prototype.es_tecla_down=function(v_tecla) {return this.COPIA_ACTUAL_DOWN[v_tecla];}
Control_input.prototype.es_tecla_pulsada=function(v_tecla) {return this.COPIA_ACTUAL_PULSADAS[v_tecla];}
