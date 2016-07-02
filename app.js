var builder = require('botbuilder'),
    restify = require('restify'),
    nconf = require('nconf');

var server = restify.createServer(),
    dinnerBot = new builder.BotConnectorBot();

// Create nconf environment to load keys and connections strings
// which should not end up on GitHub
    nconf 
        .file({ file: './config.json' }) 
        .env(); 

// Instantiate LUIS dialog        
var dialog = new builder.LuisDialog(nconf.get("LUIS_model_URL"));

dinnerBot.add('/', dialog)
dialog    
    .onBegin(builder.DialogAction.send("Hi, I'm DinnerBot!"))
    .on('ListMenu', '/listMenu')
    .on('ListGuests', '/listGuests')
    .on('Rude', '/respondToRude')
    .onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."))

dinnerBot.add('/listMenu', function (session, args) {
    session.send("You asked what is on the menu.");
    session.endDialog();
});
dinnerBot.add('/listGuests', function (session, args) {
    session.send("I'll be there.");
    session.endDialog();
});
dinnerBot.add('/respondToRude', function (session, args) {
    session.send("Don't be rude.");
    session.endDialog();
});

dinnerBot.add('/profile',  [
    function (session) {
        if (session.userData.name) {
            builder.Prompts.text(session, 'What would you like to change it to?');
        } else {
            builder.Prompts.text(session, 'Hi! What is your name?');
        }
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);

server.use(dinnerBot.verifyBotFramework({ appId: 'YourAppId', appSecret: 'YourAppSecret' }));
server.post('/v1/messages', dinnerBot.listen());

server.listen(process.env.port || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});