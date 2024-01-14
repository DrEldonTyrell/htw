const seedrandom = require('seedrandom')

async function pageHandler(req, res) {
  res.renderPage({
    page: 'decode-me',
    heading: 'Decode Me!',
    backButton: false,
    content: `
      <h3 style="margin-top:32px;">Level 4</h3>

      <p><a href="/map">zurück</a> | <span style="color:lightgray;cursor:pointer;">springe zu Level</span></p>

      <p style="margin-top:32px;">Ermittle die Antwort aus der empfangenen Nachricht. Alle 10 Level steigert sich die Schwierigkeit.</p>
      
      <p>Schaue in den Quellcode um zu erfahren, wie man die Aufgabe automatisiert.</p>

      <p style="padding:12px;background-color:#171717;border-radius:12px;"><code>sdsfdsfsfss</code></p>

      <form autocomplete="off" method="post" id="challenge_form">
        <input id="challenge_answer" type="text" name="answer" style="height:32px">
        <input type="submit" id="challenge_submit" value="Los" style="height:32px;line-height:1;vertical-align:bottom;">
      </form>
    `,
  })
}

const levelConfig = {
  0: {},
  1: { ops: ['decimal'] },
  2: { ops: ['hex'] },
  3: { ops: ['base64'] },
  4: { ops: ['binary'] },
  5: { ops: ['hex', 'decimal'] },
  6: { ops: ['hex', 'base64'] },
  7: { ops: ['base64', 'decimal'] },
  8: { ops: ['hex', 'decimal', 'base64'] },
  9: { ops: ['hex', 'decimal', 'base64', 'binary'] },
}

const adjectives = [
  'sichere',
  'unsichere',
  'coole',
  'uncoole',
  'krasse',
  'nette',
  'verrückte',
  'liebevolle',
  'große',
  'kleine',
  'bekannte',
  'unbekannte',
]

const nouns = [
  'Maus',
  'Tastatur',
  'Festplatte',
  'Taste',
  'Webcam',
  'Datei',
  'Mail',
  'Sicherheitslücke',
  'IT-Sicherheit',
  'Firewall',
  'CPU',
  'GPU',
  'Programmiersprache',
]

function generateSolution1(rng) {
  return `${selectFromArray(adjectives, rng)}_${selectFromArray(
    nouns,
    rng
  )}_${Math.floor(rng() * 900 + 100)}`
}

// generates a new riddle for the given difficulty level
function generate(level, seed) {
  const rng = seedrandom(seed)
  if (level >= 100 || level < 0) {
    return 'out of range' // maybe some better error message
  }

  const config = levelConfig[Math.floor(level / 10)]

  let solution = generateSolution1(rng)

  let msg = `Die Antwort lautet ${solution}.`

  if (Array.isArray(config.ops)) {
    const ops = config.ops.slice(0)
    shuffleArray(ops, rng)
    for (const op of ops) {
      if (op == 'decimal') {
        msg = new TextEncoder().encode(msg).join(' ')
      }
      if (op == 'hex') {
        msg = Array.from(new TextEncoder().encode(msg))
          .map((x) => {
            let val = x.toString(16)
            while (val.length < 2) {
              val = '0' + val
            }
            return val
          })
          .join(' ')
      }
      if (op == 'base64') {
        msg = Buffer.from(msg).toString('base64')
      }
      if (op == 'binary') {
        msg = Array.from(new TextEncoder().encode(msg))
          .map((x) => {
            let val = x.toString(2)
            while (val.length < 8) {
              val = '0' + val
            }
            return val
          })
          .join(' ')
      }
    }
  }

  return { solution, msg }
}

// helper

function selectFromArray(arr, rng) {
  return arr[Math.floor(arr.length * rng())]
}

const shuffleArray = (array, rng) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

module.exports = (App) => {
  App.express.get('/decode-me', pageHandler)
}
