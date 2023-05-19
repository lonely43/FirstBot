const { Scenes } = require('telegraf')

const pasGenScene = new Scenes.WizardScene("pasGen", 
async (ctx) => {
   await ctx.reply("Введите длину пароля.")
   ctx.wizard.next();
},
async (ctx) => {
   const delta = "0123456789abcdefghijklmnopqrstuvwxyz!?-+@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ"
   ctx.state.length = ctx.message.text
   if(!isNaN(ctx.state.length)){
      if(ctx.state.length > 500){
         ctx.reply("Размер пароля должен быть меньше - 500.")
      }
      else{
         let password = ""
         const passwordLength = ctx.state.length
         for(let i = 0; i < passwordLength; i++){
            password += delta[Math.floor(Math.random()*delta.length)]
         }
         ctx.reply(password)
         return ctx.scene.leave();
      }
   }
   else{
      ctx.reply("Вы ввели неправильные данные 😕")
   }
});

module.exports = pasGenScene