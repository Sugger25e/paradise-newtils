const mg = require('mongoose')

const tc = new mg.Schema({
	guild: String,
	user: String,
	types: Array,
	realm_channel: String,
	partner_channel: String,
	donate_channel: String
})

module.exports = mg.model('tc-user', tc)