const express = require('express')
const session = require('express-session');
const app = express()
const db = require('mongoose')
const UrlDetail = require('./models/url')
const config = JSON.parse(require('fs').readFileSync('./config.json'))
const { nanoid } = require('nanoid');
const bodyParser = require('body-parser');

app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'ejs')

const captcha = require('svg-captcha-express').create({
	cookie: 'captcha',
	size: 5,
	noise: 3,
	width: 200,
	height: 50,
	background: '#fafafa',
	charPreset: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
});

app.use(
	session({
		secret: config.SECRET,
		resave: false,
		saveUninitialized: true
	})
);

app.use(bodyParser.urlencoded({ extended: false }));


db.connect(`mongodb+srv://${config.MONGODB_USER}:${config.MONGODB_PASSWORD}@${config.MONGODB_HOST}/${config.MONGODB_DB}?retryWrites=true&w=majority`, {
	useNewUrlParser: true,
	useUnifiedTopology: true
})

app.get('/captcha.jpg', captcha.image());

app.get('/', async (req, res) => {
	const allUrls = await UrlDetail.find({ owner: req.headers['x-forwarded-for'] || req.socket.remoteAddress })
	res.render('index', { captcha: '/captcha.jpg', urlsData: allUrls, domain: config.DOMAIN })
})

app.post('/short_url', async (req, res) => {
	if (!captcha.check(req, req.body.captcha))
		return res.send('Invalid captcha')
	const originalUrl = req.body.originalUrl
	const record = new UrlDetail({
		fullUrl: originalUrl,
		owner: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
		shortUrl: nanoid(6)
	})
	await record.save()
	res.redirect('/')
})

app.get('/:shortID', async (req, res) => {
	const shortID = req.params.shortID
	const urlDetails = await UrlDetail.findOne({ shortUrl: shortID })
	if (!urlDetails) return res.status(404).send('No short url found')
	urlDetails.hits += 1
	await urlDetails.save()
	res.redirect(urlDetails.fullUrl)
})

db.connection.on('open', async () => {
	app.listen(config.PORT, () => {
		console.log('Listening on PORT: ' + config.PORT)
	})
})