myApp.onPageInit('imprimir', function() {
	myApp.calendar({
		input: '.fecha_desde',
		dateFormat: 'dd-mm-yyyy'
	});

	myApp.calendar({
		input: '.fecha_hasta',
		dateFormat: 'dd-mm-yyyy'
	});

	$$('.datesFilter').hide();

	$$('#imprimir_default').change(function() {
		if(this.checked) {
			$$('.datesFilter').hide();
		} else {
			$$('.datesFilter').show();
		}
	});

	$$('.enviar-informe').click(function() {
		var fecha_desde = $$('.datesFilter .fecha_desde');
		var fecha_hasta = $$('.datesFilter .fecha_hasta');

		if(formIsValid()) {
			if(fecha_desde.val() != '' && fecha_hasta.val() != '') {
				var query = '?fecha_desde=';
				var fecha_desde_splitted = fecha_desde.val().split('-');
				query += fecha_desde_splitted[2] + '-' + fecha_desde_splitted[1] + '-' + fecha_desde_splitted[0] + '&fecha_hasta=';
				var fecha_hasta_splitted = fecha_hasta.val().split('-');
				query += fecha_hasta_splitted[2] + '-' + fecha_hasta_splitted[1] + '-' + fecha_hasta_splitted[0];

				sendMail(query);
			} else {
				sendMail('');
			}
		} else {
			myApp.alert('Disculpe, todos los campos deben estar completados. La fecha hasta no puede ser menor que la fecha desde.', 'Error');
		}
	});
});

function formIsValid() {
	var fecha_desde = $$('.datesFilter .fecha_desde');
	var fecha_desde_date = new Date(fecha_desde.val());
	var fecha_hasta = $$('.datesFilter .fecha_hasta');
	var fecha_hasta_date = new Date(fecha_hasta.val());

	if($$('#imprimir_default').is(':checked')) {
		return true;
	} else {
		if(fecha_desde.val() != '' && fecha_hasta.val() != '' && fecha_hasta_date >= fecha_desde_date) {
			return true;
		}
	}

	return false;
}

function sendMail(query_string) {
	myApp.confirm('Está a punto de enviar el informe de comidas', '¿Está seguro?', function() {
		myApp.showPreloader('Enviando correo...');

		$$.ajax({
			url: ws_url + '/send-mail' + query_string,
			type: 'GET',
			timeout: 30000,
			success: function() {
				myApp.hidePreloader();

				mainView.router.back();

				myApp.addNotification({
					title: 'Listo!',
					message: 'El informe de comidas fue enviado al correo',
					hold: 3000
				});

				//window.open("http://ec2-13-58-159-226.us-east-2.compute.amazonaws.com:3003/reporte.pdf", "_system");
			},
			error: function() {
				myApp.hidePreloader();
				myApp.alert('Hubo un problema al enviar el correo, por favor verifique su conexión a internet o intente nuevamente', 'Error');
			}
		});
	});
}