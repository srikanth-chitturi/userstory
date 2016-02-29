module.exports = {
	'database':'mongodb://root:abc123@ds061974.mongolab.com:61974/userstorydb',
	//'database':'mongodb://localhost:27017/userstorydb',
	'port':process.env.PORT || 3000,
	'secretKey':'mylittlesecret'
}