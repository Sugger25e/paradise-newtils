const mg = require('mongoose')

const tc = new mg.Schema({
	gamertag: String,
	warns: Array
})

module.exports = mg.model('realm-warn', tc)
