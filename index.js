const express = require('express')
const mysql = require('mysql')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors())

const con = mysql.createConnection({
  user: 'sql12608217',
  host: 'sql12.freesqldatabase.com',
  password: process.env.PWD_DB,
  database: 'sql12608217'
})
app.get('/users', (req, res)=>{
    con.query('SELECT * FROM users', (err, result) => {
        if (result) {
          res.send(result)
        } else {
          res
            .status(err.status || 500)
            .json({ status: err.status, message: err.message })
        }
      })
})

app.post('/register', (req, res) => {
    
  const username = req.body.username
  const email = req.body.email
  const password = req.body.password
  const lastLoginTime = req.body.lastLoginTime
  const registerTime = req.body.registerTime
  const status = req.body.status

  con.query(
    'INSERT INTO users (username, email, password, lastLoginTime, registerTime, status) VALUES (?, ?, ?, ?, ?, ?)',
    [username, email, password, lastLoginTime, registerTime, status],
    (err, result) => {
      if (result) {
        res.send(result)
      } else {
        res
          .status(err.status || 500)
          .json({ status: err.status, message: err.message })
      }
    }
  )
})

app.post('/login', (req, res) => {
  const username = req.body.username
  const password = req.body.password

  con.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, result) => {
      if (err) {
        req.setEncoding({ err: err })
      } else {
        if (result.length > 0) {
          res.send(result)
        } else {
          res
            .status(err.status || 500)
            .json({ status: err.status, message: err.message })
        }
      }
    }
  )
})

app.listen(3001, () => {
  console.log('server running')
})
