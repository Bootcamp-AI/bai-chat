const {config} = require ('dotenv');


config()


const PORT = process.env.PORT || 3000;
const PORT1 = process.env.PORT1 || 3001;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_DATABASE = process.env.DB_DATABASE || 'snof';
const DB_PORT = process.env.DB_PORT || 3306;
const TOKEN_MAPA = process.env.TOKEN_MAPA
const TOKEN_PAGO = process.env.TOKEN_PAGO
const OPENAI_API_KEY = process.env.OPENAI_API_KEY


exports.PORT = PORT
exports.DB_USER = DB_USER
exports.DB_PASSWORD = DB_PASSWORD
exports.DB_HOST = DB_HOST
exports.DB_DATABASE = DB_DATABASE
exports.TOKEN_MAPA = TOKEN_MAPA
exports.TOKEN_PAGO = TOKEN_PAGO
exports.OPENAI_API_KEY=OPENAI_API_KEY


