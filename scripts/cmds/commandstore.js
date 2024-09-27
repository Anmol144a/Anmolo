const axios = require("axios");

module.exports = {
 config: {
 name: 'cmdstore',
 version: '1.0',
 author: 'Anmol Crex',
 role: 0,
 shortDescription: 'Store of commands',
 longDescription: 'Store of commands all made by Anmol Crex',
 category: 'utility',
 guide: {
 en: 'To view commands: {p}cmdstore\nTo paginate: {p}cmdstore {page}\nTo search: {p}cmdstore search {query}'
 }
 },

 onStart: async function ({ api, event, args, message }) {
 try {
 let page = 1;
 let searchQuery = "";

 // Handle pagination or search
 if (args.length === 1 && !isNaN(parseInt(args[0]))) {
 page = parseInt(args[0]);
 } else if (args.length === 1 && typeof args[0] === 'string') {
 searchQuery = args[0];
 } else if (args.length === 2 && args[0].toLowerCase() === 'search' && typeof args[1] === 'string') {
 searchQuery = args[1];
 }

 // Fetch commands from the external API
 const response = await axios.get("https://cmd-store.vercel.app/kshitiz");
 const commands = response.data;

 // Filter commands based on search query
 let filteredCommands = commands;
 if (searchQuery) {
 filteredCommands = commands.filter(cmd => cmd.cmdName.toLowerCase().includes(searchQuery.toLowerCase()));
 }

 // Paginate commands
 const startIndex = (page - 1) * 10;
 const endIndex = page * 10;
 const paginatedCommands = filteredCommands.slice(startIndex, endIndex);

 let replyMessage = "";
 paginatedCommands.forEach(cmd => {
 replyMessage += `
 📜 Command ID: ${cmd.id}
 🛠️ Command Name: ${cmd.cmdName}
 🔗 Code Link: ${cmd.codeLink}
 ✍️ Description: ${cmd.description}
 ----------------------------------------------`;
 });

 if (replyMessage === "") {
 replyMessage = "No commands found.";
 }

 // Send the reply message
 api.sendMessage(replyMessage, event.threadID, event.messageID);
 } catch (error) {
 console.error(error);
 api.sendMessage("An error occurred while fetching commands.", event.threadID, event.messageID);
 }
 },

 onReply: async function ({ api, event, Reply, args, message }) {
 const { author, commandName, commands } = Reply;

 // Check if the reply is from the command's author
 if (event.senderID !== author || !commands) {
 return;
 }

 const commandID = parseInt(args[0], 10);

 // Validate command ID
 if (isNaN(commandID) || !commands.some(cmd => cmd.id === commandID)) {
 return api.sendMessage("Invalid input.\nPlease provide a valid command ID.", event.threadID, event.messageID);
 }

 // Find the selected command
 const selectedCommand = commands.find(cmd => cmd.id === commandID);

 // Create the reply message
 let replyMessage = `
 📜 Command ID: ${selectedCommand.id}
 🛠️ Command Name: ${selectedCommand.cmdName}
 🔗 Code Link: ${selectedCommand.codeLink}
 ✍️ Description: ${selectedCommand.description}`;

 // Send the reply message
 api.sendMessage(replyMessage, event.threadID, event.messageID);
 },
};