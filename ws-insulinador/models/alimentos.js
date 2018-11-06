var mongoose = require('mongoose');

var alimentosSchema = mongoose.Schema({
	nombre: String,
	carbohidratos: Number,
	comida: {
		type: mongoose.Schema.ObjectId,
		ref: 'comidas'
	}
});

mongoose.model('alimentos', alimentosSchema);