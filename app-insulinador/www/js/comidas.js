var selectorMode = false;

function detalleComida(comida) {
	var id_comida = $$(comida).find('.id_comida').val();

	mainView.router.load({
		url: 'comida.html',
		query: {
			id_comida: id_comida
		}
	});
}

myApp.onPageInit('comidas', function() {
	$$('.item-prototype').hide();
	$$('.selectors').hide();
	myApp.hideToolbar('.toolbar');
	var listaComidas = $$('.lista-comidas');
	$$('.yes-checked').hide();
	var itemPrototype = $$('.item-prototype').html();
	$$('.item-prototype').html('');
	// Loading flag
	var loading = false;
	// Last loaded index
	var lastIndex = $$('.lista-comidas li').length;
	// Append items per load
	var itemsPerLoad = 20;

	myApp.showPreloader('Cargando comidas...');

	$$.ajax({
		// ws_url definida en my-app.js
		url: ws_url + '/comidas/' + (lastIndex+1) + '/' + itemsPerLoad,
		type: 'GET',
		timeout: 30000,
		success: function(comidasDb) {
			var fecha_hora;
			var comidas = JSON.parse(comidasDb);
			for (var i = 0; i < comidas.length; i++) {
				fecha_hora = new Date(comidas[i].fecha_hora);

				listaComidas.append(itemPrototype.replace(/__id_comida__/g, comidas[i]._id).replace(/__descripcion__/g, comidas[i].tipo_comida + ' ' + fecha_hora.getHours() + ':' + fecha_hora.getMinutes()));
			}
			myApp.hidePreloader();

			// update counting
			lastIndex = $$('.lista-comidas li').length;
		},
		error: function(err) {
			myApp.hidePreloader();
			myApp.alert('Hubo un problema al recuperar la lista de comidas, por favor verifique su conexión a internet', 'Error');
			//myApp.alert(err.responseText);
			mainView.router.back();
		}
	});

	$$('.lista-comidas').click('.item-comida', function() {		
		if(!selectorMode) {
			detalleComida(this);
		} else {
			toggleChecked($$(this).find('.selectors'));

			hasSelection(function(res) {
				if(!res) {
					toggleMode();
				}
			});
		}
	});

	$$('.lista-comidas').on('taphold', '.item-comida', function() {
		toggleMode();
		toggleChecked($$(this).find('.selectors'));
	});

	$$('.cancelar').click(function() {
		toggleMode();
	});

	$$('.borrar').click(function() {
		myApp.confirm('Por favor, confirme que realmente desea eliminar estas comidas', '¿Está seguro?', function() {
			myApp.showPreloader('Eliminando comidas...');

			var task_count = 0;

			$$('.yes-checked').each(function() {
				if($$(this).css('display') != 'none') {
					task_count++;
					$$.ajax({
						url: ws_url + '/comidas/' + $$(this).attr('value'),
						type: 'DELETE',
						timeout: 30000,
						success: function() {
							task_count--;
							if(task_count == 0) {
								myApp.hidePreloader();
								mainView.router.back();
							}
						},
						error: function() {
							task_count--;
							myApp.hidePreloader();
							myApp.alert('Hubo un problema al eliminar las comidas, por favor verifique su conexión a internet', 'Error');
						}
					});
				}
			});
		});
	});
	 
	// Attach 'infinite' event handler
	$$('.infinite-scroll').on('infinite', function () {
	 
	  // Exit, if loading in progress
	  if (loading) return;
	 
	  // Set loading flag
	  loading = true;
	 
	  // Emulate 1s loading
	  setTimeout(function () {
	    // Reset loading flag
	    loading = false;

	    $$.ajax({
			// ws_url definida en my-app.js
			url: ws_url + '/comidas/' + lastIndex + '/' + itemsPerLoad,
			type: 'GET',
			timeout: 30000,
			success: function(comidasDb) {
				var fecha_hora;
				var comidas = JSON.parse(comidasDb);
				if(comidas.length > 0) {
					for (var i = 0; i < comidas.length; i++) {
						fecha_hora = new Date(comidas[i].fecha_hora);

						listaComidas.append(itemPrototype.replace(/__id_comida__/g, comidas[i]._id).replace(/__descripcion__/g, comidas[i].tipo_comida + ' ' + fecha_hora.getHours() + ':' + fecha_hora.getMinutes()));
					}
					
				    // Update last loaded index
				    lastIndex = $$('.lista-comidas li').length;
				} else {
					// Nothing more to load, detach infinite scroll events to prevent unnecessary loadings
				      myApp.detachInfiniteScroll($$('.infinite-scroll'));
				      // Remove preloader
				      $$('.infinite-scroll-preloader').remove();
				      return;
				}
			},
			error: function() {
				myApp.hidePreloader();
				myApp.alert('Hubo un problema al recuperar la lista de comidas, por favor verifique su conexión a internet', 'Error');
				mainView.router.back();
			}
		});
	  }, 1000);
	});
});

function toggleMode() {
	if(selectorMode) {
		selectorMode = false;
		$$('.selectors').hide();
		myApp.hideToolbar('.toolbar');
		$$('.not-checked').show();
		$$('.yes-checked').hide();
	} else {
		selectorMode = true;
		$$('.selectors').show();
		myApp.showToolbar('.toolbar');
	}
}

function hasSelection(callback) {
	var count = 0;

	$$('.not-checked').each(function(i) {
		if($$(this).css('display') == 'none') {
			// hay un .yes-checked mostrandose
			callback(true);
		} else {
			// hay un .not-checked mostrandose
			count++;
			if(count == $$('.not-checked').length) {
				callback(false);
			}
		}
	});
}

function toggleChecked(checkbox) {
	if(checkbox.find('.not-checked').css('display') != 'none') {
		checkbox.find('.not-checked').hide();
		checkbox.find('.yes-checked').show();
	} else {
		checkbox.find('.not-checked').show();
		checkbox.find('.yes-checked').hide();
	}
}