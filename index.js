const express = require('express');

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.json({message: "selamat datang di server"})
})

app.listen(process.env.PORT,()=> {
    console.log(`server berjalan di http://localhost:8000`)
})