function Request_http(var_modo, var_post)
{	
	this.modo='GET';	
	this.request=null;
	this.datos_post=null;

	if(var_modo)
	{
		this.modo=var_modo;
	}

	if(var_post)
	{
		//var_post='cabeza=contodoelrollo&tal=cual'; Esta es la forma que tiene que tener un post
		this.datos_post=var_post;
	}
	
	this.request=this.crear_request(); //Finalmente esto es lo primerísimo que ocurre cuando creamos un objeto: dentro del objeto se crea una instancia de XMLHTTPRequest en función del navegador que sea.		
}

//Esto, obviamente, no es mio... Nos ayuda a separar si es un objeto para IE o para el resto del mundo.
Request_http.prototype.crear_request=function() 
{ 	
	if (typeof XMLHttpRequest != 'undefined') 
	{
		return new XMLHttpRequest(); 		//Para el resto del mundo.
	}
	else
	{
		try //Para explorer...
		{ 
			return new ActiveXObject("Msxml2.XMLHTTP");
		} 	
		catch (e) 
		{ 
			try //Para Dios sabe que otra versión de Explorer.
			{
				return new ActiveXObject("Microsoft.XMLHTTP");
			}	
			catch (e) 
			{
				alert('El navegador no parece soportar el RequestHTTP');
			} 
		} 
	}
	return false; 	//Para Mosaic :P.
}

//Cuando cambia el estado (según el método cargar()) lanzaremos esto, que recibe el request completo...
Request_http.prototype.respuesta = function(metodo)
{						
	if(this.request.readyState == 4) 
	{
		//Cuando el estado sea 4 llamaremos a la función que pásamos...
		metodo(this.request.responseText);	
	}
}
	
Request_http.prototype.cargar=function(url, metodo)
{	
	var aquello=this;		

	 //Y ahora creamos esto otro para poder usarlo de respuesta.			
	var funcion = function() 
	{
		aquello.respuesta(metodo);
	};

	switch(this.modo)
	{
		case 'GET':
			this.request.open('GET', url, true);	//Prepara...						
			this.request.onreadystatechange = funcion; //La respuesta cuando haya cambio			
			this.request.send(null);	//Lanza.						
		break;
		
		case 'POST':
			this.request.open('POST', url, true);	//Prepara...						

			this.request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			this.request.setRequestHeader("Content-length", this.datos_post.length);
			this.request.setRequestHeader("Connection", "close");

			this.request.onreadystatechange = funcion; //La respuesta cuando haya cambio			
			this.request.send(this.datos_post);	//Lanza.						
		break;
	}
}
