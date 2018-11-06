var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Transaction = require('mongoose-transaction')(mongoose);

function guardarAlimentos(id_comida, ids_alimentos, alimentos, i) {
	var Alimentos = mongoose.model('alimentos');
	var alimento;

	if(i < alimentos.length) {
		alimento = new Alimentos({
			_id: ids_alimentos[i],
			nombre: alimentos[i].nombre,
			carbohidratos: alimentos[i].carbohidratos,
			comida: id_comida
		});

		alimento.save(function(err) {
			if(err) {
				return 500;
			} else {
				guardarAlimentos(id_comida, ids_alimentos, alimentos, i+1);
			}
		});
	}

	return 200;
}

function getComidas(filtro, callback) {
	mongoose.model('comidas').find(filtro, callback);
}

router.post('/', function(req, res) {
	var alimento;
	var Comidas = mongoose.model('comidas');
	var Alimentos = mongoose.model('alimentos');
	var alimentos = req.body.alimentos;
	
	var comida = new Comidas({
		fecha_hora: req.body.fecha_hora,
		tipo_comida: req.body.tipo_comida,
		glucemia: req.body.glucemia,
		insulina: req.body.insulina
	});

	for (var i = 0; i < alimentos.length; i++) {
		alimento = new Alimentos({
			nombre: alimentos[i].nombre,
			carbohidratos: alimentos[i].carbohidratos
		});

		comida.alimentos.push(alimento);
	}

	comida.save(function(err) {
		if(err) {
			console.log(err);
			res.sendStatus(500);
		} else {
			res.sendStatus(guardarAlimentos(comida._id, comida.alimentos, alimentos, 0));
		}
	});
});

router.get('/:page/:limit', function(req, res) {
	mongoose.model('comidas').find({}, null, 
		{skip: parseInt(req.params.page-1), limit: parseInt(req.params.limit), sort: {fecha_hora: -1}},
		function(err, comidas) {
			if(err) {
				console.log(err);
				res.sendStatus(500);
			} else {
				res.json(comidas);
			}
		}
	);
});

router.get('/:id', function(req, res) {
	mongoose.model('comidas').findOne({_id: req.params.id}).populate('alimentos').exec(function(err, comida) {
		if(err) {
			res.sendStatus(500);
		} else {
			res.json(comida);
		}
	});
});

router.delete('/:id', function(req, res) {
	var transaction = new Transaction();

	mongoose.model('alimentos').find({comida: req.params.id}, function(err, alimentos) {
		if(err) {
			console.log(err);
			res.sendStatus(500);
		} else {
			for (var i = 0; i < alimentos.length; i++) {
				transaction.remove('alimentos', alimentos[i]._id);
			}
			transaction.remove('comidas', req.params.id);
			transaction.run(function(err) {
				if(err) {
					console.log(err);
					res.sendStatus(500);
				} else {
					console.log('exito');
					res.sendStatus(200);
				}
			});
		}
	});
});

router.get('/bulk_delete/:id', function(req, res) {
	var transaction = new Transaction();
	var ids = req.params.id.split(',');

	for (var i = 0; i < ids.length; i++) {
		mongoose.model('alimentos').find({comida: ids[i]}, function(err, alimentos) {
			if(err) {
				res.sendStatus(500);
			} else {
				for (var i = 0; i < alimentos.length; i++) {
					transaction.remove('alimentos', alimentos[i]._id);
				}
				transaction.remove('comidas', ids[i]);
			}
		});
	}

	transaction.run(function(err) {
		if(err) {
			res.sendStatus(500);
		} else {
			res.sendStatus(200);
		}
	});
});

module.exports = router;