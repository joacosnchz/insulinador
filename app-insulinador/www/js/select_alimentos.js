myApp.onPageInit('select_alimentos', function() {
	var prototype = $$('.formPrototype').html();
	var normalPrototype = prototype.replace(/__valAlim__/g, '').replace(/__valCarbo__/g, '');
	$$('.formPrototype').html('');

	if($$('.alimentos_hidden').find('.lista-alimentos').length > 0) {
		$$('.alimentos_hidden').find('.lista-alimentos').each(function() {
			$$('.alimentos').prepend('<div class="list-block"><ul>' + $$(this).html() + '</ul></div>');
		});
	} else {
		$$('.alimentos').prepend(normalPrototype.replace(/__index__/g, 0));
	}

	$$('.add_alimento').click(function() {
		var index = $$('.lista-alimentos').length;

		$$('.alimentos').prepend(normalPrototype.replace(/__index__/g, index));

		$$('#input_alimento' + index).focus();
	});

	$$('.submit_alimentos').click(function() {
		var mensaje = '';
		var alimento;
		var suma = 0;
		$$('.alimentos_hidden').html('');

		$$('.input_alimentos').each(function() {
			if($$(this).val().trim() == '') {
				mensaje += 'Por favor, complete todos los campos Alimento<br>';
			}
		});

		$$('.carbohidratos').each(function() {
			if($$('.tipo_comida').val() != 'Colación') {
				if($$(this).val().trim() == '') {
					mensaje += 'Por favor, complete todos los campos Carbohidratos<br>';
				}
			} else {
				$$(this).val(0);
			}
			if(!/^[0-9]*$/.test($$(this).val().trim())) {
				mensaje += 'El campo carbohidratos solo puede contener números<br>';
			}

			alimento = $$(this).parent().parent().parent().parent().parent().parent().find('.input_alimentos').val();

			$$('.alimentos_hidden').prepend(prototype.replace(/__valAlim__/g, alimento).replace(/__valCarbo__/g, $$(this).val()));

			suma += parseInt($$(this).val());
		});

		if(mensaje != '') {
			myApp.alert(mensaje, 'Error');
		} else {
			mainView.router.back();
			$$('.carbohidratos_totales').val(suma);
			$$('.insulina_carbohidratos').val(Math.round(suma/10));
			$$('.insulina_carbohidratos').trigger('change');
		}
	});
});

function delete_item(elem) {
	$$(elem).parent().parent().parent().parent().parent().remove();
}