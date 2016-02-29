var User = require('../models/user.js');
var config = require('../../config.js');
var jsonWebToken = require('jsonwebtoken');
var Story = require('../models/story.js');


var secretKey = config.secretKey;


function createWebToken(user) {

	var token = jsonWebToken.sign({
		id: user._id,
		name: user.name,
		username: user.username
	}, secretKey, {
		expiresInMinute: 1440
	});

	return token;

}

module.exports = function(app, express,io) {

	var api = express.Router();

	api.get('/allStories',function (req,res) {
		Story.find({},function (err,stories) {
			if(err)
			{
				res.send(err);
				return;
			}
			res.json(stories);
		});
	});

	api.post('/signup', function(req, res) {

		var user = new User({
			name: req.body.name,
			username: req.body.username,
			password: req.body.password
		});
		var token = createWebToken(user);
		user.save(function(err) {
			if (err) {
				res.send(err);
				return;
			}
			res.json({
				success:true,
				message: 'User has been created',
				token:token
			});
		});

	});

	api.get('/users', function(req, res) {

		User.find({}, function(err, users) {
			if (err) {
				res.send(err);
				return;
			}
			res.json(users);
		});

	});

	api.post('/login', function(req, res) {
		User.findOne({
				username: req.body.username
			})
			.select('name username password').exec(function(err, user) {
				if (err) {
					res.send(err);
					return;
				}

				if (!user) {
					res.send({
						message: 'User doesnot exist'
					});
					return;
				} else if (user) {
					var validPassword = user.comparePassword(req.body.password);
					if (!validPassword) {
						res.send({
							message: 'Invalid Password'
						});
					} else {
						//Generate token here
						var token = createWebToken(user);
						res.json({
							success: true,
							message: 'Successfully logged in',
							token: token
						});

					}
				}

			})
	});

	api.use(function(req, res, next) {

		console.log('Somebody just logged in');
		var token = req.body.token || req.param('token') || req.headers['x-access-token'];

		if (token) {
			jsonWebToken.verify(token, secretKey, function(err, decoded) {

				if (err) {
					res.status(403).send({
						success: false,
						message: 'Failed to authenticate user'
					});
				} 
				else {
					req.decoded = decoded;
					next();
				}
			});
		} else {
			res.status(403).send({
				success: false,
				message: 'No token provided'
			});
		}

	});

	api.route('/')
		.post(function(req, res) {
			var story = new Story({
				creator: req.decoded.id,
				content: req.body.content,

			});

			story.save(function(err,newStory) {
				if (err) {
					res.send(err);
					return;
				}
				io.emit('story',newStory);
				res.json({
					message: 'new story created'
				});
			})
		})
		.get(function(req, res) {
			Story.find({
				creator: req.decoded.id
			}, function(err, stories) {
				if (err) {
					res.send(err);
					return;
				}
				res.json(stories);
			})
		});

	api.get('/me', function(req, res) {
		res.json(req.decoded);
	});


	return api;
}