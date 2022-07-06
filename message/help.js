const fs = require("fs");

let setting = JSON.parse(fs.readFileSync('./config.json'))

const more = String.fromCharCode(8206)
const readmore = more.repeat(4001)

function toCommas(x) {
    x = x.toString()
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
    x = x.replace(pattern, "$1,$2");
    return x;
}

exports.allMenu = (ucapanWaktu, pushname, mundur, upload, download, ownerName, botName, jam, tanggal, runtime, isOwner, sender, prefix) => {
    return`${ucapanWaktu} ${pushname !== undefined ? pushname : 'Kak'}

Hitung Mundur Idul Adha
${mundur}

*STATISTICS*
 • Upload : ${upload}
 • Downloads : ${download}

*BOT INFO*
 • Creator : ${ownerName}
 • Bot Name : ${botName}
 • Time : ${jam}
 • Date : ${tanggal}
 • Runtime :
 ${runtime(process.uptime())}

*USER INFO*
 • Name : ${pushname !== undefined ? pushname : '-'}
 • Status : ${isOwner ? 'Owner' : 'Gratisan'}
 • Nomor : ${sender.split("@")[0]}
${readmore}
*MAIN MENU*
 • ${prefix}menu
 • ${prefix}infobot
 • ${prefix}donate
 • ${prefix}dashboard
 • ${prefix}owner

*CONVERTER/TOOLS*
 • ${prefix}sticker
 • ${prefix}stickerwm
 • ${prefix}toimg
 • ${prefix}tovideo
 • ${prefix}tomp3
 • ${prefix}ttp
 • ${prefix}attp
 • ${prefix}nulis

*STORE MENU*
 • ${prefix}list
 • ${prefix}addlist
 • ${prefix}dellist
 • ${prefix}update
 • ${prefix}jeda
 • ${prefix}tambah
 • ${prefix}kurang
 • ${prefix}kali
 • ${prefix}bagi

*PROSES/DONE*
 • proses < reply chat >
 • done < reply chat >
 • ${prefix}setproses
 • ${prefix}changeproses
 • ${prefix}delsetproses
 • ${prefix}setdone
 • ${prefix}changedone
 • ${prefix}delsetdone

*GROUP MENU*
 • ${prefix}afk
 • ${prefix}welcome
 • ${prefix}left
 • ${prefix}setwelcome
 • ${prefix}changewelcome
 • ${prefix}delsetwelcome
 • ${prefix}setleft
 • ${prefix}changeleft
 • ${prefix}delsetleft
 • ${prefix}linkgc
 • ${prefix}setppgc
 • ${prefix}setnamegc
 • ${prefix}setdesc
 • ${prefix}antilink
 • ${prefix}antiwame
 • ${prefix}open
 • ${prefix}close
 • ${prefix}setopen
 • ${prefix}changeopen
 • ${prefix}delsetopen
 • ${prefix}setclose
 • ${prefix}changeclose
 • ${prefix}delsetclose
 • ${prefix}add
 • ${prefix}kick
 • ${prefix}promote
 • ${prefix}demote
 • ${prefix}revoke
 • ${prefix}hidetag

*SEARCH MENU*
 • ${prefix}nickff
 • ${prefix}nickml
 • ${prefix}nickpubg
 • ${prefix}nickdomino

*BAILEYS*
 • ${prefix}fitnah
 • ${prefix}getquoted
 • ${prefix}fakehidetag
 • ${prefix}react
 • ${prefix}setcmd
 • ${prefix}delcmd

*OWNERS MENU*
 • > evalcode
 • x evalcode-2
 • $ executor
 • ${prefix}exif
 • ${prefix}join
 • ${prefix}left
 • ${prefix}self
 • ${prefix}public
 • ${prefix}setprefix
 • ${prefix}setppbot
 • ${prefix}broadcast`
}

exports.donate = (pushname, ownerNumber) => {
    return`\t\t\t\t*💰「 DONATE 」💰*

Hai ${pushname}👋
Kalian bisa mendukung saya agar bot ini tetap up to date dengan:
🏧 081261315167 (OVO/Dana/GoPay)

Berapapun donasi kalian akan sangat berarti 👍

Arigatou!

Contact person Owner:
wa.me/${ownerNumber.split("@")[0]} (Owner)`
}
