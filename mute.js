// buat file di folder database, isi file nya []
let mute = JSON.parse(fs.readFileSync('./database/mute.json'));

// taruh di kaysa.js
const isMuted = isGroup ? mute.includes(from) ? true : false : false

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