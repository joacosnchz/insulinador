myApp.onPageInit('comida', function(page) {
	var fecha_hora;
	var carbohidratos_totales = 0;
	var id_comida = page.query.id_comida;
	var alimentoPrototype = $$('.alimentoPrototype').html();
	$$('.alimentoPrototype').hide();

	myApp.showPreloader('Cargando comida...');
	$$.ajax({
		// ws_url definido en my-app.js
		url: ws_url + '/comidas/' + id_comida,
		method: 'GET',
		timeout: 30000,
		success: function(comida) {
			comida = JSON.parse(comida);
			fecha_hora = new Date(comida.fecha_hora);
			$$('.fecha_comida').html(fecha_hora.getDate() + '-' + (fecha_hora.getMonth()+1) + '-' + fecha_hora.getFullYear());
			$$('.hora_comida').html(fecha_hora.getHours() + ':' + fecha_hora.getMinutes());
			$$('.tipo_comida').html(comida.tipo_comida);
			$$('.glucemia').html(comida.glucemia);
			$$('.insulina').html(comida.insulina);
			for (var i = 0; i < comida.alimentos.length; i++) {
				carbohidratos_totales += comida.alimentos[i].carbohidratos;
				$$('.alimentosList').append(alimentoPrototype.replace(/__alimento__/g, upperCaseFirst(comida.alimentos[i].nombre)).replace(/__carbohidratos__/g, comida.alimentos[i].carbohidratos));
			}
			$$('.carbohidratos_totales').html(carbohidratos_totales);
			myApp.hidePreloader();
		},
		error: function() {
			myApp.hidePreloader();
			myApp.alert('Hubo un problema al buscar los datos de la comida, por favor verifique su conexión a internet', 'Error');
		}
	})
});