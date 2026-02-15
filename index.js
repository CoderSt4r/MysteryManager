const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    EmbedBuilder
} = require("discord.js");

require("dotenv").config();

const prefix = "./";

const warns = new Map();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function embed(title, color, desc, mod) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(desc)
        .setColor(color)
        .setFooter({ text: `Moderator: ${mod.tag}` })
        .setTimestamp();
}

function parseTime(input) {

    if (!input) return null;

    const num = parseInt(input.slice(0, -1));
    const unit = input.slice(-1);

    if (isNaN(num)) return null;

    if (unit === "s") return num * 1000;
    if (unit === "m") return num * 60 * 1000;
    if (unit === "h") return num * 60 * 60 * 1000;
    if (unit === "d") return num * 24 * 60 * 60 * 1000;

    return null;
}

client.on("clientReady", () => {
    console.log(`✅ Mystery Manager ready as ${client.user.tag}`);
});

client.on("messageCreate", async message => {

    try {

        if (message.author.bot) return;
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();

        if (!command) return;

        // -----------------------
        // PING (everyone can use)
        // -----------------------
        if (command === "ping") {

            const msg = await message.channel.send("📡 Leaking your address in 5...");

            await wait(1000);
            await msg.edit("📡 Leaking your address in 4...");

            await wait(1000);
            await msg.edit("📡 Leaking your address in 3...");

            await wait(1000);
            await msg.edit("📡 Leaking your address in 2...");

            await wait(1000);
            await msg.edit("📡 Leaking your address in 1...");

            await wait(1500);

            const steps = [
                "🌐 1",
                "🌐 19",
                "🌐 192",
                "🌐 192.",
                "🌐 192.168",
                "🌐 192.168.",
                "🌐 192.168.0",
                "🌐 192.168.0.",
                "🌐 192.168.0.1"
            ];

            for (const step of steps) {

                await wait(500);
                await msg.edit(step);

            }

            await wait(1500);

            await msg.edit("Just joking, you are my good boy now :3");

            return;
        }

        // -----------------------
        // ADMIN CHECK
        // -----------------------
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ Admin only command.");
        }

        // -----------------------
        // BAN
        // -----------------------
        if (command === "ban") {

            const member = message.mentions.members.first();

            if (!member)
                return message.reply("Usage: ./ban @user reason");

            const reason = args.slice(1).join(" ") || "No reason";

            await member.ban({ reason });

            message.channel.send({
                embeds: [
                    embed(
                        "🔨 USER BANNED",
                        "#ff0000",
                        `User: ${member.user.tag}\nReason: ${reason}`,
                        message.author
                    )
                ]
            });

            return;
        }

        // -----------------------
        // KICK
        // -----------------------
        if (command === "kick") {

            const member = message.mentions.members.first();

            if (!member)
                return message.reply("Usage: ./kick @user reason");

            const reason = args.slice(1).join(" ") || "No reason";

            await member.kick(reason);

            message.channel.send({
                embeds: [
                    embed(
                        "👢 USER KICKED",
                        "#ffaa00",
                        `User: ${member.user.tag}\nReason: ${reason}`,
                        message.author
                    )
                ]
            });

            return;
        }

        // -----------------------
        // TIMEOUT
        // -----------------------
        if (command === "timeout") {

            const member = message.mentions.members.first();

            if (!member)
                return message.reply("Usage: ./timeout @user 1m reason");

            const timeArg = args[1];
            const ms = parseTime(timeArg);

            if (!ms)
                return message.reply("Usage: ./timeout @user 1m reason");

            const reason = args.slice(2).join(" ") || "No reason";

            await member.timeout(ms, reason);

            message.channel.send({
                embeds: [
                    embed(
                        "⏱ USER TIMED OUT",
                        "#00aaff",
                        `User: ${member.user.tag}\nTime: ${timeArg}\nReason: ${reason}`,
                        message.author
                    )
                ]
            });

            return;
        }

        // -----------------------
        // UNTIMEOUT
        // -----------------------
        if (command === "untimeout") {

            const member = message.mentions.members.first();

            if (!member)
                return message.reply("Usage: ./untimeout @user");

            await member.timeout(null);

            message.channel.send({
                embeds: [
                    embed(
                        "✅ TIMEOUT REMOVED",
                        "#00ff00",
                        `User: ${member.user.tag}`,
                        message.author
                    )
                ]
            });

            return;
        }

        // -----------------------
        // WARN
        // -----------------------
        if (command === "warn") {

            const member = message.mentions.members.first();

            if (!member)
                return message.reply("Usage: ./warn @user reason");

            const reason = args.slice(1).join(" ") || "No reason";

            const id = member.id;

            warns.set(id, (warns.get(id) || 0) + 1);

            message.channel.send({
                embeds: [
                    embed(
                        "⚠️ USER WARNED",
                        "#ffff00",
                        `User: ${member.user.tag}\nWarns: ${warns.get(id)}\nReason: ${reason}`,
                        message.author
                    )
                ]
            });

            return;
        }

        // -----------------------
        // WARNINGS
        // -----------------------
        if (command === "warnings") {

            const member = message.mentions.members.first();

            if (!member)
                return message.reply("Usage: ./warnings @user");

            const count = warns.get(member.id) || 0;

            message.channel.send({
                embeds: [
                    embed(
                        "📋 WARNINGS",
                        "#ffff00",
                        `User: ${member.user.tag}\nWarns: ${count}`,
                        message.author
                    )
                ]
            });

            return;
        }

        // -----------------------
        // CLEAR
        // -----------------------
        if (command === "clear") {

            const amount = parseInt(args[0]);

            if (!amount)
                return message.reply("Usage: ./clear 10");

            await message.channel.bulkDelete(amount, true);

            message.channel.send({
                embeds: [
                    embed(
                        "🧹 MESSAGES CLEARED",
                        "#0099ff",
                        `Amount: ${amount}`,
                        message.author
                    )
                ]
            });

            return;
        }

    } catch (err) {

        console.error(err);

        message.reply("❌ Command failed. Check bot permissions and role position.");

    }

});

client.login(process.env.TOKEN);
