const db = require('mongoose')

const urlDetailSchema = new db.Schema({
	fullUrl: {
		type: String,
		required: true
	},
	shortUrl: {
		type: String,
		required: true,
	},
	hits: {
		type: Number,
		required: true,
		default: 0
	},
	owner: {
		type: String,
		required: true
	}
})

module.exports = db.model('UrlDetail', urlDetailSchema)
