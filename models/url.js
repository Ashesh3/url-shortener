const db = require('mongoose')
const { nanoid } = require('nanoid');

const urlDetailSchema = new db.Schema({
	fullUrl: {
		type: String,
		required: true
	},
	shortUrl: {
		type: String,
		required: true,
		default: nanoid(6),
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
