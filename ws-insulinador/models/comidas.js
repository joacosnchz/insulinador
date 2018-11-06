var mongoose = require('mongoose');

var comidasSchema = mongoose.Schema({
	fecha_hora: Date,
	tipo_comida: String,
	glucemia: Number,
	insulina: Number,
	impresa: {
		type: Boolean,
		default: false
	},
	alimentos: [
		{
			type: mongoose.Schema.ObjectId,
			ref: 'alimentos'
		}
	]
});

mongoose.model('comidas', comidasSchema);