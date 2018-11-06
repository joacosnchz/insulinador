myApp.onPageInit('nueva-comida', function() {
	var insulina_glucemia = 0;
	var insulina_carbohidratos = 0;

	myApp.calendar({
		input: '.fecha_comida',
		dateFormat: 'dd-mm-yyyy',
		closeByOutsideClick: true,
		closeOnSelect: true
	});

	myApp.picker({
		input: '.hora_comida',
		rotateEffect: true,
		toolbarCloseText: 'Listo',
		formatValue: function (p, values, displayValues) {
			return values[0] + ':' + values[1];
		},
		cols: [
			{
				values: ('00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23').split(' ')
			},
			{
				divider: true,
				content: ':'
			},
			{
				values: ('00 05 10 15 20 25 30 35 40 45 50 55').split(' ')
			}
		]
	});

	var fecha_hora = new Date();

	$$('.hora_comida').val(fecha_hora.getHours() + ':' + fecha_hora.getMinutes());

	$$('.fecha_comida').val(fecha_hora.getDate() + '-' + (fecha_hora.getMonth()+1) + '-' + fecha_hora.getFullYear());

	$$('.insulina').val(0);

	$$('.alimentos_hidden').hide();	

	$$('.glucemia').on('keyup change', function() {
		if($$(this).val() > 150 && $$(this).val() <= 200) {
			insulina_glucemia = 1;
		}
		else if($$(this).val() > 200 && $$(this).val() <= 251) {
			insulina_glucemia = 2;
		}
		else if($$(this).val() > 250 && $$(this).val() <= 300) {
			insulina_glucemia = 3;
		}
		else if($$(this).val() > 300 && $$(this).val() <= 350) {
			insulina_glucemia = 4;
		} 
		else if($$(this).val() > 350) {
			insulina_glucemia = 5;
		}

		$$('.insulina').val(insulina_glucemia + insulina_carbohidratos);
	});

	$$('.tipo_comida').change(function() {
		if($$(this).val() == 'Colación') {
			$$('.glucemia').val(0);
			$$('.carbohidratos_totales').val(0);
		}
	});

	$$('form').submit(function(e) {
		e.preventDefault();

		var fecha = $$('.fecha_comida').val().split('-');

		if(!$$('.glucemia').val()) {
			myApp.alert("Por favor, ingrese la cantidad de glucemia en sangre.", 'Error');
			return;
		}

		var alimentos = new Array();
		var alimento;
		$$('.alimentos_hidden').find('.lista-alimentos').each(function(i) {
			alimento = {
				nombre: upperCaseFirst($$(this).find('.input_alimentos').val()),
				carbohidratos: $$(this).find('.carbohidratos').val()
			}
			
			alimentos.push(alimento);
		});

		if(alimentos.length == 0) {
			myApp.alert("Por favor, seleccione los alimentos a ingerir", 'Error');
			return;
		}

		var data = {
			fecha_hora: fecha[2] + '-' + fecha[1] + '-' + fecha[0] + ' ' + $$('.hora_comida').val(),
			tipo_comida: $$('.tipo_comida').val(),
			glucemia: $$('.glucemia').val(),
			insulina: $$('.insulina').val(),
			alimentos: alimentos
		};

		myApp.showPreloader('Guardando...');
		if(hasConnection()) {
			$$.ajax({
				// ws_url definida en my-app.js
				url: ws_url + '/comidas',
				type: 'POST',
				data: data,
				timeout: 30000,
				success: function(result) {
					myApp.hidePreloader();
					if(result == 'OK') {
						mainView.router.back();
						myApp.addNotification({
							title: 'Comida guardada!',
							message: 'La comida ha sido registrada con éxito',
							hold: 3000
						});
					} else {
						
						myApp.alert('Hubo un problema al guardar la comida, por favor verifique su conexión a internet', 'Error');
					}
				},
				error: function() {
					myApp.hidePreloader();
					myApp.alert('Hubo un problema al guardar la comida, por favor verifique su conexión a internet', 'Error');
				}
			});
		} else {
			writeToFile('comida.txt', data, function() {
				myApp.hidePreloader();
				mainView.router.back();
				myApp.addNotification({
					title: 'Comida guardada!',
					message: 'La comida ha sido registrada con éxito',
					hold: 3000
				});
			}, function(err) {
				myApp.hidePreloader();
				if(err == 1) {
					myApp.alert("Hubo un problema, por favor intente nuevamente", 'Error');
				} else {
					myApp.alert("No hay espacio suficiente en la memoria", 'Error');
				}
			});
		}
	});

	$$('.insulina_carbohidratos').change(function() {
		insulina_carbohidratos = parseInt($$(this).val());

		$$('.insulina').val(insulina_glucemia + insulina_carbohidratos);
	});
});

function writeToFile(fileName, data, onSuccess, onError) {
    data = JSON.stringify(data, null, '\t');

    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (directoryEntry) {
        directoryEntry.getFile(fileName, { create: true }, function (fileEntry) {
            fileEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function (e) {
                    // for real-world usage, you might consider passing a success callback
                    console.log('Write of file "' + fileName + '"" completed.');
                    onSuccess();
                };

                fileWriter.onerror = function (e) {
                    // you could hook this up with our global error handler, or pass in an error callback
                    onError(1);
                };

                try {
                	fileWriter.seek(fileWriter.length);
                	if(fileWriter.length > 0) {
                		fileWriter.write(",\n");
                	}
                } catch(e) {
                	console.log("file not exists");
                }

                var blob = new Blob([data], { type: 'text/plain' });

                getFreeSpace(
					function(freeSpace) {
						var freeSpaceInBytes = freeSpace*1024;

						if(freeSpaceInBytes > blob.size) {
							fileWriter.write(blob);
						} else {
							onError(2);
						}
					},
					function() {
						onError(1);
					}
				);
            }, function() {
            	onError(1);
            });
        }, function() {
        	onError(1);
        });
    }, function() {
    	onError(1);
    });
}
