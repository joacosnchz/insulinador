var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var pdf = require('html-pdf');
var fs = require('fs');

router.get("/", function(req, res) {
	res.sendStatus(200);
});

function upperCaseFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

router.get('/send-mail', function(req, res) {
	var filtro = {
		impresa: false
	};
	
	if(req.query.fecha_desde != null && req.query.fecha_hasta != null) {
		var filtro_fecha_desde = new Date(req.query.fecha_desde);
		var filtro_fecha_hasta = new Date(req.query.fecha_hasta);
		filtro_fecha_hasta.setDate(filtro_fecha_hasta.getDate() + 1);

		filtro = {
			fecha_hora: {
				"$gte": filtro_fecha_desde,
				"$lt": filtro_fecha_hasta
			}
		};
	}

	var textoViejo;
	var texto = '<html><head><title>Reporte</title><style>body {font-size:9px;} .tabla-reporte-nuevo td { border-bottom:1px solid #000;border-left:1px solid #000 }</style></head><body>';
	//var textoViejo = '<html><head><title>Reporte viejo</title><style>body {font-size:8px;}</style></head><body>';
	var fecha_hora;
	var carbohidratos_totales = 0;
	var transporter = nodemailer.createTransport('smtps://user:pass@smtp.gmail.com');

	mongoose.model('comidas').find(filtro).sort('fecha_hora').populate('alimentos').exec(function(err, comidas) {
		if(err) {
			console.log(err);
			res.sendStatus(500);
		} else {
			if(comidas.length == 0) {
				texto += '<h1>Todas las comidas ya han sido impresas</h1>';
				textoViejo += '<h1>Todas las comidas ya han sido impresas</h1>';
			} else {
				var fecha_anterior = null;

				texto += '<div><div style="float:left">Apellido y nombre: <span style="text-decoration:underline">Ana Paula Sanchez</span><br>DNI: <span style="text-decoration:underline">44.210.596</span></div>';
				texto += '<div style="float:right">Instituto de Obra Social<br>de la Provincia de Entre Ríos</div><br style="clear:both"></div><br>';
				texto += '<table class="tabla-reporte-nuevo" style="font-size:9px;width:100%;" cellspacing="0" cellpadding=5><thead style="background-color:gray"><tr><th>Fecha</th><th>Ayunas</th><th>Antes del almuerzo</th><th>Despues del almuerzo</th><th>Antes de la cena</th><th>Despues de la cena</th><th>Otros</th></tr></thead><tbody>';

				for (var i = 0; i < comidas.length; i++) {
					carbohidratos_totales = 0;
					fecha_hora = new Date(comidas[i].fecha_hora);

					if(fecha_anterior == null || (new Date(fecha_hora.getFullYear() + '-' + (fecha_hora.getMonth()+1) + '-' + fecha_hora.getDate())).getTime() !== (new Date(fecha_anterior.getFullYear() + '-' + (fecha_anterior.getMonth()+1) + '-' + fecha_anterior.getDate())).getTime()) {
						//texto += '</tr><tr><td>' + fecha_hora.getDate() + '-' + (fecha_hora.getMonth()+1) + '-' + fecha_hora.getFullYear() + '</td>';
						texto = texto.replace(/__fecha__/g, '');
						texto = texto.replace(/__desayuno__/g, '');
						texto = texto.replace(/__almuerzo__/g, '');
						texto = texto.replace(/__merienda__/g, '');
						texto = texto.replace(/__cena__/g, '');
						texto = texto.replace(/__add1__/g, '');
						texto = texto.replace(/__add2__/g, '');
						texto += '<tr><td align="center">__fecha__</td><td align="center">__desayuno__</td><td align="center">__almuerzo__</td><td align="center">__merienda__</td><td align="center">__cena__</td><td align="center">__add1__</td><td align="center" style="border-right:1px solid #000">__add2__</td></tr>';
					}
					texto = texto.replace(/__fecha__/g, (fecha_hora.getDate() + '-' + (fecha_hora.getMonth()+1) + '-' + fecha_hora.getFullYear()));

					fecha_anterior = new Date(fecha_hora);

					textoViejo += '<h2 align="center">' + comidas[i].tipo_comida + ' del ' + fecha_hora.getDate() + '-' + (fecha_hora.getMonth()+1) + '-' + fecha_hora.getFullYear() + ' a las ' + fecha_hora.getHours() + ':' + fecha_hora.getMinutes() + '</h2>' + 
						'Glucemia: ' + comidas[i].glucemia + 'mg/dl<br>' + 
						'Insulina aplicada: ' + comidas[i].insulina + 'u<table style="font-size:7px" cellspacing="2" border="0">';

					textoViejo += '<thead><tr><th>Alimento</th><th>Carbohidratos</th></tr></thead><tbody>';

					for(var j = 0; j < comidas[i].alimentos.length; j++) {
						textoViejo += '<tr><td align="center">' + upperCaseFirst(comidas[i].alimentos[j].nombre) + '</td><td align="center">' + comidas[i].alimentos[j].carbohidratos + 'g</td></tr>';
						//textoViejo += '<td>' + comidas[i].alimentos[j].carbohidratos + '</td>';

						carbohidratos_totales += parseInt(comidas[i].alimentos[j].carbohidratos);
					}
					if(comidas[i].tipo_comida == "Desayuno") {
						texto = texto.replace(/__desayuno__/g, comidas[i].glucemia);
					} else if(comidas[i].tipo_comida == "Almuerzo") {
						texto = texto.replace(/__almuerzo__/g, comidas[i].glucemia);
					} else if(comidas[i].tipo_comida == "Merienda") {
						texto = texto.replace(/__merienda__/g, comidas[i].glucemia);
					} else if(comidas[i].tipo_comida == "Cena") {
						texto = texto.replace(/__cena__/g, comidas[i].glucemia);
					} else if(comidas[i].tipo_comida == "Colacion") {
						texto = texto.replace(/__add2__/g, comidas[i].glucemia);
					} else {
						texto = texto.replace(/__add1__/g, comidas[i].glucemia);
					}
					//texto += '<td align="center">' + comidas[i].glucemia + '</td>';
					textoViejo += '<tr><td align="center">Totales</td><td align="center">' + carbohidratos_totales + 'g</td></tr>'
					
					textoViejo += '</tbody></table><hr>';
				}

				texto = texto.replace(/__fecha__/g, '');
				texto = texto.replace(/__desayuno__/g, '');
				texto = texto.replace(/__almuerzo__/g, '');
				texto = texto.replace(/__merienda__/g, '');
				texto = texto.replace(/__cena__/g, '');
				texto = texto.replace(/__add1__/g, '');
				texto = texto.replace(/__add2__/g, '');

				texto += '</table>';
			}
			texto += '</body></html>';
			//texto += '<div style="page-break-before: always;"></div>';
			//textoViejo += '</body></html>';
 
			pdf.create(texto, {format:'A4', orientation:'portrait'}).toFile('./reporte.pdf', function(err, file) {
				if (err) {
					console.log(err);
					res.sendStatus(500);
				} else {
					var mailOptions = {
					    from: '"Insulinador" <user>', // sender address 
					    to: 'receiver', // list of receivers 
					    subject: 'Lista de comidas', // Subject line 
					    text: 'Adjunto reporte de comidas', // plaintext body 
					    attachments: [
					    	{
					    		filename: 'reporte.pdf',
					    		path: file.filename,
					    		//contentType: 'application/pdf'
					    	}
					    ],
					    html: 'Adjunto reporte de comidas' // html body 
					};

					transporter.sendMail(mailOptions, function(error, info) {
					    if(error) {
					        console.log(error);
					        res.sendStatus(500);
					    } else {
					    	for (var i = 0; i < comidas.length; i++) {
					    		comidas[i].impresa = true;
					    		comidas[i].save(function(err) {
					    			if(err) {
					    				console.log(err);
					    			}
					    		});
					    	}
					    	console.log('Message sent: ' + info.response);
					    	res.sendStatus(200);
					    }
					}); 
				}
			});
		}
	});
});

module.exports = router;
