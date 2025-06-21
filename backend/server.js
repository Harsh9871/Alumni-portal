const app = require('./app.js')
const dotenv = require('dotenv')
dotenv.config()
const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})