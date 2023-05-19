const { Telegraf } = require('telegraf')
const LocalSession = require('telegraf-session-local')
const { Scenes } = require('telegraf')

const dotenv = require('dotenv')
dotenv.config()

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.telegram.setMyCommands(
   [{command: "start", description: "Чтобы начать!"}, 
   {command: "game", description: `Играть в "Угадай цисло!"`},
   {command: "pasgen", description: "Сгенерировать пароль"}]
)

const gameOptions = {
   reply_markup: JSON.stringify({
      keyboard: [
         [{text: "число - 1"},{text: "2"},{text: "3"}],
         [{text: "4"},{text: "5"},{text: "6"}],
         [{text: "7"},{text: "8"},{text: "9"}],
         [{text: "0"}],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
   })
}
const restartGameOptions = {
   reply_markup: JSON.stringify({
      keyboard: [
         [{text: "Попробывать снова?", callback_data: "/restartGame"}],
      ]
   })
}

function startGame(ctx){
   const randomNumber = Math.floor(Math.random() * 10)
   ctx.session.random = randomNumber
}

const pasGenScene = require("./scenes/pasGen-scene")
const stage = new Scenes.Stage([pasGenScene])

bot.use((new LocalSession({ database: 'db.json' })).middleware())
bot.use(stage.middleware());


bot.start(ctx => {
   ctx.reply(`
   Добро пожаловать. Я был создан по рофлу, мой отец робот.
Чтобы узнать больше нажмите на - /help`)
})
bot.help(ctx => {
   ctx.reply(`
   Список комманд, на которые я реагирую:
   /game
   /pasgen`)
})
bot.command("pasgen", ctx => {
   ctx.scene.enter("pasGen");
})

bot.on("message", async ctx => {
   const chat_id = ctx.chat.id
   const msg = ctx.message.text

   if(msg == "/game"){
      await ctx.reply("Я загадал число от 0 до 10!")
      startGame(ctx)

      return ctx.reply("Угадай его", gameOptions)
   }
})
bot.on("callback_query", async ctx => {
   const data = ctx.callbackQuery.data

   // GAME

   if(data == "/restartGame"){
      await ctx.reply("Я загадал число от 0 до 10!")
      startGame(ctx)

      return ctx.reply("Угадай его", gameOptions)
   }

   if(ctx.session.random !== 0){
      if(data == ctx.session.random){
         await ctx.reply(`Ты победил! Число было - ${ctx.session.random}`, restartGameOptions)
         return ctx.session.random = 0
      }
      else{
         await ctx.reply(`Ты проиграл( Число было - ${ctx.session.random}`, restartGameOptions)
         return ctx.session.random = 0
      }
   }
   // END GAME
})


bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));