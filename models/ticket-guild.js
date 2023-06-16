const mg = require('mongoose')

const tc = new mg.Schema({
	guild: String,
	channel: String,
	category: String
})

module.exports = mg.model('tc-guild', tc)