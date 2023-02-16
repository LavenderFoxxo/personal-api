const express = require('express')
const app = express()
const port = 8000

const spotifyRoute = require('./routes/spotify')

app.use(express.urlencoded({extended: true}));
app.use(express.json())

app.use('/spotify', spotifyRoute)
app.get('/', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Welcome to Alexander\'s API! Specify a endpoint.'})
})

app.listen(port, () => {
    console.log('Listening to port ' + port + '!')
})