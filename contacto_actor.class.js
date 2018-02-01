function Contacto_actor()
{
	this.actor_contacto=null;
	this.direccion=-1;
	this.valida=false;
	this.cantidad=0;
	this.tipo=0;
}

Contacto_actor.prototype.almacenar=function(v_actor, v_direccion, v_cantidad, v_tipo)
{
	this.actor_contacto=v_actor;
	this.direccion=v_direccion;
	this.valida=true;
	this.cantidad=v_cantidad;
	this.tipo=v_tipo;
}

Contacto_actor.prototype.es_valida=function() {return this.valida;}
