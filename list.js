const makeWaSocket = require('@adiwajshing/baileys').default;
const {Mimetype, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, delay} = require('@adiwajshing/baileys');
const P = require('pino');
const {unlink} = require('fs');
const express = require('express');
const http = require('http');
//const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const fs = require('fs');
const {pool} = require ('./db.js');
const {PORT, OPENAI_API_KEY} = require('./config.js')
const axios = require("axios").default
const { Configuration, OpenAIApi } = require("openai");



const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const getChatgpt = async(pregunta)=>{
	const completion = await openai.createCompletion({
	  model: "text-davinci-003",
	  temperature: 1,
	  prompt: pregunta,
	  max_tokens: 400
	});

	const text = completion.data.choices[0].text;
	const respuesta = text.substr(2);
	return respuesta;
	console.log("respuesta: "+respuesta)
}


function delay1(t,v){
	return new Promise(function(resolve){
		setTimeout(resolve.bind(null,v), t);
	})
}


app.get('/suma', async (req, res)=>{
	const [result] = await pool.query('SELECT 1+1 AS result')
	res.json(result);
})

const getUserData = async(from)=>{
	const [rows] = await pool.query('SELECT * FROM usuario WHERE celular = ?', [from]);
	return rows;
}

const setUser = async(fecha, from, status)=>{
	try{
	const [rows] = await pool.query('INSERT INTO usuario(`fecha`, `celular`, `estado`  ) VALUES(?,?,?)', [fecha, from, status]);
        return(rows);
	}catch(err){console.log(err)}
}


const setUserMsg = async(fecha, from, msg_body, estado)=>{
	try{
	const [rows] = await pool.query('INSERT INTO usuario(`fecha`, `celular`, `pregunta`, `estado`  ) VALUES(?,?,?,?)', [fecha, from, msg_body, estado]);
        return(rows);
	}catch(err){console.log(err)}
}

const updateUser = async(status, from)=>{
	try{
	const [rows] = await pool.query('UPDATE usuario SET estado=?  WHERE celular=?', [status, from]);
	}catch(err){console.log(err)}

}



const ZDGGroupCheck = (jid) =>{
	const regex = new RegExp(/^\d{18}.us$/)
	return regex.test(jid)
}

const ZDGUpdate = (ZDGsock)=>{
	ZDGsock.on('connection.update', ({connection, lastDisconnect, qr})=>{
		if(qr){
			console.log('0 Bot - QrCode: ', qr)
		};
		if(connection === 'close'){
			const ZDGReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
			if(ZDGReconnect) ZDGConnection()
				console.log('0 Bot - Conexión Cerrada Razón: '+DisconnectReason.loggedOut.toString());
			if(ZDGReconnect === false){
				fs.rmSync('zdg', {recursive: true, force: true});
				const removeAuth = 'zdg';
				unlink(removeAuth, err =>{
					if(err) throw err
				})
			}
		}
		if(connection === 'open'){
			console.log('0 Bot - CONECTADO')
		}
	})
}



//Primer Bot
const ZDGConnection = async()=>{
		const {version} = await fetchLatestBaileysVersion();
		const {state, saveCreds} = await useMultiFileAuthState('zdg2');

		const config = {
			auth: state,
			logger: P({level: 'error'}),
			printQRInTerminal: true,
			version,
			connectionTimeOutMs: 60_000,
			async getMessage(key){
				return {conversation: 'botzdg'};
			}
		}

	const ZDGsock = makeWaSocket(config, {auth:state});
	ZDGUpdate(ZDGsock.ev)
	ZDGsock.ev.on('creds.update', saveCreds);


	const ZDGSendMessage = async (jid, msg)=>{
		await ZDGsock.presenceSubscribe(jid);
		await delay(2000);
		await ZDGsock.sendPresenceUpdate('composing',jid);
		await delay(1500);	
		await ZDGsock.sendPresenceUpdate('paused',jid);
		return await ZDGsock.sendMessage(jid, msg)
	}


	ZDGsock.ev.on('messages.upsert', async({messages})=>{
		const msg = messages[0];
		console.log("Msg: "+JSON.stringify(messages))

		var jid = msg.key.remoteJid;
		//Número para hacer la consulta
		var from = jid.substring(0,12);
		//console.log("msg: "+from)

		if(msg.message.conversation !== undefined && !ZDGGroupCheck(jid) && jid !== "status@broadcast"){


   	try{
   	  if(msg.messageStubParameters){
   	      sendMessageWTyping(waSock, { text: "Coloca *Hola* para iniciar." }, jid)
   	          .then(result => console.log('RESULT: ', "Enviado msg"))
   	          .catch(error=> console.log('Error: ', error));                 
   	  }
   	}
   	catch (error) {
   	  console.error("Error try catch Media 3");
   	}


	    	//Evitar errores al envio de otro tipo de mensajes.
		try {
			var videos = typeof(msg.message.videoMessage.url)
		} catch (error) {
		  console.error("Error try catch Media");
		}

		try {
  	    		var music = typeof(msg.message.audioMessage.url)
		} catch (error) {
		  console.error("Error try catch Media");
		}

		try {
			var docu = typeof(msg.message.documentMessage.url)
		} catch (error) {
		  console.error("Error try catch Media");
		}

		try{
			var listBoton = typeof(msg.message.listResponseMessage.title)
			var msg_bodyListBoton = msg.message.listResponseMessage.title
			var producto = msg.message.listResponseMessage.contextInfo.quotedMessage.listMessage.title
			console.log("listBoton: "+listBoton)
		}catch(error){
			console.log("Error Botón")
		}



		try{
			var botonResponse = typeof(msg.message.buttonsResponseMessage.selectedDisplayText)
			var msg_bodybotonResponse=msg.message.buttonsResponseMessage.selectedDisplayText
			console.log("botonResponse: "+botonResponse)

		}catch(error){
			console.log("Error Botón")
		}

		try{
			var locationResponse = typeof(msg.message.locationMessage.address)
			var msg_bodylocationResponse = msg.message.locationMessage;
			var latitud = msg.message.locationMessage.degreesLatitude;
			var longitud = msg.message.locationMessage.degreesLongitude;
			//console.log("locationResponse: "+locationResponse)

		}catch(error){
			console.log("Error Botón")
		}



		try{
			const length1 = JSON.stringify(msg)
			console.log("Longitud: "+length1.length)
			const fromme = msg.key.fromMe

			if(length1.length < "800" && fromme == false){
				var msg_body = msg.message.conversation;
				//var msg_body = msg.message.extendedTextMessage.text;			
				console.log("Data1: "+msg_body)
			}
		}catch(error){
			console.log("Error Botón2")
		}

		try{
			const length1 = JSON.stringify(msg)
			console.log("Longitud: "+length1.length)
			const fromme = msg.key.fromMe

			if(length1.length < "800" && fromme == false){
				//var msg_body = msg.message.conversation;
				var msg_body = msg.message.extendedTextMessage.text;			
				console.log("Data1: "+msg_body)
			}
		}catch(error){
			console.log("Error Botón2")
		}
		const fromme = msg.key.fromMe
		if(botonResponse == "string" && fromme == false && videos !== "string" && music !== "string"){
			var msg_body = msg_bodybotonResponse;

			console.log("Data2: "+msg_body)
		}


		if(listBoton == "string" && fromme == false && docu !== "string"){
			var msg_body = msg_bodyListBoton;
			var titulo = productoTitulo;
			var prodCart = producto
			console.log("Data3: "+msg_body)
		}




		if(locationResponse == "string" && fromme == false && videos !== "string"){
			var msg_body = msg_bodylocationResponse;
			var lat = latitud;
			var long = longitud;

			console.log("Data4: "+msg_body)
		}


		


		const dataUser = await getUserData(from);
		console.log(dataUser.length)
		const User = msg.pushName;

		if(dataUser.length > 0){
			var status = dataUser[0].estado;
			console.log("Status: "+status);
		}

		if(msg_body !== "" &&  msg_body !== undefined && msg_body !== "Iniciar conversación" && 
			dataUser.length > 0 && status == "Activo"){
				
				console.log("Aqui: "+msg_body)
				const buttons11 = [
				  {buttonId: 'id1', buttonText: {displayText: 'Iniciar conversación'}, type: 1}			  
				]

				const buttonMessage2 = {
				    text: "Bienvenido/a de nuevo "+User,
				    footer: '',
				    buttons: buttons11,
				    headerType: 1
				}				
	    	ZDGSendMessage(jid, buttonMessage2)
					.then(result => console.log('RESULT: ', "Inicio enviado."))
					.catch(error=> console.log('Error: ', error))

		}
		else if(dataUser.length == 0 && msg_body !== "Iniciar conversación"){

			function padTo2Digits(num) {
			  return num.toString().padStart(2, '0');
			}

			function formatDate(date) {
			  return [
			    padTo2Digits(date.getMonth() + 1),
			    padTo2Digits(date.getDate()),
			    date.getFullYear(),
			  ].join('/');
			}

			//console.log(formatDate(new Date())+" "+new Date().getHours()+":"+new Date().getMinutes().toString().padStart(2, '0'));

			const fecha = formatDate(new Date())+" "+new Date().getHours()+":"+new Date().getMinutes()
			console.log("fecha: "+fecha)

			const status = "Activo"
			await setUser(fecha, from, status)

				const buttons11 = [
				  {buttonId: 'id1', buttonText: {displayText: 'Iniciar conversación'}, type: 1},
				  {buttonId: 'id2', buttonText: {displayText: 'Guía de uso'}, type: 1}			  
				]

				const buttonMessage2 = {
				    text: "Bienvenido/a "+User,
				    footer: '',
				    buttons: buttons11,
				    headerType: 1
				}				
	    	ZDGSendMessage(jid, buttonMessage2)
					.then(result => console.log('RESULT: ', "Inicio nuevo enviado."))
					.catch(error=> console.log('Error: ', error))
		}

		if(msg_body == "Iniciar conversación"){

			const estado = "Inicio"
			await updateUser(estado, from);

	    	ZDGSendMessage(jid, {text: "Hola, cuentame cómo te puedo ayudar?"})
					.then(result => console.log('RESULT: ', "Inicio conversación enviado."))
					.catch(error=> console.log('Error: ', error))			
		}


		if(msg_body == "Guía de uso"){

	    	ZDGSendMessage(jid, {text: "Guia de uso."})
					.then(result => console.log('RESULT: ', "Inicio conversación enviado."))
					.catch(error=> console.log('Error: ', error))			

		}



		
		if(msg_body !== undefined && msg_body !== "" && status =="Inicio" && dataUser.length>0 && 
			msg_body !== "Iniciar conversación" && msg_body !== "Guía de uso"){
			function padTo2Digits(num) {
			  return num.toString().padStart(2, '0');
			}

			function formatDate(date) {
			  return [
			    padTo2Digits(date.getMonth() + 1),
			    padTo2Digits(date.getDate()),
			    date.getFullYear(),
			  ].join('/');
			}

			//console.log(formatDate(new Date())+" "+new Date().getHours()+":"+new Date().getMinutes().toString().padStart(2, '0'));

			const fecha = formatDate(new Date())+" "+new Date().getHours()+":"+new Date().getMinutes()
			console.log("fecha: "+fecha)

			const estado = "Inicio"
			await setUserMsg(fecha, from, msg_body, estado);

			const dataChat = await getChatgpt(msg_body)
			console.log("dataChat: "+dataChat)
	    	ZDGSendMessage(jid, {text: dataChat})

			}

		if(msg_body !== undefined && msg_body !== "" && status == "Inicio"){

			//Olvido sesión después de 10 minutos.
			delay1(600000).then(async function(){
			console.log("-----------Olvido--------------")
			const status = "Activo";
			await updateUser(status, from);

			ZDGSendMessage(jid, {text: "Si tienes alguna pregunta estoy para ayudarte."})
			.then(result => console.log('RESULT: ', "Sesión expirada enviado."))
			.catch(error=> console.log('Error: ', error))
			});			
		}




		}

	})

}






ZDGConnection()

server.listen(PORT, function(){
	console.log('0 Bot Port: '+PORT)
})





