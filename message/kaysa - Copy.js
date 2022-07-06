"use strict";
const { downloadContentFromMessage } = require("@adiwajshing/baileys")
const fs = require ("fs");
const cheerio = require("cheerio")
const moment = require("moment-timezone");
const Dym = require("didyoumean");
const util = require("util");
const imageToBase64 = require('image-to-base64');
const { exec, spawn } = require("child_process");
const ffmpeg = require("fluent-ffmpeg");
const axios = require("axios");
const speed = require("performance-now");
const translate = require("@vitalets/google-translate-api");
const request = require("request");
const FormData = require("form-data");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const path = require('path');
const ms = require("parse-ms");
const toMS = require("ms");
const nou = require("node-os-utils");
let { sizeFormatter } = require("human-readable");
let format = sizeFormatter({
  std: "JEDEC", // 'SI' (default) | 'IEC' | 'JEDEC'
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
});

// Exif
const Exif = require("../lib/exif")
const exif = new Exif()

// Lib
const afk = require("../lib/afk");
const { color, bgcolor } = require('../lib/color')
const { getBuffer, fetchJson, fetchText, getRandom, getGroupAdmins, runtime, sleep, generateProfilePicture, reSize, makeid, removeEmojis, calculate_age} = require("../lib/myfunc");
const { webp2mp4File } = require("../lib/convert")
const { isSetWelcome, addSetWelcome, changeSetWelcome, removeSetWelcome } = require('../lib/setwelcome');
const { isSetLeft, addSetLeft, removeSetLeft, changeSetLeft } = require('../lib/setleft');
const { addResponList, delResponList, isAlreadyResponList, isAlreadyResponListGroup, sendResponList, updateResponList, getDataResponList } = require('../lib/respon-list');
const { addRespons, checkRespons, deleteRespons } = require('../lib/respon');
const { isSetProses, addSetProses, removeSetProses, changeSetProses, getTextSetProses } = require('../lib/setproses');
const { isSetDone, addSetDone, removeSetDone, changeSetDone, getTextSetDone } = require('../lib/setdone');
const { isSetOpen, addSetOpen, removeSetOpen, changeSetOpen, getTextSetOpen } = require("../lib/setopen");
const { isSetClose, addSetClose, removeSetClose, changeSetClose, getTextSetClose } = require("../lib/setclose");
const msgFilter = require("../lib/antispam");

// Database
let pendaftar = JSON.parse(fs.readFileSync('./database/user.json'))
let mess = JSON.parse(fs.readFileSync('./message/mess.json'));
let antilink = JSON.parse(fs.readFileSync('./database/antilink.json'));
let antiwame = JSON.parse(fs.readFileSync('./database/antiwame.json'));
let listCmd = JSON.parse(fs.readFileSync('./database/listcmd.json'));
let _cmd = JSON.parse(fs.readFileSync('./database/command.json'));
let _cmdUser = JSON.parse(fs.readFileSync('./database/commandUser.json'));
let responDB = JSON.parse(fs.readFileSync('./database/respon.json'));
let listStore = JSON.parse(fs.readFileSync('./database/list-message.json'));
let mute = JSON.parse(fs.readFileSync('./database/mute.json'));


// Apikeys
let apikeys = 'keyapi'

// Bandwidth
async function checkBandwidth() {
    let ind = 0;
    let out = 0;
    for (let i of await require("node-os-utils").netstat.stats()) {
        ind += parseInt(i.inputBytes);
        out += parseInt(i.outputBytes);
    }
    return {
        download: format(ind),
        upload: format(out),
    };
}

moment.tz.setDefault("Asia/Jakarta").locale("id");

module.exports = async(fadly, msg, m, setting, store, welcome, left, set_welcome_db, set_left_db, db_respon_list, opengc, _afk, set_proses, set_done, set_open, set_close) => {
    try {
        let { ownerNumber, ownerName, botName, footer, lolkey, instagram, sticker: stc } = setting
        let { allMenu, donate } = require('./help')
        let footxt = `${footer} © 2022`
        let thumb = await reSize(fs.readFileSync(setting.pathimg), 200, 200, [])
        const { type, quotedMsg, now, fromMe, mentioned } = msg
        if (msg.isBaileys) return
        const tanggal = moment().tz("Asia/Jakarta").format("dddd, ll")
        const jam = moment().format("HH:mm:ss z")
        let dt = moment(Date.now()).tz('Asia/Jakarta').locale('id').format('a')
        var fildt = dt == 'pagi' ? dt + '🌝' : dt == 'siang' ? dt + '🌞' : dt == 'sore' ? dt + '🌝' : dt + '🌚'
        const ucapanWaktu = fildt.charAt(0).toUpperCase() + fildt.slice(1)
        const content = JSON.stringify(msg.message)
        const from = msg.key.remoteJid
        const chats = (type === 'conversation' && msg.message.conversation) ? msg.message.conversation : (type == 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type == 'documentMessage') && msg.message.documentMessage.caption ? msg.message.documentMessage.caption : (type == 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : (type == 'extendedTextMessage') && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text : (type == 'buttonsResponseMessage' && msg.message.buttonsResponseMessage.selectedButtonId) ? msg.message.buttonsResponseMessage.selectedButtonId : (type == 'templateButtonReplyMessage') && msg.message.templateButtonReplyMessage.selectedId ? msg.message.templateButtonReplyMessage.selectedId : (type == "listResponseMessage") ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : (type == "messageContextInfo") ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : ''
        const toJSON = j => JSON.stringify(j, null,'\t')
        if (fadly.multi) {
        	var prefix = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/.test(chats) ? chats.match(/^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/gi) : '#'
        } else {
        	if (fadly.nopref) {
                prefix = ''
        	} else {
                prefix = fadly.prefa
        	}
        }
        const args = chats.split(' ')
        const command = chats.toLowerCase().split(' ')[0] || ''
        const isCmd = command.startsWith(prefix)
        const isGroup = msg.key.remoteJid.endsWith('@g.us')
        const sender = isGroup ? (msg.key.participant ? msg.key.participant : msg.participant) : msg.key.remoteJid
        const isOwner = ownerNumber.includes(sender)
        const pushname = msg.pushName
        const q = chats.slice(command.length + 1, chats.length)
        const body = chats.startsWith(prefix) ? chats : ''
        const botNumber = fadly.user.id.split(':')[0] + '@s.whatsapp.net'
        const groupMetadata = isGroup ? await fadly.groupMetadata(from) : ''
        const groupName = isGroup ? groupMetadata.subject : ''
        const groupId = isGroup ? groupMetadata.id : ''
        const groupMembers = isGroup ? groupMetadata.participants : ''
        const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
        const isGroupAdmins = groupAdmins.includes(sender)
        const isUser = pendaftar.includes(sender)
        const isAfkOn = afk.checkAfkUser(sender, _afk)
        const isAntiLink = antilink.includes(from) ? true : false
        const isAntiWame = antiwame.includes(from) ? true : false
        const isWelcome = isGroup ? welcome.includes(from) ? true : false : false
        const isLeft = isGroup ? left.includes(from) ? true : false : false
        const isMuted = isGroup ? mute.includes(from) ? true : false : false

        let timestamp = speed();
        let latensi = speed() - timestamp

        let wangsaf = "0@s.whatsapp.net"

        const mentionByTag = type == "extendedTextMessage" && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.mentionedJid : []
        const mentionByReply = type == "extendedTextMessage" && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.participant || "" : ""
        const mention = typeof(mentionByTag) == 'string' ? [mentionByTag] : mentionByTag
        mention != undefined ? mention.push(mentionByReply) : []
        const mentionUser = mention != undefined ? mention.filter(n => n) : []
        
        async function downloadAndSaveMediaMessage (type_file, path_file) {
        	if (type_file === 'image') {
                var stream = await downloadContentFromMessage(msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage, 'image')
                let buffer = Buffer.from([])
                for await(const chunk of stream) {
                	buffer = Buffer.concat([buffer, chunk])
                }
                fs.writeFileSync(path_file, buffer)
                return path_file
        	} else if (type_file === 'video') {
                var stream = await downloadContentFromMessage(msg.message.videoMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.videoMessage, 'video')
                let buffer = Buffer.from([])
                for await(const chunk of stream) {
                	buffer = Buffer.concat([buffer, chunk])
                }
                fs.writeFileSync(path_file, buffer)
                return path_file
        	} else if (type_file === 'sticker') {
                var stream = await downloadContentFromMessage(msg.message.stickerMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.stickerMessage, 'sticker')
                let buffer = Buffer.from([])
                for await(const chunk of stream) {
                	buffer = Buffer.concat([buffer, chunk])
                }
                fs.writeFileSync(path_file, buffer)
                return path_file
        	} else if (type_file === 'audio') {
                var stream = await downloadContentFromMessage(msg.message.audioMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.audioMessage, 'audio')
                let buffer = Buffer.from([])
                for await(const chunk of stream) {
                	buffer = Buffer.concat([buffer, chunk])
                }
                fs.writeFileSync(path_file, buffer)
                return path_file
        	}
        }
        const sendFileFromUrl = async (from, url, caption, options = {}) => {
            let mime = '';
            let res = await axios.head(url)
            mime = res.headerd["content-type"]
            let type = mime.split("/")[0]+"Message"
            if (mime.split("/")[0] === "image") {
               var img = await getBuffer(url)
               return fadly.sendMessage(from, { image: img, caption: caption }, options)
            } else if (mime.split("/")[0] === "video") {
               var vid = await getBuffer(url)
               return fadly.sendMessage(from, { video: vid, caption: caption }, options)
            } else if (mime.split("/")[0] === "audio") {
               var aud = await getBuffer(url)
               return fadly.sendMessage(from, { audio: aud, mimetype: 'audio/mp3' }, options)
            } else {
               var doc = await getBuffer(url)
               return fadly.sendMessage(from, { document: doc, mimetype: mime, caption: caption }, options)
            }
        }
        async function sendPlay(from, query) {
            var url = await yts(query)
            url = url.videos[0].url
            hxz.youtube(url).then(async(data) => {
                var button = [{ urlButton: { displayText: `Source Code`, url: `${url}` } }, { quickReplyButton: { displayText: `🎵 Audio`, id: `${prefix}ytmp3 ${url}` } }, { quickReplyButton: { displayText: `🎥 Video`, id: `${prefix}ytmp4 ${url}` } }]
                // var button = [{ buttonId: `!ytmp3 ${url}`, buttonText: { displayText: `🎵 Audio (${data.size_mp3})` }, type: 1 }, { buttonId: `!ytmp4 ${url}`, buttonText: { displayText: `🎥 Video (${data.size})` }, type: 1 }]
                fadly.sendMessage(from, { caption: `*YOUTUBE-DOWNLOADER 📂*\n\n📃 *Title :* ${data.title ? data.title : '-'}\n📸 *Quality :* ${data.quality}\n\n_Silahkan Pilih Format yang ada dibawah_`, image: { url: data.thumb }, templateButtons: button, footer: 'Pilih Salah Satu Button Dibawah⬇️', mentions: [sender] })
           }).catch((e) => {
               fadly.sendMessage(from, { text: mess.error.api }, { quoted: msg })
               ownerNumber.map( i => fadly.sendMessage(from, { text: `Send Play Error : ${e}` }))
           })
        }
        function hitungmundur(bulan, tanggal) {
            let from = new Date(`${bulan} ${tanggal}, 2022 00:00:00`).getTime();
            let now = Date.now();
            let distance = from - now;
            let days = Math.floor(distance / (1000 * 60 * 60 * 24));
            let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);
            return days + "Hari " + hours + "Jam " + minutes + "Menit " + seconds + "Detik"
        }
        const isUrl = (url) => {
        	return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
        }
        function jsonformat(string) {
            return JSON.stringify(string, null, 2)
        }
        function monospace(string) {
            return '```' + string + '```'
        }
        function randomNomor(min, max = null) {
            if (max !== null) {
        	    min = Math.ceil(min);
        	    max = Math.floor(max);
        	    return Math.floor(Math.random() * (max - min + 1)) + min;
            } else {
        	    return Math.floor(Math.random() * min) + 1
            }
        }
        const pickRandom = (arr) => {
        	return arr[Math.floor(Math.random() * arr.length)]
        }
        function mentions(teks, mems = [], id) {
        	if (id == null || id == undefined || id == false) {
        	    let res = fadly.sendMessage(from, { text: teks, mentions: mems })
        	    return res
        	} else {
                let res = fadly.sendMessage(from, { text: teks, mentions: mems }, { quoted: msg })
                return res
            }
        }
        const nebal = (angka) => {
            return Math.floor(angka)
        }
        function parseMention(text = '') {
            return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
        }
        const reply = (teks) => {
        	return fadly.sendMessage(from, { text: teks, mentions: parseMention(teks) }, { quoted: msg })
        }
        const fakeDeface = (from, teks, title, description, img, option = {}) => {
            if (!isUrl(teks)) return 'teks harus mengandung url'
            return fadly.sendMessage(from, {
                text: teks,
                title,
                matchedText: isUrl(teks)[0],
                canonicalUrl: isUrl(teks)[0],
                description,
                detectLinks: false,
                jpegThumbnail: img
            }, option)
        }
        const replyDeface = (teks) => {
            return fadly.sendMessage(from, {
                text: teks, contextInfo: {
                    externalAdReply: {
                        title: `© ${botName}`,
                        body: `Simple Bot WhatsApp By ${ownerName}`,
                        mediaType: 2,
                        thumbnail: thumb,
                        sourceUrl: `https://chat.whatsapp.com/DnugARE8pbdICIMFRBPivc`
                    }
                }
            }, { quoted: msg })
        }
        const replyDeface2 = (teks) => {
            return fadly.sendMessage(from, {
                text: teks,
                mentions: parseMention(teks),
                contextInfo: {
                    externalAdReply: {
                        title: `© ${botName}`,
                        body: `Simple Bot WhatsApp By ${ownerName}`,
                        thumbnail: thumb,
                        mediaType:1,
                        mediaUrl: 'https://chat.whatsapp.com/GtxWnk2n2ryCiwYFWScOk5',
                        sourceUrl: 'https://chat.whatsapp.com/GtxWnk2n2ryCiwYFWScOk5'
                    }
                }
            }, { quoted:msg })
        }
        const textImg = (teks) => {
        	return fadly.sendMessage(from, { text: teks, jpegThumbnail: fs.readFileSync(setting.pathimg), mentions: parseMention(teks) }, { quoted: msg })
        }
        const sendMess = (hehe, teks) => {
        	fadly.sendMessage(hehe, { text, teks })
        }
        const buttonWithText = (from, text, footer, buttons) => {
        	return fadly.sendMessage(from, { text: text, footer: footer, templateButtons: buttons })
        }
        const sendContact = (jid, numbers, name, quoted, mn) => {
        	let number = numbers.replace(/[^0-9]/g, '')
        	const vcard = 'BEGIN:VCARD\n' 
        	+ 'VERSION:3.0\n' 
        	+ 'FN:' + name + '\n'
        	+ 'ORG:;\n'
        	+ 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n'
        	+ 'END:VCARD'
        	return fadly.sendMessage(from, { contacts: { displayName: name, contacts: [{ vcard }] }, mentions : mn ? mn : []},{ quoted: quoted })
        }
        const getCase = (cases) => {
            return "case prefix+"+`'${cases}'`+fs.readFileSync(__filename).toString().split('case prefix+\''+cases+'\'')[1].split("break")[0]+"break"
        }

        async function getGcName(groupID) {
            try {
                let data_name = await fadly.groupMetadata(groupID)
                return data_name.subject
            } catch (err) {
                return '-'
            }
        }

        async function sendStickerFromUrl(from, url, packname1 = stc.packname, author1 = stc.author, options = {}) {
        	var names = Date.now() / 10000;
        	var download = function (uri, filename, callback) {
                request.head(uri, function (err, res, body) {
                    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
	            });
        	};
            exif.create(packname1, author1, `sendstc_${names}`)
        	download(url, './sticker/' + names + '.png', async function () {
                let filess = './sticker/' + names + '.png'
        	    let asw = './sticker/' + names + '.webp'
        	    exec(`ffmpeg -i ${filess} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${asw}`, async (err) => {
        	        exec(`webpmux -set exif ./sticker/sendstc_${names}.exif ${asw} -o ${asw}`, async (error) => {
                        fadly.sendMessage(from, { sticker: fs.readFileSync(asw) }, options)
                        fs.unlinkSync(filess)
                        fs.unlinkSync(asw)
        	        })
                })
        	})
        }

        const buttonsDefault = [
        	{ urlButton: { displayText: `Instagram`, url: `${instagram}` } },
        	{ quickReplyButton: { displayText: `📓 Information`, id: `${prefix}infobot` } },
        	{ quickReplyButton: { displayText: `💰 Donate`, id: `${prefix}donate` } },
            { quickReplyButton: { displayText: `🌎️ Dashboard`, id: `${prefix}dashboard` } }
        ]

        // Anti Link
        if (isGroup && isAntiLink && !isOwner && !isGroupAdmins && isBotGroupAdmins){
            if (chats.match(/(https:\/\/chat.whatsapp.com)/gi)) {
                if (!isBotGroupAdmins) return reply(`Untung bot bukan admin`)
                reply(`*「 GROUP LINK DETECTOR 」*\n\nSepertinya kamu mengirimkan link grup, maaf kamu akan di kick`)
                fadly.groupParticipantsUpdate(from, [sender], "remove")
            }
        }

        // Anti Wame
        if (isGroup && isAntiWame && !isOwner && !isGroupAdmins && isBotGroupAdmins){
            if (chats.match(/(https:\/\/wa.me)/gi)) {
                if (!isBotGroupAdmins) return reply(`Untung bot bukan admin`)
                reply(`*「 NOMOR LINK DETECTOR 」*\n\nSepertinya kamu mengirimkan link wa.me, maaf kamu akan di kick`)
                fadly.groupParticipantsUpdate(from, [sender], "remove")
            }
        }

	    async function addCountCmdUser(nama, sender, u) {
            var posi = null
            var pos = null
            Object.keys(u).forEach((i) => {
                if (u[i].jid === sender) {
                    posi = i
                }
            })
            if (posi === null) {
                u.push({jid: sender, db: [{nama: nama, count: 0}]})
                fs.writeFileSync('./database/commandUser.json', JSON.stringify(u, null, 2));
                Object.keys(u).forEach((i) => {
                    if (u[i].jid === sender) {
                        posi = i
                    }
                })
            }
            if (posi !== null) {
                Object.keys(u[posi].db).forEach((i) => {
                    if (u[posi].db[i].nama === nama) {
                        pos = i
                    }
                })
                if (pos === null) {
                    u[posi].db.push({nama: nama, count: 1})
                    fs.writeFileSync('./database/commandUser.json', JSON.stringify(u, null, 2));
                } else {
                    u[posi].db[pos].count += 1
                    fs.writeFileSync('./database/commandUser.json', JSON.stringify(u, null, 2));
                }
            }
        }

        async function getPosiCmdUser(sender, _db) {
            var posi = null
            Object.keys(_db).forEach((i) => {
                if (_db[i].jid === sender) {
                    posi = i
                }
            })
            return posi
        }

        async function addCountCmd(nama, sender, _db) {
            addCountCmdUser(nama, sender, _cmdUser)
            var posi = null
            Object.keys(_db).forEach((i) => {
                if (_db[i].nama === nama) {
                   posi = i
                }
            })
            if (posi === null) {
                _db.push({nama: nama, count: 1})
                fs.writeFileSync('./database/command.json',JSON.stringify(_db, null, 2));
            } else {
                _db[posi].count += 1
                fs.writeFileSync('./database/command.json',JSON.stringify(_db, null, 2));
            }
        }

        // Store
        if (!isCmd && isGroup && isAlreadyResponList(from, chats, db_respon_list)) {
            var get_data_respon = getDataResponList(from, chats, db_respon_list)
            if (get_data_respon.isImage === false) {
                fadly.sendMessage(from, { text: sendResponList(from, chats, db_respon_list) }, {
                    quoted: msg
                })
            } else {
                fadly.sendMessage(from, { image: await getBuffer(get_data_respon.image_url), caption: get_data_respon.response }, {
                    quoted: msg
                })
            }
        }

        const isImage = (type == 'imageMessage')
        const isVideo = (type == 'videoMessage')
        const isSticker = (type == 'stickerMessage')
        const isQuotedMsg = msg.isQuotedMsg
        const isQuotedImage = isQuotedMsg ? content.includes('imageMessage') ? true : false : false
        const isQuotedAudio = isQuotedMsg ? content.includes('audioMessage') ? true : false : false
        const isQuotedDocument = isQuotedMsg ? content.includes('documentMessage') ? true : false : false
        const isQuotedVideo = isQuotedMsg ? content.includes('videoMessage') ? true : false : false
        const isQuotedSticker = isQuotedMsg ? content.includes('stickerMessage') ? true : false : false

        // Auto Read & Presence Online
        fadly.sendReadReceipt(from, sender, [msg.key.id])
        fadly.sendPresenceUpdate('available', from)

        // Auto Registrasi
        if (isCmd && !isUser) {
            pendaftar.push(sender)
            fs.writeFileSync('./database/user.json', JSON.stringify(pendaftar, null, 2))
        }

        // Auto Block +212
        if (sender.startsWith('212')) {
            return fadly.updateBlockStatus(sender, 'block')
        }

        // Mode
        if (fadly.mode === 'self'){
            if (!isOwner && !fromMe) return
        }

        // Antispam
        msgFilter.ResetSpam(fadly.spam)

		const spampm = () => {
            console.log(color('[ SPAM ]', 'red'), color(moment(msg.messageTimestamp * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`))
            msgFilter.addSpam(sender, fadly.spam)
            reply(`Kamu terdeteksi spam bot tanpa jeda, lakukan perintah setelah 5 detik`)
        }
        const spamgr = () => {
            console.log(color('[ SPAM ]', 'red'), color(moment(msg.messageTimestamp * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(groupName))
            msgFilter.addSpam(sender, fadly.spam)
            reply(`Kamu terdeteksi spam bot tanpa jeda, lakukan perintah setelah 5 detik`)
        }

        if (isCmd && msgFilter.isFiltered(sender) && !isGroup) return spampm()
        if (isCmd && msgFilter.isFiltered(sender) && isGroup) return spamgr()
        if (isCmd && args[0].length > 1 && !isOwner) msgFilter.addFilter(sender)

		if (chats.startsWith("x ") && isOwner) {
            console.log(color('[ EVAL ]'), color(moment(msg.messageTimestamp * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`Dari Owner aowkoakwoak`))
            const ev = (sul) => {
                var sat = JSON.stringify(sul, null, 2)
                var bang = util.format(sat)
                if (sat == undefined) {
                    bang = util.format(sul)
                }
                return reply(bang)
            }
            try {
                reply(util.format(eval(`;(async () => { ${chats.slice(2)} })()`)))
            } catch (e) {
                reply(util.format(e))
            }
		} else if (chats.startsWith("$ ") && isOwner) {
            console.log(color('[ EXEC ]'), color(moment(msg.messageTimestamp * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`Dari Owner aowkoakwoak`))
            exec(chats.slice(2), (err, stdout) => {
                if (err) return reply(`${err}`)
                if (stdout) reply(`${stdout}`)
            })
        } else if (chats.startsWith("> ") && isOwner) {
	        console.log(color('[ EVAL ]'), color(moment(msg.messageTimestamp * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`Dari Owner aowkaokwoak`))
        try {
            let evaled = await eval(chats.slice(2))
            if (typeof evaled !== 'string') evaled = require("util").inspect(evaled)
            reply(`${evaled}`)
        } catch (err) {
            reply(`${err}`)
        }
        }

		// Logs
		if (!isGroup && isCmd && !fromMe) {
		    console.log(color('[ CMD ]'), color(moment(msg.messageTimestamp * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
		}
		if (isGroup && isCmd && !fromMe) {
		    console.log(color('[ CMD ]'), color(moment(msg.messageTimestamp * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(groupName))
		}
        function triggerSticker() {
            try {
                for (let x = 0; x < responDB.length; x++) {
                    if (msg.message.stickerMessage.fileSha256.toString('hex') == responDB[x].hex) {
                        return responDB[x].balasan;
                    }
                }
            } catch {
                return false;
            }
        }
        switch (command || triggerSticker()) {
        case prefix+'menu': case prefix+'help':
            addCountCmd('#menu', sender, _cmd)
            let mundur = hitungmundur(7, 9)
            var { download, upload } = await checkBandwidth();
            fadly.sendMessage(from, { caption: allMenu(ucapanWaktu, pushname, mundur, upload, download, ownerName, botName, jam, tanggal, runtime, isOwner, sender, prefix), location: { jpegThumbnail: fs.readFileSync(setting.pathimg) }, footer: footxt, templateButtons: buttonsDefault, mentions: [sender] })
            break
 
        case prefix+'infobot': case prefix+'info': case prefix+'botinfo':
            addCountCmd('#infobot', sender, _cmd)
            var capt = `_*${botName} Information*_

*• Name :* ${fadly.user.name}
*• Number :* ${botNumber.split("@")[0]}
*• Owner :* ${ownerNumber.split("@")[0]}
*• Total Pengguna :* ${pendaftar.length}
*• Prefix :* Multi Prefix
*• Bot Created On 10 Mei 2022*

_*Special Thanks To :*_
*• Allah SWT*
*• Adiwajshing/Baileys*
*• Fadly ID*
*• Irfan*
*• Roni*
*• KaysaS*
*• Lindow*
*• ZackMans*
*• X-None Team*
*• Penyedia Dari :*
   *- Rest Api*
   *- Module*`
            var buts = [
                { urlButton: { displayText: `Instagram`, url: `${instagram}` } },
                { quickReplyButton: { displayText: `💰 Donasi`, id: prefix+'donate' } },
                { quickReplyButton: { displayText: `👑 Owner`, id: prefix+'dev' } }
            ]
            fadly.sendMessage(from, { image: thumb, caption: capt, footer: footxt, templateButtons: buts })
            break
        case prefix+'donate': case prefix+'donasi':
            addCountCmd('#donate', sender, _cmd)
            var butdonate = [ { urlButton: { displayText: `Instagram`, url: `${instagram}` } } ]
            fadly.sendMessage(from, { image: fs.readFileSync('./media/qris.jpg'), caption: donate(pushname, ownerNumber), footer: footxt, templateButtons: butdonate })
            break;
        case prefix+'dashboard': case prefix+'dash':
	        addCountCmd('#dashboard', sender, _cmd)
            var posi = await getPosiCmdUser(sender, _cmdUser)
            _cmdUser[posi].db.sort((a, b) => (a.count < b.count) ? 1 : -1)
            _cmd.sort((a, b) => (a.count  < b.count) ? 1 : -1)
            var posi = await getPosiCmdUser(sender, _cmdUser)
            var jumlahCmd = _cmd.length
            if (jumlahCmd > 10) jumlahCmd = 10
            var jumlah = _cmdUser[posi].db.length
            if (jumlah > 5) jumlah = 5
            var totalUser = 0
            for (let x of _cmdUser[posi].db) {
                totalUser = totalUser + x.count
            }
            var total = 0
            for (let o of _cmd) {
                total = total + o.count
            }
            var teks = `*${botName} DASHBOARD*\n\n*HIT*\n• GLOBAL : ${total}\n• USER : ${totalUser}\n\n`
            teks += `*Most Command Global*\n`
            for (let u = 0; u < jumlahCmd; u ++) {
                teks += `• ${_cmd[u].nama} : ${_cmd[u].count}\n`
            }
            teks += `\n*Most Command User*\n`
            for (let i = 0; i < jumlah; i ++) {
                teks += `• ${_cmdUser[posi].db[i].nama} : ${_cmdUser[posi].db[i].count}\n`
            }
            reply(teks)
            break
        case prefix+'owner': case prefix+'dev':
            addCountCmd('#owner', sender, _cmd)
            sendContact(from, ownerNumber.split('@s.whatsapp.net')[0], ownerName, msg)
            // fadly.sendContact(from, ownerNumber.map( i => i.split("@")[0]), msg)
            .then((res) => fadly.sendMessage(from, { text: 'Tuh Nomor Ownerku' }, {quoted: res}))
            break

        // Converter & Tools Menu
        case prefix+'sticker': case prefix+'stiker': case prefix+'s':
            if (isImage || isQuotedImage) {
                addCountCmd('#sticker', sender, _cmd)
                var stream = await downloadContentFromMessage(msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage, 'image')
                var buffer = Buffer.from([])
                for await(const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk])
                }
                var rand1 = 'sticker/'+getRandom('.jpg')
                var rand2 = 'sticker/'+getRandom('.webp')
                fs.writeFileSync(`./${rand1}`, buffer)
                ffmpeg(`./${rand1}`)
                .on("error", console.error)
                .on("end", () => {
                    exec(`webpmux -set exif ./sticker/data.exif ./${rand2} -o ./${rand2}`, async (error) => {
                        fadly.sendMessage(from, { sticker: fs.readFileSync(`./${rand2}`) }, { quoted: msg })
                        
                        fs.unlinkSync(`./${rand1}`)
                        fs.unlinkSync(`./${rand2}`)
                    })
                })
                .addOutputOptions(["-vcodec", "libwebp", "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"])
                .toFormat('webp')
                .save(`${rand2}`)
            } else if (isVideo && msg.message.videoMessage.seconds < 10 || isQuotedVideo && quotedMsg.videoMessage.seconds < 10) {
                addCountCmd('#sticker', sender, _cmd)
                reply(mess.wait)
                var stream = await downloadContentFromMessage(msg.message.videoMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.videoMessage, 'video')
                var buffer = Buffer.from([])
                for await(const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk])
                }
                var rand1 = 'sticker/'+getRandom('.mp4')
                var rand2 = 'sticker/'+getRandom('.webp')
                fs.writeFileSync(`./${rand1}`, buffer)
                ffmpeg(`./${rand1}`)
                .on("error", console.error)
                .on("end", () => {
                    exec(`webpmux -set exif ./sticker/data.exif ./${rand2} -o ./${rand2}`, async (error) => {
                        fadly.sendMessage(from, { sticker: fs.readFileSync(`./${rand2}`) }, { quoted: msg })
                        
                        fs.unlinkSync(`./${rand1}`)
                        fs.unlinkSync(`./${rand2}`)
                    })
                })
                .addOutputOptions(["-vcodec", "libwebp", "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"])
                .toFormat('webp')
                .save(`${rand2}`)
            } else {
                reply(`Kirim gambar/vidio dengan caption ${command} atau balas gambar/vidio yang sudah dikirim\nNote : Maximal vidio 10 detik!`)
            }
            break
        case prefix+'swm': case prefix+'wm': case prefix+'stikerwm': case prefix+'stickerwm':
            var packname = q.split('|')[0] ? q.split('|')[0] : q
            var author = q.split('|')[1] ? q.split('|')[1] : ''
            if (isImage || isQuotedImage) {
                if (args.length < 2) return reply(`Gunakan dengan cara ${command} nama|author\n\nContoh : ${command} Fadly|ID`)
                addCountCmd('#stickerwm', sender, _cmd)
                var media = await fadly.downloadAndSaveMediaMessage(msg, 'image', `./sticker/${sender}.jpeg`)
                var opt = { packname, author }
                fadly.sendImageAsSticker(from, media, msg, opt)
                .then( res => {
                    fs.unlinkSync(media)
                }).catch((e) => reply(mess.error.api))
            } else if (isVideo || isQuotedVideo) {
                if (args.length < 2) return reply(`Gunakan dengan cara ${command} nama|author\n\nContoh : ${command} Fadly|ID`)
                reply(mess.wait)
                addCountCmd('#stickerwm', sender, _cmd)
                var media = await fadly.downloadAndSaveMediaMessage(msg, 'video', `./sticker/${sender}.jpeg`)
                var opt = { packname, author }
                fadly.sendImageAsSticker(from, media, msg, opt)
                .then( res => {
                    fs.unlinkSync(media)
                }).catch((e) => reply(mess.error.api))
            } else {
                reply(`Kirim gambar/video dengan caption ${prefix}stickerwm nama|author atau tag gambar/video yang sudah dikirim\nNote : Durasi video maximal 10 detik`)
            }
            break
        case prefix+'toimg': case prefix+'toimage': case prefix+'tovid': case prefix+'tovideo':
            if (!isQuotedSticker) return reply(`Reply stikernya!`)
            var stream = await downloadContentFromMessage(msg.message.extendedTextMessage?.contextInfo.quotedMessage.stickerMessage, 'sticker')
            var buffer = Buffer.from([])
            for await(const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }
            var rand1 = 'sticker/'+getRandom('.webp')
            var rand2 = 'sticker/'+getRandom('.png')
            fs.writeFileSync(`./${rand1}`, buffer)
            if (isQuotedSticker && msg.message.extendedTextMessage.contextInfo.quotedMessage.stickerMessage.isAnimated !== true) {
                addCountCmd('#toimg', sender, _cmd)
                exec(`ffmpeg -i ./${rand1} ./${rand2}`, (err) => {
                    fs.unlinkSync(`./${rand1}`)
                    if (err) return reply(mess.error.api)
                    fadly.sendMessage(from, { image: fs.readFileSync(`./${rand2}`) }, { quoted: msg })
                    
                    fs.unlinkSync(`./${rand2}`)
                })
            } else {
                reply(mess.wait)
                addCountCmd('#tovid', sender, _cmd)
                webp2mp4File(`./${rand1}`).then(async(data) => {
                    fs.unlinkSync(`./${rand1}`)
                    fadly.sendMessage(from, { video: await getBuffer(data.data) }, { quoted: msg })
                    
                })
            }
            break
        case prefix+'tomp3': case prefix+'toaudio':
            if (isVideo || isQuotedVideo) {
                let media = await downloadAndSaveMediaMessage('video', `./sticker/${sender}.mp4`)
                reply(mess.wait)
                addCountCmd('#tomp3', sender, _cmd)
                let ran = './sticker/'+getRandom('.mp3')
                exec(`ffmpeg -i ${media} ${ran}`, async (err) => {
                    fs.unlinkSync(media)
                    if (err) return reply('Gagal :V')
                    fadly.sendMessage(from, { audio: fs.readFileSync(ran),  mimetype: 'audio/mp4', fileName: `${sender.split("@")[0]}ToMp3` }, { quoted: msg })
                    
                    fs.unlinkSync(media)
                    fs.unlinkSync(ran)
                })
            } else {
                reply(`Kirim/reply video dengan caption ${command}`)
            }
            break
        case prefix+'ttp':
            if (args.length < 2) return reply(`Gunakan dengan cara ${command} text\n\nContoh : ${command} Fadly`)
            if (q.length > 75) return reply(`Teksnya terlalu panjang`)
            addCountCmd('#ttp', sender, _cmd)
            var pth = await getBuffer(`https://api.xteam.xyz/ttp?file&text=${encodeURIComponent(q)}`)
            fs.writeFileSync(`./sticker/${sender}.png`, pth)
            var media = `./sticker/${sender}.png`
            await ffmpeg(`${media}`)
            .input(media)
            .on('start', function (cmd) {
            })
            .on('error', function (err) {
                console.log(`Error : ${err}`)
                fs.unlinkSync(media)
                reply(mess.error.api)
            })
            .on('end', function () {
                exec(`webpmux -set exif ./sticker/data.exif ./sticker/${sender}.webp -o ./sticker/${sender}.webp`, async (error) => {
                    if (error) return reply(mess.error.api)
                    fadly.sendMessage(from, { sticker: fs.readFileSync(`./sticker/${sender}.webp`) }, {quoted: msg})
                    
                    fs.unlinkSync(media)
                    fs.unlinkSync(`./sticker/${sender}.webp`)
                })
            })
            .addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
            .toFormat('webp')
            .save(`./sticker/${sender}.webp`)
            break
        case prefix+'attp':
            if (args.length < 2) return reply(`Gunakan dengan cara ${command} text\n\nContoh : ${command} Fadly`)
            if (q.length > 75) return reply(`Teksnya terlalu panjang`)
            addCountCmd('#attp', sender, _cmd)
            var data = await getBuffer(`https://api.xteam.xyz/attp?file&text=${encodeURIComponent(q)}`)
            var rand2 = 'sticker/'+getRandom('.webp')
            fs.writeFileSync(`./${rand2}`, data)
            exec(`webpmux -set exif ./sticker/data.exif ./${rand2} -o ./${rand2}`, async (error) => {
                fadly.sendMessage(from, { sticker: fs.readFileSync(`./${rand2}`) }, { quoted: msg })
                
                fs.unlinkSync(`./${rand2}`)
            })
            break
        case prefix+'nulis':
            addCountCmd('#nulis', sender, _cmd)
            reply(`*Pilihan Fitur Nulis*
1. ${prefix}nuliskiri
2. ${prefix}nuliskanan
3. ${prefix}foliokiri
4. ${prefix}foliokanan

Contoh:
${prefix}nuliskiri Jangan Lupa Donasi`)
            break
        case prefix+'nuliskiri': {
            if (args.length < 2) return reply(`Gunakan dengan cara ${command} text\n\nContoh : ${command} Fadly`)
            reply(mess.wait)
            const tulisan = body.slice(11)
            addCountCmd('#nuliskiri', sender, _cmd)
            const splitText = tulisan.replace(/(\S+\s*){1,9}/g, '$&\n')
            const fixHeight = splitText.split('\n').slice(0, 31).join('\n')
            spawn('convert', [
                './media/nulis/images/buku/sebelumkiri.jpg',
                '-font',
                './media/nulis/font/Indie-Flower.ttf',
                '-size',
                '960x1280',
                '-pointsize',
                '22',
                '-interline-spacing',
                '2',
                '-annotate',
                '+140+153',
                fixHeight,
                './media/nulis/images/buku/setelahkiri.jpg'
            ])
                .on('error', () => reply(mess.error.api))
                .on('exit', () => {
                    fadly.sendMessage(from, { caption: 'Jangan males pak...', image: fs.readFileSync('./media/nulis/images/buku/setelahkiri.jpg') }, { quoted: msg, thumbnail: Buffer.alloc(0) })
                    
                })
            }
            break
        case prefix+'nuliskanan': {
            if (args.length < 2) return reply(`Gunakan dengan cara ${command} text\n\nContoh : ${command} Fadly`)
            reply(mess.wait)
            const tulisan = body.slice(12)
            addCountCmd('#nuliskanan', sender, _cmd)
            const splitText = tulisan.replace(/(\S+\s*){1,9}/g, '$&\n')
            const fixHeight = splitText.split('\n').slice(0, 31).join('\n')
            spawn('convert', [
                './media/nulis/images/buku/sebelumkanan.jpg',
                '-font',
                './media/nulis/font/Indie-Flower.ttf',
                '-size',
                '960x1280',
                '-pointsize',
                '23',
                '-interline-spacing',
                '2',
                '-annotate',
                '+128+129',
                fixHeight,
                './media/nulis/images/buku/setelahkanan.jpg'
            ])
                .on('error', () => reply(mess.error.api))
                .on('exit', () => {
                    fadly.sendMessage(from, { caption: 'Jangan males pak...', image: fs.readFileSync('./media/nulis/images/buku/setelahkanan.jpg') }, { quoted: msg, thumbnail: Buffer.alloc(0) })
                    
                })
            }
            break
        case prefix+'foliokiri': {
            if (args.length < 2) return reply(`Gunakan dengan cara ${command} text\n\nContoh : ${command} Fadly`)
            reply(mess.wait)
            const tulisan = body.slice(11)
            addCountCmd('#foliokiri', sender, _cmd)
            const splitText = tulisan.replace(/(\S+\s*){1,13}/g, '$&\n')
            const fixHeight = splitText.split('\n').slice(0, 38).join('\n')
            spawn('convert', [
                './media/nulis/images/folio/sebelumkiri.jpg',
                '-font',
                './media/nulis/font/Indie-Flower.ttf',
                '-size',
                '1720x1280',
                '-pointsize',
                '23',
                '-interline-spacing',
                '4',
                '-annotate',
                '+48+185',
                fixHeight,
                './media/nulis/images/folio/setelahkiri.jpg'
            ])
                .on('error', () => reply(mess.error.api))
                .on('exit', () => {
                    fadly.sendMessage(from, { caption: 'Jangan males pak...', image: fs.readFileSync('./media/nulis/images/folio/setelahkiri.jpg') }, { quoted: msg, thumbnail: Buffer.alloc(0) })
                    
                })
            }
            break
        case prefix+'foliokanan': {
            if (args.length < 2) return reply(`Gunakan dengan cara ${command} text\n\nContoh : ${command} Fadly`)
            reply(mess.wait)
            const tulisan = body.slice(12)
            addCountCmd('#foliokanan', sender, _cmd)
            const splitText = tulisan.replace(/(\S+\s*){1,13}/g, '$&\n')
            const fixHeight = splitText.split('\n').slice(0, 38).join('\n')
            spawn('convert', [
                './media/nulis/images/folio/sebelumkanan.jpg',
                '-font',
                './media/nulis/font/Indie-Flower.ttf',
                '-size',
                '960x1280',
                '-pointsize',
                '23',
                '-interline-spacing',
                '3',
                '-annotate',
                '+89+190',
                fixHeight,
                './media/nulis/images/folio/setelahkanan.jpg'
            ])
                .on('error', () => reply(mess.error.api))
                .on('exit', () => {
                    fadly.sendMessage(from, { caption: 'Jangan males pak...', image: fs.readFileSync('./media/nulis/images/folio/setelahkanan.jpg') }, { quoted: msg, thumbnail: Buffer.alloc(0) })
                    
                })
            }
            break

        // Store Menu
        case prefix+'list':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (db_respon_list.length === 0) return reply(`Belum ada list message di database`)
            if (!isAlreadyResponListGroup(from, db_respon_list)) return reply(`Belum ada list message yang terdaftar di group ini`)
            var arr_rows = [];
            for (let x of db_respon_list) {
                if (x.id === from) {
                    arr_rows.push({
                        title: x.key,
                        rowId: x.key
                    })
                }
            }
            var listMsg = {
                text: `${ucapanWaktu} @${sender.split("@")[0]}`,
                buttonText: 'Click Here!',
                footer: `*List ${groupName}*\n\n⏳ ${jam}\n📆 ${tanggal}`,
                mentions: [sender],
                sections: [{
                    title: groupName, rows: arr_rows
                }]
            }
            fadly.sendMessage(from, listMsg)
            break
        case prefix+'addlist':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            var args1 = q.split("@")[0]
            var args2 = q.split("@")[1]                
            if (!q.includes("@")) return reply(`Gunakan dengan cara ${command} *key@response*\n\n_Contoh_\n\n${command} tes@apa`)
            if (isAlreadyResponList(from, args1, db_respon_list)) return reply(`List respon dengan key : *${args1}* sudah ada di group ini.`)
            if (isImage || isQuotedImage) {
                let media = await downloadAndSaveMediaMessage('image', `./sticker/${sender}`)
                const fd = new FormData();
                fd.append('file', fs.readFileSync(media), '.tmp', '.jpg')
                fetch('https://telegra.ph/upload', {
                    method: 'POST',
                    body: fd
                }).then(res => res.json())
                    .then((json) => {
                        addResponList(from, args1, args2, true, `https://telegra.ph${json[0].src}`, db_respon_list)
                        reply(`Sukses set list message dengan key : *${args1}*`)
                        if (fs.existsSync(media)) fs.unlinkSync(media)
                    })
            } else {
                addResponList(from, args1, args2, false, '-', db_respon_list)
                reply(`Sukses set list message dengan key : *${args1}*`)
            }
            break
        case prefix+'dellist':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (db_respon_list.length === 0) return reply(`Belum ada list message di database`)
            if (!q) return reply(`Gunakan dengan cara ${command} *key*\n\n_Contoh_\n\n${command} hello`)
            if (!isAlreadyResponList(from, q, db_respon_list)) return reply(`List respon dengan key *${q}* tidak ada di database!`)
            delResponList(from, q, db_respon_list)
            reply(`Sukses delete list message dengan key *${q}*`)
            break
        case prefix+'updatelist': case prefix+'update':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            var args1 = q.split("@")[0]
            var args2 = q.split("@")[1]
            if (!q.includes("@")) return reply(`Gunakan dengan cara ${command} *key@response*\n\n_Contoh_\n\n${command} tes@apa`)
            if (!isAlreadyResponListGroup(from, db_respon_list)) return reply(`Maaf, untuk key *${args1}* belum terdaftar di group ini`)
            if (isImage || isQuotedImage) {
                let media = await downloadAndSaveMediaMessage('image', `./sticker/${sender}`)
                const fd = new FormData();
                fd.append('file', fs.readFileSync(media), '.tmp', '.jpg')
                fetch('https://telegra.ph/upload', {
                    method: 'POST',
                    body: fd
                }).then(res => res.json())
                    .then((json) => {
                        updateResponList(from, args1, args2, true, `https://telegra.ph${json[0].src}`, db_respon_list)
                        reply(`Sukses update list message dengan key : *${args1}*`)
                        if (fs.existsSync(media)) fs.unlinkSync(media)
                    })
            } else {
                updateResponList(from, args1, args2, false, '-', db_respon_list)
                reply(`Sukses update respon list dengan key *${args1}*`)
            }
            break
        case prefix+'jeda': {
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            if (!args[1]) return reply(`kirim ${command} waktu\nContoh: ${command} 30m\n\nlist waktu:\ns = detik\nm = menit\nh = jam\nd = hari`)
            opengc[from] = { id: from, time: Date.now() + toMS(args[1]) }
            fs.writeFileSync('./database/opengc.json', JSON.stringify(opengc))
            fadly.groupSettingUpdate(from, "announcement")
            .then((res) => reply(`Sukses, group akan dibuka ${args[1]} lagi`))
            .catch((err) => reply('Error'))
            }
            break
        case prefix+'tambah':
            if (args.length < 3) return reply(`Gunakan dengan cara ${command} *angka* *angka*\n\n_Contoh_\n\n${command} 1 2`)
            var nilai_one = Number(args[1])
            var nilai_two = Number(args[2])
            reply(`${nilai_one + nilai_two}`)
            break
        case prefix+'kurang':
            if (args.length < 3) return reply(`Gunakan dengan cara ${command} *angka* *angka*\n\n_Contoh_\n\n${command} 1 2`)
            var nilai_one = Number(args[1])
            var nilai_two = Number(args[2])
            reply(`${nilai_one - nilai_two}`)
            break
        case prefix+'kali':
            if (args.length < 3) return reply(`Gunakan dengan cara ${command} *angka* *angka*\n\n_Contoh_\n\n${command} 1 2`)
            var nilai_one = Number(args[1])
            var nilai_two = Number(args[2])
            reply(`${nilai_one * nilai_two}`)
            break
        case prefix+'bagi':
            if (args.length < 3) return reply(`Gunakan dengan cara ${command} *angka* *angka*\n\n_Contoh_\n\n${command} 1 2`)
            var nilai_one = Number(args[1])
            var nilai_two = Number(args[2])
            reply(`${nilai_one / nilai_two}`)
            break
        case 'p': case 'proses':
            if (!isGroup) return
            if (!isOwner && !isGroupAdmins) return
            if (!isQuotedMsg) return
            let proses = `「 *TRANSAKSI PENDING* 」\n\n\`\`\`📆 TANGGAL : ${tanggal}\n⌚ JAM     : ${jam}\n✨ STATUS  : Pending\`\`\`\n\n📝 Catatan :\n${quotedMsg.chats}\n\nPesanan @${quotedMsg.sender.split("@")[0]} sedang di proses!`
            const getTextP = getTextSetProses(from, set_proses);
            if (getTextP !== undefined) {
                mentions(getTextP.replace('pesan', quotedMsg.chats).replace('nama', quotedMsg.sender.split("@")[0]).replace('jam', jam).replace('tanggal', tanggal), [quotedMsg.sender], true);
            } else {
                mentions(proses, [quotedMsg.sender], true)
            }
            break
        case 'd': case 'done':
            if (!isGroup) return
            if (!isOwner && !isGroupAdmins) return
            if (!isQuotedMsg) return
            let sukses = `「 *TRANSAKSI BERHASIL* 」\n\n\`\`\`📆 TANGGAL : ${tanggal}\n⌚ JAM     : ${jam}\n✨ STATUS  : Berhasil\`\`\`\n\nTerimakasih @${quotedMsg.sender.split("@")[0]} Next Order ya🙏`
            const getTextD = getTextSetDone(from, set_done);
            if (getTextD !== undefined) {
                mentions(getTextD.replace('pesan', quotedMsg.chats).replace('nama', quotedMsg.sender.split("@")[0]).replace('jam', jam).replace('tanggal', tanggal), [quotedMsg.sender], true);
            } else {
                mentions(sukses, [quotedMsg.sender], true)
            }
            break
        case prefix+'setproses': case prefix+'setp':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!q) return reply(`Gunakan dengan cara ${command} *teks_p*\n\n_Contoh_\n\n${command} pesanan @pesan, tag orang @nama`)
            if (isSetProses(from, set_proses)) return reply(`Set proses already active`)
            addCountCmd('#setproses', sender, _cmd)
            addSetProses(q, from, set_proses)
            reply(`Successfully set proses!`)
            break
        case prefix+'changeproses': case prefix+'changep':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!q) return reply(`Gunakan dengan cara ${command} *teks_p*\n\n_Contoh_\n\n${command} pesanan @pesan, tag orang @nama`)
            addCountCmd('#changeproses', sender, _cmd)
            if (isSetProses(from, set_proses)) {
                changeSetProses(q, from, set_proses)
                reply(`Sukses change set proses teks!`)
            } else {
                addSetProses(q, from, set_proses)
                reply(`Sukses change set proses teks!`)
            }
            break
        case prefix+'delsetproses': case prefix+'delsetp':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!isSetProses(from, set_proses)) return reply(`Belum ada set proses di sini..`)
            addCountCmd('#delsetproses', sender, _cmd)
            removeSetProses(from, set_proses)
            reply(`Sukses delete set proses`)
            break
        case prefix+'setdone': case prefix+'setd':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!q) return reply(`Gunakan dengan cara ${command} *teks_d*\n\n_Contoh_\n\n${command} pesanan @pesan, tag orang @nama`)
            if (isSetDone(from, set_done)) return reply(`Set done already active`)
            addCountCmd('#setdone', sender, _cmd)
            addSetDone(q, from, set_done)
            reply(`Successfully set done!`)
            break
        case prefix+'changedone': case prefix+'changed':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!q) return reply(`Gunakan dengan cara ${command} *teks_d*\n\n_Contoh_\n\n${command} pesanan @pesan, tag orang @nama`)
            addCountCmd('#changedone', sender, _cmd)
            if (isSetDone(from, set_done)) {
                changeSetDone(q, from, set_done)
                reply(`Sukses change set done teks!`)
            } else {
                addSetDone(q, from, set_done)
                reply(`Sukses change set done teks!`)
            }
            break
        case prefix+'delsetdone': case prefix+'delsetd':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!isSetDone(from, set_done)) return reply(`Belum ada set done di sini..`)
            addCountCmd('#delsetdone', sender, _cmd)
            removeSetDone(from, set_done)
            reply(`Sukses delete set done`)
            break

        // Group Menu
        if (isMuted) {
            if (!isGroupAdmins && !isOwner) return
            if (chats.toLowerCase().startsWith(prefix+'unmute')) {
                let anu = mute.indexOf(from)
                mute.splice(anu, 1)
                fs.writeFileSync('./database/mute.json', JSON.stringify(mute, null, 3))
                reply(`Bot telah diunmute di group ini`)
            }
        }
        
        case prefix+'mute':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (isMuted) return reply(`udah mute`)
            mute.push(from)
            fs.writeFileSync('./database/mute.json', JSON.stringify(mute, null, 3))
            reply(`Bot berhasil dimute di chat ini`)
            break
        case prefix+'afk':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (isAfkOn) return reply('afk sudah diaktifkan sebelumnya')
            if (body.slice(100)) return reply('Alasanmu terlalu panjang')
            addCountCmd('#afk', sender, _cmd)
            let reason = body.slice(5) ? body.slice(5) : 'Nothing.'
            afk.addAfkUser(sender, Date.now(), reason, _afk)
            mentions(`@${sender.split('@')[0]} sedang afk\nAlasan : ${reason}`, [sender], true)
            break
        case prefix+'welcome':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (args.length === 1) return reply(`Pilih enable atau disable`)
            if (args[1].toLowerCase() === "enable") {
                addCountCmd('#welcome', sender, _cmd)
                if (isWelcome) return reply(`Udah aktif`)
                welcome.push(from)
                fs.writeFileSync('./database/welcome.json', JSON.stringify(welcome, null, 2))
                reply('Sukses mengaktifkan welcome di grup ini')
            } else if (args[1].toLowerCase() === "disable") {
                addCountCmd('#welcome', sender, _cmd)
                var posi = welcome.indexOf(from)
                welcome.splice(posi, 1)
                fs.writeFileSync('./database/welcome.json', JSON.stringify(welcome, null, 2))
                reply('Sukses menonaktifkan welcome di grup ini')
            } else {
                reply(`Pilih enable atau disable`)
            }
            break
        case prefix+'left':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (args.length === 1) return reply(`Pilih enable atau disable`)
            if (args[1].toLowerCase() === "enable") {
                addCountCmd('#setleft', sender, _cmd)
                if (isLeft) return reply(`Udah aktif`)
                left.push(from)
                fs.writeFileSync('./database/left.json', JSON.stringify(left, null, 2))
                reply('Sukses mengaktifkan left di grup ini')
            } else if (args[1].toLowerCase() === "disable") {
                addCountCmd('#setleft', sender, _cmd)
                var posi = left.indexOf(from)
                left.splice(posi, 1)
                fs.writeFileSync('./database/left.json', JSON.stringify(left, null, 2))
                reply('Sukses menonaktifkan left di grup ini')
            } else {
                reply(`Pilih enable atau disable`)
            }
            break
        case prefix+'setwelcome':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!q) return reply(`Gunakan dengan cara ${command} *teks_welcome*\n\n_Contoh_\n\n${command} Halo @user, Selamat datang di @group`)
            if (isSetWelcome(from, set_welcome_db)) return reply(`Set welcome already active`)
            addSetWelcome(q, from, set_welcome_db)
            addCountCmd('#setwelcome', sender, _cmd)
            reply(`Successfully set welcome!`)
            break
        case prefix+'changewelcome':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!q) return reply(`Gunakan dengan cara ${command} *teks_welcome*\n\n_Contoh_\n\n${command} Halo @user, Selamat datang di @group`)
            if (isSetWelcome(from, set_welcome_db)) {
                addCountCmd('#changewelcome', sender, _cmd)
                changeSetWelcome(q, from, set_welcome_db)
                reply(`Sukses change set welcome teks!`)
            } else {
                addCountCmd('#changewelcome', sender, _cmd)
                addSetWelcome(q, from, set_welcome_db)
                reply(`Sukses change set welcome teks!`)
            }
            break
        case prefix+'delsetwelcome':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!isSetWelcome(from, set_welcome_db)) return reply(`Belum ada set welcome di sini..`)
            removeSetWelcome(from, set_welcome_db)
            addCountCmd('#delsetwelcome', sender, _cmd)
            reply(`Sukses delete set welcome`)
            break
        case prefix+'setleft':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!q) return reply(`Gunakan dengan cara ${command} *teks_left*\n\n_Contoh_\n\n${command} Halo @user, Selamat tinggal dari @group`)
            if (isSetLeft(from, set_left_db)) return reply(`Set left already active`)
            addCountCmd('#setleft', sender, _cmd)
            addSetLeft(q, from, set_left_db)
            reply(`Successfully set left!`)
            break
        case prefix+'changeleft':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!q) return reply(`Gunakan dengan cara ${command} *teks_left*\n\n_Contoh_\n\n${command} Halo @user, Selamat tinggal dari @group`)
            if (isSetLeft(from, set_left_db)) {
                addCountCmd('#changeleft', sender, _cmd)
                changeSetLeft(q, from, set_left_db)
                reply(`Sukses change set left teks!`)
            } else {
                addCountCmd('#changeleft', sender, _cmd)
                addSetLeft(q, from, set_left_db)
                reply(`Sukses change set left teks!`)
            }
            break
        case prefix+'delsetleft':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!isSetLeft(from, set_left_db)) return reply(`Belum ada set left di sini..`)
            addCountCmd('#delsetleft', sender, _cmd)
            removeSetLeft(from, set_left_db)
            reply(`Sukses delete set left`)
            break
        case prefix+'linkgrup': case prefix+'link': case prefix+'linkgc':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            addCountCmd('#linkgc', sender, _cmd)
            var url = await fadly.groupInviteCode(from).catch(() => reply(mess.error.api))
            url = 'https://chat.whatsapp.com/'+url
            reply(url)
            break
        case prefix+'setppgrup': case prefix+'setppgc':
            if (!isGroup) return reply(mess.OnlyGrup)
		    if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
		    if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            if (isImage || isQuotedImage) {
            addCountCmd('#setppgrup', sender, _cmd)
            var media = await downloadAndSaveMediaMessage('image', `ppgc${from}.jpeg`)
            if (args[1] == '\'panjang\'') {
            	var { img } = await generateProfilePicture(media)
            	await fadly.query({
                    tag: 'iq',
                    attrs: {
                        to: from,
                        type:'set',
                        xmlns: 'w:profile:picture'
                    },
                    content: [
                    {
                        tag: 'picture',
                        attrs: { type: 'image' },
                        content: img
                    } 
                    ]
                })
                fs.unlinkSync(media)
            	reply(`Sukses`)
            } else {
                await fadly.updateProfilePicture(from, { url: media })
                .then( res => {
                    reply(`Sukses`)
                    fs.unlinkSync(media)
                }).catch(() => reply(mess.error.api))
            }
            } else {
			    reply(`Kirim/balas gambar dengan caption ${command}`)
            }
            break
        case prefix+'setnamegrup': case prefix+'setnamegc':
            if (!isGroup) return reply(mess.OnlyGrup)
		    if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
		    if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            if (args.length < 2) return reply(`Gunakan dengan cara ${command} *text*\n\n_Contoh_\n\n${command} Support ${ownerName}`)
            addCountCmd('#setnamegc', sender, _cmd)
            await fadly.groupUpdateSubject(from, q)
            .then( res => {
                reply(`Sukses`)
            }).catch(() => reply(mess.error.api))
            break
        case prefix+'setdesc': case prefix+'setdescription':
            if (!isGroup) return reply(mess.OnlyGrup)
		    if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
		    if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            if (args.length < 2) return reply(`Gunakan dengan cara ${command} *text*\n\n_Contoh_\n\n${command} New Description by ${ownerName}`)
            addCountCmd('#setdesc', sender, _cmd)
            await fadly.groupUpdateDescription(from, q)
            .then( res => {
                reply(`Sukses`)
            }).catch(() => reply(mess.error.api))
            break
        case prefix+'antilink':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            if (args.length === 1) return reply(`Pilih enable atau disable`)
            if (args[1].toLowerCase() === 'enable'){
                addCountCmd('#antilink', sender, _cmd)
                if (isAntiLink) return reply(`Udah aktif`)
                antilink.push(from)
                fs.writeFileSync('./database/antilink.json', JSON.stringify(antilink, null, 2))
                reply('Successfully Activate Antilink In This Group')
            } else if (args[1].toLowerCase() === 'disable'){
                addCountCmd('#antilink', sender, _cmd)
                if (!isAntiLink) return reply(`Udah nonaktif`)
                let anu = antilink.indexOf(from)
                antilink.splice(anu, 1)
                fs.writeFileSync('./database/antilink.json', JSON.stringify(antilink, null, 2))
                reply('Successfully Disabling Antilink In This Group')
            } else {
                reply(`Pilih enable atau disable`)
            }
            break
        case prefix+'antiwame':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            if (args.length === 1) return reply(`Pilih enable atau disable`)
            if (args[1].toLowerCase() === 'enable'){
                addCountCmd('#antiwame', sender, _cmd)
                if (isAntiWame) return reply(`Udah aktif`)
                antilink.push(from)
                fs.writeFileSync('./database/antiwame.json', JSON.stringify(antiwame, null, 2))
                reply('Successfully Activate Antiwame In This Group')
            } else if (args[1].toLowerCase() === 'disable'){
                addCountCmd('#antiwame', sender, _cmd)
                if (!isAntiWame) return reply(`Udah nonaktif`)
                let anu = antiwame.indexOf(from)
                antiwame.splice(anu, 1)
                fs.writeFileSync('./database/antiwame.json', JSON.stringify(antiwame, null, 2))
                reply('Successfully Disabling Antiwame In This Group')
            } else {
                reply(`Pilih enable atau disable`)
            }
            break
        case prefix+'open': case prefix+'buka':
            if (!isGroup) return reply(mess.OnlyGrup)
		    if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
		    if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            addCountCmd('#open', sender, _cmd)
            fadly.groupSettingUpdate(from, 'not_announcement')
            .then((res) => {
                const textOpen = getTextSetOpen(from, set_open);
                if (textOpen !== undefined) {
                    reply(textOpen);
                } else {
                    reply(`Sukses mengizinkan semua peserta dapat mengirim pesan ke grup ini`)
                }
            })
            .catch((err) => reply('Error'))
			break
        case prefix+'close': case prefix+'tutup':
            if (!isGroup) return reply(mess.OnlyGrup)
		    if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
		    if (!isBotGroupAdmins) return reply(mess.BotAdmin)
		    addCountCmd('#close', sender, _cmd)
		    fadly.groupSettingUpdate(from, 'announcement')
		    .then((res) => {
                const textClose = getTextSetClose(from, set_close);
                if (textClose !== undefined) {
                    reply(textClose);
                } else {
                    reply(`Sukses mengizinkan hanya admin yang dapat mengirim pesan ke grup ini`)
                }
            })
            .catch((err) => reply('Error'))
		    break
        case prefix+'setopen':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!q) return reply(`Gunakan dengan cara ${command} *teks_open*\n\n_Contoh_\n\n${command} Group telah di buka`)
            if (isSetOpen(from, set_open)) return reply(`Set Open already active`)
            addCountCmd('#setopen', sender, _cmd)
            addSetOpen(q, from, set_open)
            reply(`Successfully set Open!`)
            break
        case prefix+'changeopen':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!q) return reply(`Gunakan dengan cara ${command} *teks_open*\n\n_Contoh_\n\n${command} Group telah di buka`)
            addCountCmd('#changeopen', sender, _cmd)
            if (isSetOpen(from, set_open)) {
                changeSetOpen(q, from, set_open)
                reply(`Sukses change set Open teks!`)
            } else {
                addSetOpen(q, from, set_open)
                reply(`Sukses change set Open teks!`)
            }
            break
        case prefix+'delsetopen':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!isSetOpen(from, set_open)) return reply(`Belum ada set Open di sini..`)
            addCountCmd('#delsetopen', sender, _cmd)
            removeSetOpen(from, set_open)
            reply(`Sukses delete set Open`)
            break
        case prefix+'setclose':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!q) return reply(`Gunakan dengan cara ${command} *teks_close*\n\n_Contoh_\n\n${command} Group telah di tutup`)
            if (isSetClose(from, set_close)) return reply(`Set Close already active`)
            addCountCmd('#setclose', sender, _cmd)
            addSetClose(q, from, set_close)
            reply(`Successfully set Close!`)
            break
        case prefix+'changeclose':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!q) return reply(`Gunakan dengan cara ${command} *teks_close*\n\n_Contoh_\n\n${command} Group telah di tutup`)
            addCountCmd('#changeclose', sender, _cmd)
            if (isSetClose(from, set_close)) {
                changeSetClose(q, from, set_close)
                reply(`Sukses change set Close teks!`)
            } else {
                addSetClose(q, from, set_close)
                reply(`Sukses change set Close teks!`)
            }
            break
        case prefix+'delsetclose':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!isSetClose(from, set_close)) return reply(`Belum ada set Close di sini..`)
            addCountCmd('#delseclose', sender, _cmd)
            removeSetClose(from, set_close)
            reply(`Sukses delete set Close`)
            break
        case prefix+'add':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins) return reply(mess.GrupAdmin)
            if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            if (groupMembers.length == 257) return reply(`Anda tidak dapat menambah peserta, karena Grup sudah penuh!`)
            var mems = []
            groupMembers.map( i => mems.push(i.id) )
            var number;
            if (args.length > 1) {
                number = q.replace(/[^0-9]/gi, '')+"@s.whatsapp.net"
                var cek = await fadly.onWhatsApp(number)
                if (cek.length == 0) return reply(`Masukkan nomer yang valid dan terdaftar di WhatsApp`)
                if (mems.includes(number)) return reply(`Nomer tersebut sudah berada didalam grup!`)
                addCountCmd('#add', sender, _cmd)
                fadly.groupParticipantsUpdate(from, [number], "add")
                .then( res => reply(jsonformat(res)))
                .catch((err) => reply(jsonformat(err)))
            } else if (isQuotedMsg) {
                number = quotedMsg.sender
                var cek = await fadly.onWhatsApp(number)
                if (cek.length == 0) return reply(`Peserta tersebut sudah tidak terdaftar di WhatsApp`)
                if (mems.includes(number)) return reply(`Nomer tersebut sudah berada didalam grup!`)
                addCountCmd('#add', sender, _cmd)
                fadly.groupParticipantsUpdate(from, [number], "add")
                .then( res => reply(jsonformat(res)))
                .catch((err) => reply(jsonformat(err)))
            } else {
                reply(`Kirim perintah ${command} nomer atau balas pesan orang yang ingin dimasukkan`)
            }
            break
        case prefix+'kick':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins) return reply(mess.GrupAdmin)
            if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            var number;
			if (mentionUser.length !== 0) {
                number = mentionUser[0]
                addCountCmd('#kick', sender, _cmd)
                fadly.groupParticipantsUpdate(from, [number], "remove")
                .then( res => reply(jsonformat(res)))
                .catch((err) => reply(jsonformat(err)))
            } else if (isQuotedMsg) {
                number = quotedMsg.sender
                addCountCmd('#kick', sender, _cmd)
                fadly.groupParticipantsUpdate(from, [number], "remove")
                .then( res => reply(jsonformat(res)))
                .catch((err) => reply(jsonformat(err)))
            } else {
                reply(`Tag atau balas pesan orang yang ingin dikeluarkan dari grup`)
            }
            break
        case prefix+'promote': case prefix+'pm':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins) return reply(mess.GrupAdmin)
            if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            if (mentionUser.length !== 0) {
                addCountCmd('#promote', sender, _cmd)
                fadly.groupParticipantsUpdate(from, [mentionUser[0]], "promote")
                .then( res => { mentions(`Sukses menjadikan @${mentionUser[0].split("@")[0]} sebagai admin`, [mentionUser[0]], true) })
                .catch(() => reply(mess.error.api))
            } else if (isQuotedMsg) {
                addCountCmd('#promote', sender, _cmd)
                fadly.groupParticipantsUpdate(from, [quotedMsg.sender], "promote")
                .then( res => { mentions(`Sukses menjadikan @${quotedMsg.sender.split("@")[0]} sebagai admin`, [quotedMsg.sender], true) })
                .catch(() => reply(mess.error.api))
            } else {
                reply(`Tag atau balas pesan member yang ingin dijadikan admin`)
            }
            break
        case prefix+'demote':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins) return reply(mess.GrupAdmin)
            if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            if (mentionUser.length !== 0) {
                addCountCmd('#demote', sender, _cmd)
                fadly.groupParticipantsUpdate(from, [mentionUser[0]], "demote")
                .then( res => { mentions(`Sukses menjadikan @${mentionUser[0].split("@")[0]} sebagai member biasa`, [mentionUser[0]], true) })
                .catch(() => reply(mess.error.api))
            } else if (isQuotedMsg) {
                addCountCmd('#demote', sender, _cmd)
                fadly.groupParticipantsUpdate(from, [quotedMsg.sender], "demote")
                .then( res => { mentions(`Sukses menjadikan @${quotedMsg.sender.split("@")[0]} sebagai member biasa`, [quotedMsg.sender], true) })
                .catch(() => reply(mess.error.api))
            } else {
                reply(`Tag atau balas pesan admin yang ingin dijadikan member biasa`)
            }
            break
        case prefix+'revoke':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins) return reply(mess.GrupAdmin)
            if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            addCountCmd('#revoke', sender, _cmd)
            await fadly.groupRevokeInvite(from)
            .then( res => {
                reply(`Sukses menyetel tautan undangan grup ini`)
            }).catch(() => reply(mess.error.api))
            break
        case prefix+'hidetag':
            if (!isGroup) return reply(mess.OnlyGrup)
		    if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            addCountCmd('#hidetag', sender, _cmd)
            let mem = [];
            groupMembers.map( i => mem.push(i.id) )
            fadly.sendMessage(from, { text: q ? q : '', mentions: mem })
            break
        case prefix+'delete': case prefix+'del': case prefix+'d':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!isQuotedMsg) return reply(`Balas chat dari bot yang ingin dihapus`)
            if (!quotedMsg.fromMe) return reply(`Hanya bisa menghapus chat dari bot`)
            addCountCmd('#delete', sender, _cmd)
            fadly.sendMessage(from, { delete: { fromMe: true, id: quotedMsg.id, remoteJid: from }})
            break

        // Search Menu
        case prefix+'nickff':
            if (!q) return reply(`Gunakan dengan cara ${command} *id*\n\n_Contoh_\n\n${command} 646675175`)
            axios.get(`https://api.lolhuman.xyz/api/freefire/${args[1]}?apikey=${lolkey}`)
            .then(({data}) => {
            let epep = `*🔎 CHECK NICK FREE FIRE 🔍*

ID : ${args[1]}
Nick : ${data.result}`
            reply(epep)
            
            })
            .catch((err) => {
                console.log(color('[ ERROR ]', 'red'), err)
                reply(mess.error.api)
                fadly.sendMessage(ownerNumber, { text: `${command} error : ${err}` })
            })
            break
        case prefix+'nickml':
            var args1 = q.split("/")[0]
            var args2 = q.split("/")[1]                
            if (!q.includes("/")) return reply(`Gunakan dengan cara ${command} *id/server*\n\n_Contoh_\n\n${command} 617243212/8460`)
            axios.get(`https://api.lolhuman.xyz/api/mobilelegend/${args1}/${args2}?apikey=${lolkey}`)
            .then(({data}) => {
            let emel = `*🔎 CHECK NICK MOBILE LEGENDS 🔍*

ID : ${args[1]}
Nick : ${data.result}`
reply(emel)
            
            })
            .catch((err) => {
                console.log(color('[ ERROR ]', 'red'), err)
                reply(mess.error.api)
                fadly.sendMessage(ownerNumber, { text: `${command} error : ${err}` })
            })
            break
        case prefix+'nickpubg':
            if (!q) return reply(`Gunakan dengan cara ${command} *id*\n\n_Contoh_\n\n${command} 5217933016`)
            axios.get(`https://api.lolhuman.xyz/api/pubg/${args[1]}?apikey=${lolkey}`)
            .then(({data}) => {
            let pubg = `*🔎 CHECK NICK PUBG 🔍*

ID : ${args[1]}
Nick : ${data.result}`
            reply(pubg)
            
            })
            .catch((err) => {
                console.log(color('[ ERROR ]', 'red'), err)
                reply(mess.error.api)
                fadly.sendMessage(ownerNumber, { text: `${command} error : ${err}` })
            })
            break
        case prefix+'nickdomino':
            if (!q) return reply(`Gunakan dengan cara ${command} *id*\n\n_Contoh_\n\n${command} 291756557`)
            axios.get(`https://api.lolhuman.xyz/api/higghdomino/${args[1]}?apikey=${lolkey}`)
            .then(({data}) => {
            let domino = `*🔎 CHECK NICK HIGGS DOMINO 🔍*

ID : ${args[1]}
Nick : ${data.result}`
            reply(domino)
            
            })
            .catch((err) => {
                console.log(color('[ ERROR ]', 'red'), err)
                reply(mess.error.api)
                fadly.sendMessage(ownerNumber, { text: `${command} error : ${err}` })
            })
            break

        // Baileys
        case prefix+'fitnah':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (args.length < 2) return mentions(`Gunakan dengan cara ${command} *@tag|pesantarget|pesanbot*\n\n_Contoh_\n\n${command} @${wangsaf.split("@")[0]}|enak ga semalem|enak banget`, [wangsaf], true)
            var org = q.split("|")[0]
            var target = q.split("|")[1];
            var bot = q.split("|")[2];
            if (!org.startsWith('@')) return reply('Tag orangnya')
            if (!target) return reply(`Masukkan pesan target!`)
            if (!bot) return reply(`Masukkan pesan bot!`)
            var mens = parseMention(target)
            addCountCmd('#fitnah', sender, _cmd)
            var msg1 = { key: { fromMe: false, participant: `${parseMention(org)}`, remoteJid: from ? from : '' }, message: { extemdedTextMessage: { text: `${target}`, contextInfo: { mentionedJid: mens }}}}
            var msg2 = { key: { fromMe: false, participant: `${parseMention(org)}`, remoteJid: from ? from : '' }, message: { conversation: `${target}` }}
            fadly.sendMessage(from, { text: bot, mentions: mentioned }, { quoted: mens.length > 2 ? msg1 : msg2 })
            break
	    case prefix+'q': case prefix+'getquotedmsg': case prefix+'getquoted': case prefix+'quoted':
            if (!isQuotedMsg) return reply(`Balas Pesannya!`)
            var data = await store.loadMessage(from, quotedMsg.id)
            if (data.isQuotedMsg !== true) return reply(`The message you replied to contained no reply`)
            var typ = Object.keys(data.message)[0]
            addCountCmd('#getquotedmsg', sender, _cmd)
            if (data.message[typ].contextInfo.quotedMessage.conversation) {
	            reply(`${data.message[typ].contextInfo.quotedMessage.conversation}`)
            } else {
                var anu = data.message[typ].contextInfo.quotedMessage
                fadly.sendMessageFromContent(from, anu)
	        }
	        break
	    case prefix+'fakehidetag':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (args.length < 2) return mentions(`Gunakan dengan cara ${command} *@tag|text*\n\n_Contoh_\n\n${command} @${wangsaf.split("@")[0]}|Halo`, [wangsaf], true)
            var org = q.split("|")[0]
            var teks = q.split("|")[1];
            if (!org.startsWith('@')) return reply('Tag orangnya')
            var mem2 = []
            groupMembers.map( i => mem2.push(i.id) )
            var mens = parseMention(target)
            addCountCmd('#fakehidetag', sender, _cmd)
            var msg1 = { key: { fromMe: false, participant: `${parseMention(org)}`, remoteJid: from ? from : '' }, message: { extemdedTextMessage: { text: `${prefix}hidetag ${teks}`, contextInfo: { mentionedJid: mens }}}}
            var msg2 = { key: { fromMe: false, participant: `${parseMention(org)}`, remoteJid: from ? from : '' }, message: { conversation: `${prefix}hidetag ${teks}` }}
            fadly.sendMessage(from, { text: teks ? teks : '', mentions: mem2 }, { quoted: mens.length > 2 ? msg1 : msg2 })
            break
        case prefix+'react':
            if (!isOwner) return reply(mess.OnlyOwner)
            if (!isQuotedMsg) return reply(`Balas pesannya`)
            if (args.length < 2) return reply(`Masukkan 1 emoji`)
            if (!isEmoji(args[1])) return reply(`Itu bukan emoji!`)
            if (isEmoji(args[1]).length > 1) return reply(`Satu aja emojinya`)
            addCountCmd('#react', sender, _cmd)
            var reactMsg = { reactionMessage: {
                key: {
                    remoteJid: from,
                    fromMe: quotedMsg.fromMe,
                    id: quotedMsg.id,
                    participant: quotedMsg.sender
                    },
                text: args[1]
            }
            }
            fadly.sendMessageFromContent(from, reactMsg)
            break
        case prefix+'setcmd':
            if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
            if (!isQuotedSticker) return reply('Reply stickernya..')
            if (!q) return reply(`Masukan balasannya...\nContoh: ${prefix}setcmd #menu`)
            addCountCmd('#setcmd', sender, _cmd)
            if (checkRespons(msg.quotedMsg.stickerMessage.fileSha256.toString('hex'), responDB) === true) return reply('Key hex tersebut sudah terdaftar di database!')
            addRespons(msg.quotedMsg.stickerMessage.fileSha256.toString('hex'), q, sender, responDB)
            reply(`• *Key:* ${msg.quotedMsg.stickerMessage.fileSha256.toString('hex')}\n• *Action:* ${q}\n\nBerhasil di set`)
            break
        case prefix+'delcmd':
            if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
            if (!isQuotedSticker) return reply('Reply stickernya..')
            addCountCmd('#delcmd', sender, _cmd)
            if (!deleteRespons(msg.quotedMsg.stickerMessage.fileSha256.toString('hex'), responDB)) return reply('Key hex tersebut tidak ada di database')
            deleteRespons(msg.quotedMsg.stickerMessage.fileSha256.toString('hex'), responDB)
            reply(`Berhasil remove key hex ${msg.quotedMsg.stickerMessage.fileSha256.toString('hex')}`)
            break

        // Owners Menu
        case prefix+'exif':
            if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
            addCountCmd('#exif', sender, _cmd)
            var namaPack = q.split('|')[0] ? q.split('|')[0] : q
            var authorPack = q.split('|')[1] ? q.split('|')[1] : ''
            exif.create(namaPack, authorPack)
            reply(`Sukses membuat exif`)
            break
        case prefix+'join':
            if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
            if (args.length < 2) return reply(`Kirim perintah ${command} _linkgrup_`)
            if (!isUrl(args[1])) return reply(mess.error.Iv)
            var url = args[1]
            addCountCmd('#join', sender, _cmd)
            url = url.split('https://chat.whatsapp.com/')[1]
            var data = await fadly.groupAcceptInvite(url)
            reply(jsonformat(data))
            break
        case prefix+'leave':
            if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
            if (!isGroup) return reply(mess.OnlyGrup)
            addCountCmd('#leave', sender, _cmd)
            fadly.groupLeave(from)
            break
        case prefix+'self':{
            if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
            addCountCmd('#self', sender, _cmd)
            fadly.mode = 'self'
            reply('Berhasil berubah ke mode self')
            }
            break
        case prefix+'publik': case prefix+'public':{
            if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
            addCountCmd('#public', sender, _cmd)
            fadly.mode = 'public'
            reply('Berhasil berubah ke mode public')
            }
            break
        case prefix+'setprefix':
            if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
            if (args.length < 2) return reply(`Masukkan prefix\nOptions :\n=> multi\n=> nopref`)
            if (q === 'multi') {
                addCountCmd('#setprefix', sender, _cmd)
                fadly.multi = true
                reply(`Berhasil mengubah prefix ke ${q}`)
            } else if (q === 'nopref') {
                addCountCmd('#setprefix', sender, _cmd)
                fadly.multi = false
                fadly.nopref = true
                reply(`Berhasil mengubah prefix ke ${q}`)
            } else {
                addCountCmd('#setprefix', sender, _cmd)
                fadly.multi = false
                fadly.nopref = false
                fadly.prefa = `${q}`
                reply(`Berhasil mengubah prefix ke ${q}`)
            }
            break
        case prefix+'setpp': case prefix+'setppbot':
            if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
            if (isImage || isQuotedImage) {
                addCountCmd('#setppbot', sender, _cmd)
                var media = await downloadAndSaveMediaMessage('image', 'ppbot.jpeg')
                if (args[1] == '\'panjang\'') {
                    var { img } = await generateProfilePicture(media)
                    await fadly.query({
                        tag: 'iq',
                        attrs: {
                            to: botNumber,
                            type:'set',
                            xmlns: 'w:profile:picture'
                        },
                        content: [
                        {
                            tag: 'picture',
                            attrs: { type: 'image' },
                            content: img
                        }
					    ]
                    })
					fs.unlinkSync(media)
					reply(`Sukses`)
				} else {
					var data = await fadly.updateProfilePicture(botNumber, { url: media })
			        fs.unlinkSync(media)
				    reply(`Sukses`)
				}
            } else {
                reply(`Kirim/balas gambar dengan caption ${command} untuk mengubah foto profil bot`)
            }
            break
        case prefix+'broadcast': case prefix+'bc':
            if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
            if (args.length < 2) return reply(`Kirim perintah ${command} teks`)
            addCountCmd('#broadcast', sender, _cmd)
            var data = await store.chats.all()
            var teks = `${q}`
            for (let i of data) {
                fadly.sendMessage(i.id, { text: teks })
                await sleep(1000)
            }
            reply(`Sukses mengirim pesan siaran kepada ${data.length} chat`)
            break

        case 'bot':
            textImg(`Oh Iya Kak Ada Apa Memanggil Saya Silahkan Ketik ${prefix}menu Untuk Melihat List Di Group Ini`)
            break

default:
if (isCmd) {
    if (args[0].length > 1) {
        var detect = await Dym(command.split(prefix)[1], listCmd)
        if (detect !== null) {
            reply(`Mungkin yang anda maksud adalah ${prefix + detect} abaikan jika salah!`)
        }
        if (!isGroup && detect === null) {
            reply(`Maaf kak fitur ${command} tidak terdaftar di list ${prefix+'menu'}`)
        }
    } else {
        var detect2 = await Dym(args[1], listCmd)
        if (!isGroup && detect2 !== null) {
            reply(`Pastikan antara simbol/prefix jangan dipisah, contoh ${prefix+args[1]}`)
        }
	}
}
}
    } catch (err) {
        console.log(color('[ ERROR ]', 'red'), err)
    }
}
