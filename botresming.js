const { Telegraf, Markup } = require("telegraf");
const fs = require("fs");
const path = require("path");

// Pastikan folder database ada
const dbDir = "./database";
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Inisialisasi bot dengan token Anda
const bot = new Telegraf("8592407821:AAGOB2FmqS8YC1U8JgGXtsNp6eSFqLdz7O0");

// File database
const blacklistFile = "./database/blacklist.json";
const groupFile = "./database/grub.json";
const presetFile = "./database/preset.json";
const premiumFile = "./database/premium.json";
const groupStatFile = "./database/groupstats.json";
const userFile = "./database/users.json";
const autoShareFile = './database/autoshare.json';
const ownerFile = "./database/owner.json";
const autoKirimFile = "./database/autokirim.json";

// Owner ID (ganti dengan ID Anda)
const ownerId = [6210345140];

// Channel wajib join (isi dengan channel Anda)
const channelWajib = [
    "@infoupdetscfsxdxy",
];

const channelGimick = "@infoupdetscfsxdxy";

// Inisialisasi file database dengan data default jika belum ada
function initDatabase() {
    const files = [
        { file: blacklistFile, default: [] },
        { file: groupFile, default: [] },
        { file: presetFile, default: Array(20).fill("") },
        { file: premiumFile, default: [] },
        { file: groupStatFile, default: {} },
        { file: userFile, default: [] },
        { file: autoShareFile, default: { interval: 10 } },
        { file: ownerFile, default: ownerId },
        { file: autoKirimFile, default: { status: false, text: "" } }
    ];

    files.forEach(({ file, default: defaultValue }) => {
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2));
            console.log(`✅ Created: ${file}`);
        }
    });
}

// Panggil fungsi inisialisasi
initDatabase();

let autoKirimInterval = null;
let autoShareInterval = null;

// Fungsi cek join channel
async function cekJoinChannel(userId, ctx) {
    for (const ch of channelWajib) {
        try {
            const chatId = ch.startsWith('@') ? ch : `@${ch}`;
            const member = await ctx.telegram.getChatMember(chatId, userId);
            if (!["member", "administrator", "creator"].includes(member.status)) {
                return false;
            }
        } catch (error) {
            console.error(`Error checking channel ${ch}:`, error.message);
            return false;
        }
    }
    return true;
}

// Middleware untuk cek join channel
bot.use(async (ctx, next) => {
    // Skip untuk command tertentu yang tidak perlu cek join
    if (ctx.message && ctx.message.text) {
        const text = ctx.message.text;
        if (text.startsWith('/start') || text.startsWith('/auto') || text.startsWith('/backup') || 
            text.startsWith('/pinggrub') || text.startsWith('/bcuser') || text.startsWith('/top')) {
            return next();
        }
    }

    const uid = ctx.from?.id;
    if (!uid) return next();

    // Cek blacklist
    const blacklist = JSON.parse(fs.readFileSync(blacklistFile));
    if (blacklist.includes(uid)) {
        console.log(`User ${uid} is blacklisted`);
        return;
    }

    // Cek apakah user adalah owner
    const owners = JSON.parse(fs.readFileSync(ownerFile));
    if (owners.includes(uid)) {
        return next();
    }

    // Cek join channel untuk non-owner
    const ok = await cekJoinChannel(uid, ctx);
    if (!ok) {
        const buttons = Markup.inlineKeyboard([
            ...channelWajib.map(ch => 
                Markup.button.url(`Join ${ch}`, `https://t.me/${ch.replace("@", "")}`)
            ),
            Markup.button.callback("✅ Sudah Join", "cek_ulang"),
        ], { columns: 1 });

        return ctx.reply(
            `❌ *Harus Join Channel Dulu!*\n\n` +
            `Untuk menggunakan bot ini, Anda harus join channel berikut:\n` +
            channelWajib.map(c => `• ${c}`).join("\n") +
            `\n\nSetelah join, klik tombol "✅ Sudah Join" di bawah.`,
            {
                parse_mode: "Markdown",
                ...buttons
            }
        );
    }
    return next();
});

// Random images untuk menu
const randomImages = [
    "https://files.catbox.moe/c45jek.jpg",
    "https://files.catbox.moe/gevlx9.jpg",
    "https://files.catbox.moe/uvegiv.jpg"
];

const getRandomImage = () => randomImages[Math.floor(Math.random() * randomImages.length)];

// Fungsi edit menu
async function editMenu(ctx, caption, buttons) {
    try {
        if (ctx.callbackQuery) {
            await ctx.editMessageMedia(
                {
                    type: 'photo',
                    media: getRandomImage(),
                    caption: caption,
                    parse_mode: 'HTML',
                },
                {
                    reply_markup: buttons.reply_markup,
                }
            );
        }
    } catch (error) {
        console.error('Error editing menu:', error.message);
        try {
            await ctx.reply('Maaf, terjadi kesalahan saat mengedit pesan.');
        } catch (e) {
            // Skip jika ada error
        }
    }
}

// Fungsi backup
async function kirimBackup() {
    const owners = JSON.parse(fs.readFileSync(ownerFile));
    const files = [
        "./database/grub.json",
        "./database/groupstats.json",
        "./database/users.json",
        "./database/premium.json",
        "./database/owner.json",
        "./database/blacklist.json",
        "./database/preset.json",
        "./database/autoshare.json",
        "./database/autokirim.json"
    ];

    for (const ownerId of owners) {
        try {
            await bot.telegram.sendMessage(ownerId, "📦 *Backup Database*", { parse_mode: "Markdown" });
            
            for (const file of files) {
                if (fs.existsSync(file)) {
                    await bot.telegram.sendDocument(ownerId, { source: file });
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            console.log(`✅ Backup sent to owner ${ownerId}`);
        } catch (e) {
            console.error(`❌ Failed to send backup to ${ownerId}:`, e.message);
        }
    }
}

// Command: /start
bot.command('start', async (ctx) => {
    const userId = ctx.from.id;
    
    // Simpan user ke database
    let users = JSON.parse(fs.readFileSync(userFile));
    if (!users.includes(userId)) {
        users.push(userId);
        fs.writeFileSync(userFile, JSON.stringify(users, null, 2));
    }

    const buttons = Markup.inlineKeyboard([
        [
            Markup.button.callback('𝙈𝙀𝙉𝙐 𝙐𝙏𝘼𝙈𝘼', 'Daxingnot1'),
            Markup.button.callback('KHUSUS OWNER', 'fathirofsc2'),
        ],
        [
            Markup.button.url('𝘿𝙀𝙑𝙀𝙇𝙊𝙋𝙀𝙍', 'https://t.me/fathirsthore'),
        ]
    ]);

    await ctx.replyWithPhoto(getRandomImage(), {
        caption: `
<blockquote>
╭──( 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗧𝗢 )──╮
╰──( 𝗕𝗢𝗧  𝗝𝗔𝗦𝗦𝗘𝗕  )──╯

╭─────( 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐒𝐈 )──────╮
│✧ Developer : 𝗙𝗔𝗧𝗛𝗜𝗥 𝗦𝗧𝗛𝗢𝗥𝗘 
│✧ Author : 𝗙𝗔𝗧𝗛𝗜𝗥 𝗦𝗧𝗛𝗢𝗥𝗘 
│✧ Version : 2.0
│✧ encourager : [all buyer, ortu,] 
│✧ Deskripsi : ⤸ 
│✧ Language 𝖩𝖤𝖯𝖠𝖭𝖦  🇯🇵
│
│<b>このボットは</b>
│<b>ルーム/グループにメッセージを配信するサービス</b>
│<b>ボットです。これにより、</b>
│<b>ユーザーはボット内のすべてのルーム/</b>
│<b>グループにメッセージを素早く共有できます。</b>
│<b>ボットアクセスを</b>
│<b>取得するには、</b>
│<b>ボットをルーム/グループに2回入力すると、自動的</b>
│<b>にプレミアムアクセスが付与されます。</b>
│
│✧ Language INDONESIA 🇮🇩
│<b>Bot ini adalah bot jasa sebar ke</b>
│<b>room/grub untuk mempermudah</b> 
│<b>pengguna agar cepat membagi pesan</b>
│<b>kesemua room/grub yang ada di BOT</b>
│<b>dan jika anda ingin mendapatkan</b>
│<b>akses BOT masukin BOT ke</b> 
│<b>room/grub sebanyak 2x otomatis</b>
│<b>akan mendapatkan akses premium</b>
╰─────────────────────╯
</blockquote>`,
        parse_mode: 'HTML',
        ...buttons
    });
});

// Action: Menu Utama
bot.action('Daxingnot1', async (ctx) => {
    const buttons = Markup.inlineKeyboard([
        [Markup.button.callback('🔙 BACK', 'startback')],
    ]);

    const caption = `
<blockquote>
✦━━━━━━[  𝗕𝗢𝗧 𝗝𝗔𝗦𝗦𝗘𝗕  ]━━━━━━✦
⌬  𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗙𝗔𝗧𝗛𝗜𝗥 𝗦𝗧𝗛𝗢𝗥𝗘 ⌬
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⟡ 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗦𝗜 𝗕𝗢𝗧 ⟡
› 𝖣𝖾𝗏𝖾𝗅𝗈𝗉𝖾𝗋 : FATHIR STHORE
› 𝖠𝗎𝗍𝗁𝗈𝗋    : Daxyinz
› 𝖵𝖾𝗋𝗌𝗂𝗈𝗇   : 1.0
› 𝖲𝗎𝗉𝗉𝗈𝗋𝗍   : [all buyer, ortu,] 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⟡ 𝙈𝙀𝙉𝙐 𝙐𝙏𝘼𝙈𝘼 ⟡
▣ /share       ⇢  𝖡𝗋𝗈𝖺𝖽𝖼𝖺𝗌𝗍 𝖥𝗈𝗋𝗐𝖺𝗋𝖽
▣ /autoshare   ⇢  𝖠𝗎𝗍𝗈 𝖡𝗋𝗈𝖺𝖽𝖼𝖺𝗌𝗍 𝖥𝗈𝗋𝗐𝖺𝗋𝖽
▣ /pinggrub    ⇢  𝖳𝗈𝗍𝖺𝗅 𝖦𝗋𝗈𝗎𝗉
▣ /bcuser      ⇢  𝖡𝗋𝗈𝖺𝖽𝖼𝖺𝗌𝗍 𝖴𝗌𝖾𝗋 𝖥𝗈𝗋𝗐𝖺𝗋𝖽
▣ /top         ⇢  𝖱𝖺𝗇𝗄𝗂𝗇𝗀 𝖯𝖾𝗇𝗀𝗎𝗇𝖽𝖺𝗇𝗀
▣ /set         ⇢  𝖲𝗂𝗆𝗉𝖺𝗇 𝖳𝖷𝖳 → 𝖩𝖲𝖮𝖭
▣ /del         ⇢  𝖧𝖺𝗉𝗎𝗌 𝖳𝖷𝖳 𝖽𝖺𝗋𝗂 𝖩𝖲𝖮𝖭
▣ /list        ⇢  𝖣𝖺𝖿𝗍𝖺𝗋 𝖳𝖷𝖳 𝖽𝖺𝗅𝖺𝗆 𝖩𝖲𝖮𝖭
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          『🦋』 𝘼𝙡𝙡 𝙃𝙚𝙥𝙥𝙮
</blockquote>`;

    await editMenu(ctx, caption, buttons);
});

// Action: Menu Owner
bot.action('fathirofsc2', async (ctx) => {
    const owners = JSON.parse(fs.readFileSync(ownerFile));
    const userId = ctx.from.id;
    
    if (!owners.includes(userId)) {
        return ctx.answerCbQuery("❌ Menu ini hanya untuk owner!", { show_alert: true });
    }

    const buttons = Markup.inlineKeyboard([
        [Markup.button.callback('🔙 BACK', 'startback')],
    ]);

    const caption = `
<blockquote>
╭──( 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗧𝗢 )──╮
╰──( 𝗕𝗢𝗧  𝗝𝗔𝗦𝗦𝗘𝗕 𝗩𝟭  )──╯

╭─────( 𝗗𝗔𝗙𝗧𝗔𝗥 )──────╮
│✧ 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿 : 𝖥𝖠𝖳𝖧𝖨𝖱 𝖲𝖳𝖧𝖮𝖱𝖤
│✧ 𝗔𝘂𝘁𝗵𝗼𝗿 : Daxyinz
│✧ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : 𝟣.𝟢
│✧ 𝗲𝗻𝗰𝗼𝘂𝗿𝗮𝗴𝗲𝗿 : [all buyer, ortu,] 
│✧ 𝗗𝗲𝘀𝗸𝗿𝗶𝗽𝘀𝗶 : ⤸ 
│✧ Language 𝖩𝖤𝖯𝖠𝖭𝖦  🇯🇵
│✧ /addprem id ( 𝘢𝘥𝘥 𝘭𝘪𝘴𝘵 𝘱𝘳𝘦𝘮𝘪𝘶𝘮 )
│✧ /delprem id ( 𝘥𝘦𝘭𝘦𝘵𝘦 𝘭𝘪𝘴𝘵 𝘱𝘳𝘦𝘮𝘪𝘶𝘮 )
│✧ /auto on/off teks ( 𝘢𝘶𝘵𝘰 𝘬𝘪𝘳𝘪𝘮 1/𝘫𝘢𝘮 )
│✧ /blokir id (𝘬𝘩𝘶𝘴𝘶𝘴 𝘰𝘸𝘯𝘦𝘳 𝘥𝘢𝘯 𝘩𝘢𝘳𝘶𝘴 𝘢𝘥𝘥 𝘰𝘸𝘯𝘦𝘳)
│✧ /unblokir id (𝘬𝘩𝘶𝘴𝘶𝘴 𝘰𝘸𝘯𝘦𝘳 𝘥𝘢𝘯 𝘩𝘢𝘳𝘶𝘴 𝘢𝘥𝘥 𝘰𝘸𝘯𝘦𝘳)
╰─────────────────────╯
</blockquote>`;

    await editMenu(ctx, caption, buttons);
});

// Action: Back to Start
bot.action('startback', async (ctx) => {
    const buttons = Markup.inlineKeyboard([
        [
            Markup.button.callback('𝙈𝙀𝙉𝙐 𝙐𝙏𝘼𝙈𝘼', 'Daxingnot1'),
            Markup.button.callback('𝗞𝗛𝗨𝗦𝗨𝗦 OWNER', 'fathirofsc2'),
        ],
        [
            Markup.button.url('𝘿𝙀𝙑𝙀𝙇𝙊𝙋𝙀𝙍', 'https://t.me/fathirsthore'),
        ]
    ]);

    const caption = `
<blockquote>
╭──( 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗧𝗢 )──╮
╰──( 𝗕𝗢𝗧  𝗝𝗔𝗦𝗦𝗘𝗕  )──╯

╭─────( 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐒𝐈 )──────╮
│✧ Developer : FATHIR STHORE
│✧ Author : Daxyinz
│✧ Version : 1.0
│✧ Language kode : 𝖩𝖺𝗏𝖺𝖲𝖼𝗋𝗂𝗉𝗍 
│✧ Deskripsi : ⤸ 
│✧ Language 𝖩𝖤𝖯𝖠𝖭𝖦  🇯🇵
│
│<b>このボットは</b>
│<b>ルーム/グループにメッセージを配信するサービス</b>
│<b>ボットです。これにより、</b>
│<b>ユーザーはボット内のすべてのルーム/</b>
│<b>グループにメッセージを素早く共有できます。</b>
│<b>ボットアクセスを</b>
│<b>取得するには、</b>
│<b>ボットをルーム/グループに2回入力すると、自動的</b>
│<b>にプレミアムアクセスが付与されます。</b>
│
│✧Language INDONESIA 🇮🇩
│<b>Bot ini adalah Bot Jasa sebar ke</b>
│<b>room/grub untuk mempermudah</b> 
│<b>Pengguna agar cepat membagi pesan</b>
│<b>Kesemua room/grub yang ada di BOT</b>
│<b>dan jika anda ingin mendapatkan</b>
│<b>Akses BOT Masukin BOT Ke</b> 
│<b>room/grub sebanyak 2x otomatis</b>
│<b>akan mendapatkan akses premium</b>
╰─────────────────────╯
</blockquote>`;
    await editMenu(ctx, caption, buttons);
});

// Action: Cek ulang join
bot.action('cek_ulang', async (ctx) => {
    const uid = ctx.from.id;
    const ok = await cekJoinChannel(uid, ctx);
    
    if (ok) {
        await ctx.answerCbQuery("✅ Verifikasi berhasil! Sekarang kamu bisa menggunakan bot.");
        await ctx.deleteMessage();
        // Kirim ulang menu start
        await ctx.reply("✅ Verifikasi berhasil! Silakan ketik /start untuk mulai menggunakan bot.");
    } else {
        await ctx.answerCbQuery("❌ Belum join semua channel! Silakan join dulu.", { show_alert: true });
    }
});

// Command: /share
bot.command("share", async ctx => {
    const senderId = ctx.from.id;
    const replyMsg = ctx.message.reply_to_message;

    // Cek premium
    const premiumUsers = JSON.parse(fs.readFileSync(premiumFile));
    if (!premiumUsers.includes(senderId)) {
        return ctx.reply("❌ Kamu belum menambahkan bot ini ke 2 grup telegram.\n\nJika ingin menggunakan fitur ini, kamu harus menambahkan bot ke dalam minimal 2 grup.", {
            parse_mode: "Markdown"
        });
    }

    if (!replyMsg) {
        return ctx.reply("🪧 ☇ Reply pesan yang ingin dibagikan / dipromosikan");
    }

    const groups = JSON.parse(fs.readFileSync(groupFile));
    if (groups.length === 0) {
        return ctx.reply("❌ Belum ada grup yang terdaftar.");
    }

    let sukses = 0;
    let gagal = 0;

    const progressMsg = await ctx.reply(`⏳ Mengirim ke ${groups.length} grup... (0/${groups.length})`);

    for (let i = 0; i < groups.length; i++) {
        const groupId = groups[i];
        try {
            await ctx.telegram.forwardMessage(groupId, ctx.chat.id, replyMsg.message_id);
            sukses++;
            
            // Update progress setiap 5 grup
            if ((i + 1) % 5 === 0 || i === groups.length - 1) {
                try {
                    await ctx.telegram.editMessageText(
                        progressMsg.chat.id,
                        progressMsg.message_id,
                        null,
                        `⏳ Mengirim ke ${groups.length} grup... (${i + 1}/${groups.length})`
                    );
                } catch (e) {
                    // Skip error edit message
                }
            }
        } catch (err) {
            gagal++;
            console.error(`Error sending to ${groupId}:`, err.message);
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Hapus progress message
    try {
        await ctx.telegram.deleteMessage(progressMsg.chat.id, progressMsg.message_id);
    } catch (e) {
        // Skip jika gagal hapus
    }

    await ctx.reply(
        `✅ *Selesai Broadcast!*\n\n` +
        `📊 *Statistik:*\n` +
        `• ✅ Sukses: *${sukses}*\n` +
        `• ❌ Gagal: *${gagal}*\n` +
        `• 📈 Total Grup: *${groups.length}*`,
        { parse_mode: "Markdown" }
    );
});

// Command: /autoshare
bot.command("autoshare", async ctx => {
    const senderId = ctx.from.id;
    const owners = JSON.parse(fs.readFileSync(ownerFile));
    
    if (!owners.includes(senderId)) {
        return ctx.reply("❌ Fitur ini hanya untuk owner.");
    }

    const args = ctx.message.text.split(" ");
    const command = args[1];

    if (!command) {
        return ctx.reply("❌ Format: /autoshare <on|off>\nContoh: /autoshare on");
    }

    if (command === "off") {
        if (autoShareInterval) {
            clearInterval(autoShareInterval);
            autoShareInterval = null;
            return ctx.reply("✅ Auto-share dimatikan.");
        }
        return ctx.reply("ℹ️ Auto-share sudah mati.");
    }

    if (command === "on") {
        const replyMsg = ctx.message.reply_to_message;
        if (!replyMsg) {
            return ctx.reply("❌ Reply pesan yang ingin dijadikan autoshare.");
        }

        if (autoShareInterval) {
            clearInterval(autoShareInterval);
        }

        const intervalConfig = JSON.parse(fs.readFileSync(autoShareFile));
        const jedaMenit = intervalConfig.interval || 10;

        await ctx.reply(`✅ Auto-share diaktifkan. Akan dikirim setiap ${jedaMenit} menit.`);

        // Fungsi untuk mengirim autoshare
        const sendAutoShare = async () => {
            const groups = JSON.parse(fs.readFileSync(groupFile));
            let sukses = 0;
            let gagal = 0;

            for (const groupId of groups) {
                try {
                    await ctx.telegram.forwardMessage(groupId, ctx.chat.id, replyMsg.message_id);
                    sukses++;
                } catch (e) {
                    gagal++;
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            console.log(`[AutoShare] Sukses: ${sukses} | Gagal: ${gagal}`);
        };

        // Jalankan sekali dulu
        await sendAutoShare();
        
        // Set interval
        autoShareInterval = setInterval(sendAutoShare, jedaMenit * 60 * 1000);
        return;
    }

    ctx.reply("❌ Format: /autoshare <on|off>");
});

// Command: /setjeda
bot.command("setjeda", async ctx => {
    const senderId = ctx.from.id;
    const owners = JSON.parse(fs.readFileSync(ownerFile));
    
    if (!owners.includes(senderId)) {
        return ctx.reply("❌ Hanya owner yang bisa mengatur jeda autoshare.");
    }

    const args = ctx.message.text.split(" ");
    const menit = parseInt(args[1]);

    if (isNaN(menit) || menit < 1) {
        return ctx.reply("❌ Format salah. Gunakan: /setjeda <menit>, contoh: /setjeda 15");
    }

    const config = { interval: menit };
    fs.writeFileSync(autoShareFile, JSON.stringify(config, null, 2));

    ctx.reply(`✅ Jeda autoshare diubah menjadi setiap ${menit} menit`);
});

// Command: /pinggrub
bot.command("pinggrub", async ctx => {
    const senderId = ctx.from.id;
    const owners = JSON.parse(fs.readFileSync(ownerFile));
    
    if (!owners.includes(senderId)) {
        return ctx.reply("❌ Akses perintah hanya untuk owner");
    }

    let groups = JSON.parse(fs.readFileSync(groupFile));
    let updatedGroups = [];
    let total = groups.length;
    let aktif = 0;
    let gagal = 0;

    const progressMsg = await ctx.reply(`📡 Memeriksa ${total} grup...`);

    for (let i = 0; i < groups.length; i++) {
        const groupId = groups[i];
        try {
            await ctx.telegram.sendChatAction(groupId, "typing");
            updatedGroups.push(groupId);
            aktif++;
        } catch (err) {
            gagal++;
        }
        
        // Update progress setiap 5 grup
        if ((i + 1) % 5 === 0 || i === groups.length - 1) {
            try {
                await ctx.telegram.editMessageText(
                    progressMsg.chat.id,
                    progressMsg.message_id,
                    null,
                    `📡 Memeriksa ${total} grup...\n` +
                    `✅ Aktif: ${aktif}\n` +
                    `❌ Gagal: ${gagal}\n` +
                    `📊 Progress: ${i + 1}/${total}`
                );
            } catch (e) {
                // Skip error
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    fs.writeFileSync(groupFile, JSON.stringify(updatedGroups, null, 2));

    // Hapus progress message
    try {
        await ctx.telegram.deleteMessage(progressMsg.chat.id, progressMsg.message_id);
    } catch (e) {
        // Skip
    }

    ctx.reply(
        `📊 *Hasil Pengecekan Grup:*\n\n` +
        `📈 Total Grup: *${total}*\n` +
        `✅ Grup Aktif: *${aktif}*\n` +
        `❌ Grup Dihapus: *${gagal}*`,
        { parse_mode: "Markdown" }
    );
});

// Command: /bcuser
bot.command("bcuser", async ctx => {
    const senderId = ctx.from.id;
    const owners = JSON.parse(fs.readFileSync(ownerFile));
    
    if (!owners.includes(senderId)) {
        return ctx.reply("❌ Akses hanya untuk owner.");
    }

    const replyMsg = ctx.message.reply_to_message;
    if (!replyMsg) {
        return ctx.reply("❌ Balas pesan yang mau di-broadcast ke semua user.");
    }

    const userList = JSON.parse(fs.readFileSync(userFile));
    if (userList.length === 0) {
        return ctx.reply("❌ Belum ada user yang terdaftar.");
    }

    let sukses = 0;
    let gagal = 0;

    const progressMsg = await ctx.reply(`📢 Broadcast ke ${userList.length} user... (0/${userList.length})`);

    for (let i = 0; i < userList.length; i++) {
        const userId = userList[i];
        try {
            await ctx.telegram.forwardMessage(userId, ctx.chat.id, replyMsg.message_id);
            sukses++;
            
            // Update progress setiap 10 user
            if ((i + 1) % 10 === 0 || i === userList.length - 1) {
                try {
                    await ctx.telegram.editMessageText(
                        progressMsg.chat.id,
                        progressMsg.message_id,
                        null,
                        `📢 Broadcast ke ${userList.length} user... (${i + 1}/${userList.length})`
                    );
                } catch (e) {
                    // Skip error
                }
            }
        } catch (err) {
            gagal++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Hapus progress message
    try {
        await ctx.telegram.deleteMessage(progressMsg.chat.id, progressMsg.message_id);
    } catch (e) {
        // Skip
    }

    ctx.reply(
        `✅ *Broadcast Selesai!*\n\n` +
        `📊 *Statistik:*\n` +
        `• ✅ Sukses: *${sukses}*\n` +
        `• ❌ Gagal: *${gagal}*\n` +
        `• 👥 Total User: *${userList.length}*`,
        { parse_mode: "Markdown" }
    );
});

// Command: /set
bot.command("set", ctx => {
    const senderId = ctx.from.id;
    const owners = JSON.parse(fs.readFileSync(ownerFile));
    
    if (!owners.includes(senderId)) {
        return ctx.reply("❌ Hanya owner yang bisa set.");
    }

    const args = ctx.message.text.split(" ");
    const index = parseInt(args[1]);
    const text = args.slice(2).join(" ");

    if (isNaN(index) || index < 1 || index > 20) {
        return ctx.reply("❌ Nomor harus 1-20.\nContoh: /set 1 Pesan rahasia");
    }
    
    if (!text) {
        return ctx.reply("❌ Teks tidak boleh kosong.");
    }

    let presets = JSON.parse(fs.readFileSync(presetFile));
    presets[index - 1] = text;
    fs.writeFileSync(presetFile, JSON.stringify(presets, null, 2));

    ctx.reply(`✅ Pesan slot ${index} disimpan:\n\n${text}`);
});

// Command: /del
bot.command("del", ctx => {
    const senderId = ctx.from.id;
    const owners = JSON.parse(fs.readFileSync(ownerFile));
    
    if (!owners.includes(senderId)) {
        return ctx.reply("❌ Hanya owner yang bisa hapus.");
    }

    const args = ctx.message.text.split(" ");
    const index = parseInt(args[1]);

    if (isNaN(index) || index < 1 || index > 20) {
        return ctx.reply("❌ Nomor harus 1-20.\nContoh: /del 1");
    }

    let presets = JSON.parse(fs.readFileSync(presetFile));
    presets[index - 1] = "";
    fs.writeFileSync(presetFile, JSON.stringify(presets, null, 2));

    ctx.reply(`✅ Pesan slot ${index} dihapus.`);
});

// Command: /list
bot.command("list", ctx => {
    const senderId = ctx.from.id;
    const owners = JSON.parse(fs.readFileSync(ownerFile));
    
    if (!owners.includes(senderId)) {
        return ctx.reply("❌ Hanya owner yang bisa melihat daftar.");
    }

    let presets = JSON.parse(fs.readFileSync(presetFile));
    let teks = "📑 *Daftar Pesan Tersimpan:*\n\n";
    
    presets.forEach((p, i) => {
        if (p && p.trim() !== "") {
            teks += `*${i + 1}.* ${p}\n\n`;
        }
    });

    if (teks === "📑 *Daftar Pesan Tersimpan:*\n\n") {
        teks = "❌ Belum ada pesan yang disimpan.";
    }
    
    ctx.reply(teks, { parse_mode: "Markdown" });
});

// Command: /top
bot.command("top", async ctx => {
    const senderId = ctx.from.id;
    const owners = JSON.parse(fs.readFileSync(ownerFile));
    
    if (!owners.includes(senderId)) {
        return ctx.reply("❌ Akses hanya untuk owner.");
    }

    let stats = JSON.parse(fs.readFileSync(groupStatFile));
    if (Object.keys(stats).length === 0) {
        return ctx.reply("❌ Belum ada data statistik.");
    }

    // Ubah ke array dan sort
    let sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
    let teks = "📊 *Top User Penambahan Grup:*\n\n";
    
    let rank = 1;
    for (let [userId, count] of sorted.slice(0, 20)) {
        teks += `${rank}. ID: \`${userId}\` ➜ ${count} grup\n`;
        rank++;
    }

    // Total statistik
    const totalGroups = Object.values(stats).reduce((a, b) => a + b, 0);
    const totalUsers = Object.keys(stats).length;
    
    teks += `\n📈 *Statistik Keseluruhan:*\n`;
    teks += `• 👥 Total User: ${totalUsers}\n`;
    teks += `• 🏷️ Total Grup Ditambahkan: ${totalGroups}\n`;
    teks += `• 📊 Rata-rata per User: ${(totalGroups / totalUsers).toFixed(1)} grup`;

    ctx.reply(teks, { parse_mode: "Markdown" });
});

// Command: /addprem
bot.command("addprem", ctx => {
    const senderId = ctx.from.id;
    const owners = JSON.parse(fs.readFileSync(ownerFile));
    
    if (!owners.includes(senderId)) {
        return ctx.reply("❌ Hanya owner yang bisa menambahkan premium.");
    }

    const args = ctx.message.text.split(" ");
    const targetId = parseInt(args[1]);
    
    if (!targetId) {
        return ctx.reply("❌ Format: /addprem <user_id>\nContoh: /addprem 123456789");
    }

    let data = JSON.parse(fs.readFileSync(premiumFile));
    if (data.includes(targetId)) {
        return ctx.reply("✅ User sudah premium.");
    }

    data.push(targetId);
    fs.writeFileSync(premiumFile, JSON.stringify(data, null, 2));
    ctx.reply(`✅ Berhasil menambahkan ${targetId} ke daftar premium.`);
});

// Command: /delprem
bot.command("delprem", ctx => {
    const senderId = ctx.from.id;
    const owners = JSON.parse(fs.readFileSync(ownerFile));
    
    if (!owners.includes(senderId)) {
        return ctx.reply("❌ Hanya owner yang bisa menghapus premium.");
    }

    const args = ctx.message.text.split(" ");
    const targetId = parseInt(args[1]);
    
    if (!targetId) {
        return ctx.reply("❌ Format: /delprem <user_id>\nContoh: /delprem 123456789");
    }

    let data = JSON.parse(fs.readFileSync(premiumFile));
    if (!data.includes(targetId)) {
        return ctx.reply("❌ ID tersebut tidak ada di daftar premium.");
    }

    data = data.filter(id => id !== targetId);
    fs.writeFileSync(premiumFile, JSON.stringify(data, null, 2));
    ctx.reply(`✅ Berhasil menghapus ${targetId} dari daftar premium.`);
});

// Command: /addowner
bot.command("addowner", ctx => {
    const senderId = ctx.from.id;
    if (!ownerId.includes(senderId)) {
        return ctx.reply("❌ Cuma owner asli yang bisa tambah owner.");
    }
    
    const target = parseInt(ctx.message.text.split(" ")[1]);
    if (!target) {
        return ctx.reply("❌ Format: /addowner <userId>");
    }
    
    const owners = JSON.parse(fs.readFileSync(ownerFile));
    if (owners.includes(target)) {
        return ctx.reply("✅ Sudah owner.");
    }
    
    owners.push(target);
    fs.writeFileSync(ownerFile, JSON.stringify(owners, null, 2));
    ctx.reply(`✅ ${target} ditambahkan sebagai owner.`);
});

// Command: /delowner
bot.command("delowner", ctx => {
    const senderId = ctx.from.id;
    if (!ownerId.includes(senderId)) {
        return ctx.reply("❌ Cuma owner asli yang bisa hapus owner.");
    }
    
    const target = parseInt(ctx.message.text.split(" ")[1]);
    if (!target) {
        return ctx.reply("❌ Format: /delowner <userId>");
    }
    
    let owners = JSON.parse(fs.readFileSync(ownerFile));
    owners = owners.filter(id => id !== target);
    fs.writeFileSync(ownerFile, JSON.stringify(owners, null, 2));
    ctx.reply(`✅ ${target} dihapus dari owner.`);
});

// Command: /blokir
bot.command("blokir", ctx => {
    const senderId = ctx.from.id;
    const owners = JSON.parse(fs.readFileSync(ownerFile));
    
    if (!owners.includes(senderId)) {
        return ctx.reply("❌ Cuma owner yang bisa blokir.");
    }
    
    const target = parseInt(ctx.message.text.split(" ")[1]);
    if (!target) {
        return ctx.reply("❌ Format: /blokir <userId>");
    }
    
    const blacklist = JSON.parse(fs.readFileSync(blacklistFile));
    if (blacklist.includes(target)) {
        return ctx.reply("✅ User sudah diblokir.");
    }
    
    blacklist.push(target);
    fs.writeFileSync(blacklistFile, JSON.stringify(blacklist, null, 2));
    ctx.reply(`✅ ${target} berhasil diblokir.`);
});

// Command: /unblokir
bot.command("unblokir", ctx => {
    const senderId = ctx.from.id;
    const owners = JSON.parse(fs.readFileSync(ownerFile));
    
    if (!owners.includes(senderId)) {
        return ctx.reply("❌ Cuma owner yang bisa unblokir.");
    }
    
    const target = parseInt(ctx.message.text.split(" ")[1]);
    if (!target) {
        return ctx.reply("❌ Format: /unblokir <userId>");
    }
    
    let blacklist = JSON.parse(fs.readFileSync(blacklistFile));
    if (!blacklist.includes(target)) {
        return ctx.reply("✅ User tidak ada dalam blacklist.");
    }
    
    blacklist = blacklist.filter(id => id !== target);
    fs.writeFileSync(blacklistFile, JSON.stringify(blacklist, null, 2));
    ctx.reply(`✅ ${target} berhasil diunblokir.`);
});

// Command: /auto
bot.command("auto", async (ctx) => {
    const owners = JSON.parse(fs.readFileSync(ownerFile));
    if (!owners.includes(ctx.from.id)) {
        return ctx.reply("❌ Hanya owner yang bisa pakai perintah ini.");
    }

    const args = ctx.message.text.slice(6).trim();
    const onOff = args.split(" ")[0];
    const text = args.slice(onOff.length).trim();

    const cfg = JSON.parse(fs.readFileSync(autoKirimFile));

    // OFF
    if (onOff === "off") {
        if (!cfg.status) {
            return ctx.reply("ℹ️ Auto-kirim sudah mati.");
        }
        
        clearInterval(autoKirimInterval);
        autoKirimInterval = null;
        cfg.status = false;
        fs.writeFileSync(autoKirimFile, JSON.stringify(cfg, null, 2));
        return ctx.reply("✅ Auto-kirim dimatikan.");
    }

    // ON
    if (onOff === "on") {
        if (!text) {
            return ctx.reply("❌ Format: /auto on <teks>\nContoh: /auto on Promo baru nih!");
        }
        
        if (cfg.status) {
            return ctx.reply("ℹ️ Auto-kirim sudah aktif. /auto off dulu kalau mau ganti teks.");
        }

        cfg.status = true;
        cfg.text = text;
        fs.writeFileSync(autoKirimFile, JSON.stringify(cfg, null, 2));

        const kirim = async () => {
            const groups = JSON.parse(fs.readFileSync(groupFile));
            let sukses = 0;
            let gagal = 0;

            for (const g of groups) {
                try {
                    await ctx.telegram.sendMessage(g, text);
                    sukses++;
                } catch (err) {
                    gagal++;
                }
                await new Promise(r => setTimeout(r, 1000));
            }
            
            console.log(`[AutoKirim] Sukses: ${sukses}, Gagal: ${gagal}`);
        };

        // Kirim sekali langsung
        await kirim();
        ctx.reply(
            `✅ Auto-kirim AKTIF (1 jam sekali)\n\n` +
            `📝 Pesan:\n${text}\n\n` +
            `⏰ Akan dikirim otomatis setiap 1 jam.`
        );

        // Set interval 1 jam
        autoKirimInterval = setInterval(kirim, 60 * 60 * 1000);
        return;
    }

    ctx.reply("❌ Format:\n/auto on <teks>\n/auto off");
});

// Command: /backup
bot.command("backup", async (ctx) => {
    const owners = JSON.parse(fs.readFileSync(ownerFile));
    if (!owners.includes(ctx.from.id)) {
        return ctx.reply("❌ Hanya owner yang bisa ambil backup.");
    }

    await ctx.reply("📦 Membuat backup database...");

    const files = [
        "./database/grub.json",
        "./database/groupstats.json",
        "./database/users.json",
        "./database/premium.json",
        "./database/owner.json",
        "./database/blacklist.json",
        "./database/preset.json",
        "./database/autoshare.json",
        "./database/autokirim.json"
    ];

    let sentCount = 0;
    for (const file of files) {
        try {
            if (fs.existsSync(file)) {
                await ctx.telegram.sendDocument(ctx.from.id, { source: file });
                sentCount++;
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (e) {
            console.error(`❌ Gagal kirim ${file}:`, e.message);
        }
    }

    ctx.reply(`✅ Backup selesai! ${sentCount} file telah dikirim.`);
});

// Handler untuk bot ditambahkan ke grup
bot.on("new_chat_members", async (ctx) => {
    const botId = (await ctx.telegram.getMe()).id;
    const newMembers = ctx.message.new_chat_members;

    const isBotAdded = newMembers.some(member => member.id === botId);
    if (!isBotAdded) return;

    const groupId = ctx.chat.id;
    const groupName = ctx.chat.title || "Tanpa Nama";
    const adder = ctx.message.from;
    const adderId = adder.id;
    const username = adder.username ? `@${adder.username}` : "(tanpa username)";

    // Tambahkan ke grub.json jika belum ada
    let groups = JSON.parse(fs.readFileSync(groupFile));
    if (!groups.includes(groupId)) {
        groups.push(groupId);
        fs.writeFileSync(groupFile, JSON.stringify(groups, null, 2));
    }

    // Hitung jumlah grup yang ditambahkan oleh user
    let stats = JSON.parse(fs.readFileSync(groupStatFile));
    stats[adderId] = (stats[adderId] || 0) + 1;
    fs.writeFileSync(groupStatFile, JSON.stringify(stats, null, 2));

    const totalUserAdded = stats[adderId];

    // Tambahkan ke premium jika pertama kali (grup ke-2)
    let premiumUsers = JSON.parse(fs.readFileSync(premiumFile));
    if (totalUserAdded === 2 && !premiumUsers.includes(adderId)) {
        premiumUsers.push(adderId);
        fs.writeFileSync(premiumFile, JSON.stringify(premiumUsers, null, 2));
        
        // Kirim notifikasi ke user
        try {
            await ctx.telegram.sendMessage(adderId,
                `🎉 *Selamat!*\n\n` +
                `Anda telah mendapatkan akses premium!\n` +
                `Sekarang Anda bisa menggunakan fitur /share\n\n` +
                `Terima kasih telah menambahkan bot ke ${totalUserAdded} grup.`,
                { parse_mode: "Markdown" }
            );
        } catch (e) {
            // Skip jika tidak bisa kirim DM
        }
    }

    // Kirim notifikasi ke owner
    if (totalUserAdded >= 2) {
        for (const owner of owners) {
            try {
                await ctx.telegram.sendMessage(owner,
                    `➕ *Bot Ditambahkan ke Grup Baru!*\n\n` +
                    `👤 Oleh: ${username}\n` +
                    `🆔 ID: \`${adderId}\`\n` +
                    `🏷️ Nama Grup: ${groupName}\n` +
                    `🔢 Total Grup oleh User: ${totalUserAdded}\n` +
                    `📦 Total Grup Bot: ${groups.length}`,
                    { parse_mode: "Markdown" }
                );
            } catch (e) {
                console.error("Error sending notification to owner:", e.message);
            }
        }
    }
});

// Start bot
bot.launch().then(() => {
    console.log("🤖 Bot Jasseb Resming berhasil dijalankan!");
    console.log("👤 Developer: FATHIR STHORE");
    console.log("📞 Telegram: @fathirsthore");
    
    // Auto backup setiap 1 jam
    setInterval(() => {
        kirimBackup();
    }, 60 * 60 * 1000);
}).catch((err) => {
    console.error("❌ Gagal menjalankan bot:", err);
});

// Handle proses shutdown dengan baik
process.once('SIGINT', () => {
    console.log("\n🛑 Bot dihentikan (SIGINT)");
    bot.stop('SIGINT');
    process.exit(0);
});

process.once('SIGTERM', () => {
    console.log("\n🛑 Bot dihentikan (SIGTERM)");
    bot.stop('SIGTERM');
    process.exit(0);
});
