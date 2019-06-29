const Discord = require(`discord.js`);
const client = new Discord.Client();
const auth = require(`./auth.json`);
const prefix = `//`;
var spamchecker = 0;
var taskchecker = 0;
var task = null;

// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate');
// Your Google Cloud Platform project ID
const projectId = 'moneybot-1561761737106';
// Instantiates a client
const translate = new Translate({
  projectId: projectId,
});

client.login(auth.token);

client.on(`ready`, () => console.log(`Logged in as ${client.user.tag}!`));

client.on(`message`, msg => {
	if (!msg.content.startsWith(prefix)) return;

	const blacklist = [`594292251551727629`];
	for (let i = 0; i < blacklist.length; i++) {
    	if (msg.author.id === blacklist[i]) return;
	};

	const ignoredinputs = [`<@193529774084194315`];
	for (let i = 0; i < ignoredinputs.length; i++) {
    	if (msg.content.includes === ignoredinputs[i]) return msg.channel.send(`You are not allowed to spam this.`);
	};
	
	const args = msg.content.trim().split(/ +/g);
	
	if (msg.content === `${prefix}ping`) msg.reply(client.ping + `ms`); 
  	if (msg.content === `${prefix}help`) msg.reply(`Hi, I am EpicBot. I am still in the very early stages of development. Currently available commands can be listed using \`${prefix}cmds\`.`);
  	if (msg.content === `${prefix}cmds`) msg.reply(`Available commands:\n\`${prefix}ping\`\n\`${prefix}help\`\n\`${prefix}cmds\`\n\`${prefix}spam [text]\`\n\`${prefix}cease\`\n\`${prefix}translate [text] [language] or ${prefix}t [text] [language]\`.`);
	
	if (msg.content.startsWith(`${prefix}say`)) {
		const text = args.slice(1).join(` `);
		if (!text) return msg.reply(`Where is the noise? The signal? The sound?`);
		msg.channel.send(text)
	}

	if (msg.content.startsWith(`${prefix}spam`)) {
		const text = args.slice(1).join(` `);
		if (!text) return msg.reply(`What am I supposed to spam? Nothing?`);
		if (text === ignoredinputs) return msg.channel.send(`Sorry, you are not allowed to spam this.`)
		if (spamchecker === 1) return msg.channel.send(`Sorry, there is already a \`${prefix}spam\` command running! Use \`${prefix}cease\` to terminate it and run a new one.`)
		const interval = setInterval(() => {
			spamchecker = 1;
			taskchecker = 1;
			msg.channel.send(text)
				.catch(err => {
					console.error(err);
					clearInterval(interval);
					task = null;
			});
		}, 2000);
		
		task = interval;
	}
	
	if (msg.content.startsWith(`${prefix}cease`)) {
		clearInterval(task)
		spamchecker = 0;
		if (taskchecker === 0) return msg.channel.send(`:x: Task successfully failed. No tasks active.`);
		if (taskchecker === 1) {
			msg.channel.send(`:white_check_mark: Task failed successfully.`)
			taskchecker = 0;
		}
	}

	if (msg.content.startsWith(`${prefix}translate`) || msg.content.startsWith(`${prefix}t`)) {
		const text = args.slice(1).join(` `);
		if (!text) return msg.channel.send(`Nothing to translate provided! Languages codes are at https://cloud.google.com/translate/docs/languages !\n Command syntax: \`${prefix}translate\` or \`${prefix}t\` [text] [language code]`);
		const text1 = text.substring(0, text.length - 2)
		const target = text.substring(text.length - 2, text.length) || languages
		translate
  		.translate(text1, target)
  		.then(results => {
    		const translation = results[0];
    		msg.channel.send(`Translation: ${translation}`).then(sentText => {
    			const textEN = sentText;
    			sentText.react(`🔀`);
    			const filter = (reaction, user) => reaction.emoji.name === '🔀' && user.id !== client.user.id;
				sentText.awaitReactions(filter, { max: 1, time: 5000, errors: ['time'] })
   				.then(collected => {
        			const reaction = collected.first();
            			const target = `en`
						translate
  						.translate(text1, target)
  						.then(results => {
    					const translation = results[0];
    					msg.channel.send(`Translation: ${translation}`);
    					})
    					.catch(err => {
    						console.log(err);
    					})
   				})
    		})
  		})
  		.catch(err => {
  			const target = text.substring(text.length - 3, text.length)
  			const text2 =  text.substring(0, text.length - 3)
  			translate
  				.translate(text2, target)
  				.then(results => {
    				const translation = results[0];
    				msg.channel.send(`Translation: ${translation}`);
  		})
  		.catch(err => {
  			console.log(`ERROR`,err)
   			msg.channel.send(`Invalid language code! Languages codes are at https://cloud.google.com/translate/docs/languages !`);
   		})
  		});

	}
});