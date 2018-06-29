'user strict'
const path = require('path')
const { app, BrowserWindow, TouchBar, Tray, Menu } = require('electron')
// const { TouchBarButton, TouchBarLabel, TouchBarSpacer } = TouchBar
const { TouchBarButton } = TouchBar
const Stopwatch = require('timer-stopwatch')
const Hrt = require('human-readable-time')
let player = require('play-sound')((opts = {}))

let timeFormat = new Hrt('%mm%:%ss%')
let onTime = 25 * 60000
let offTime = 5 * 60000
let isOffTime = false
let timerRunning = false

const options = {
  refreshRateMS: 1000, // How often the clock should be updated
}

global.onTimer = new Stopwatch(onTime, options)
global.offTimer = new Stopwatch(offTime, options)
global.isOffTime = isOffTime
global.timerRunning = timerRunning

global.onTimer.onTime(function(time) {
  let workTimeRemaining = timeFormat(new Date(time.ms)).toString() // TouchBarButton labels in electron only take strings
  // console.log(timeRemaining) // number of milliseconds past (or remaining);
  timer.label = '🍅 time remaining - ' + workTimeRemaining
  return timer.label
})

// Fires when the timer is done
global.onTimer.onDone(function() {
  player.play('bell.wav', function(err) {
    if (err) throw err
  })
  global.isOffTime = true
  global.timerRunning = false
  global.onTimer.reset(onTime)
  global.offTimer.start()
  global.timerRunning = true
})

global.offTimer.onTime(function(time) {
  let breakTimeRemaining = timeFormat(new Date(time.ms)).toString()
  timer.label = '🍅 time remaining - ' + breakTimeRemaining
  return timer.label
})

global.offTimer.onDone(function() {
  global.isOffTime = false
  timer.label = 'Start Pomodoro! 🍅'
  // counter increments by 2 :/
  // pomodoroCount++
  // pomodoroCounter.label = pomodoroCount
  global.offTimer.reset(offTime)
  player.play('bell.wav', function(err) {
    if (err) throw err
  })
  return timer.label
})

const timer = new TouchBarButton({
  label: 'Start Pomodoro! 🍅',
  backgroundColor: '#ff6347',
  click: () => {
    if (global.isOffTime) {
      global.offTimer.start()
      global.timerRunning = true
    } else {
      global.onTimer.start()
    }
  },
})

const pause = new TouchBarButton({
  label: '⏯',
  backgroundColor: '#4787ff',
  click: () => {
    if (global.isOffTime) {
      global.offTimer.startstop()
    } else {
      global.onTimer.startstop()
    }
  },
})

const reset = new TouchBarButton({
  label: '⏹',
  backgroundColor: '#ff6347',
  click: () => {
    global.onTimer.reset(onTime)
    timer.label = 'Start Pomodoro! 🍅'
  },
})

// const touchBarConfig = () => {
//   if (global.timerRunning) {
//     return [timer, pause, reset]
//   } else {
//     return [timer]
//   }
// }

const touchBar = new TouchBar([timer, pause, reset])

// Menu
const contextMenu = Menu.buildFromTemplate([{ label: 'Quit' }, { role: 'quit' }])
let tray = null
let window

app.once('ready', () => {
  tray = new Tray('icon.png')
  window = new BrowserWindow({
    frame: false,
    titleBarStyle: 'hidden-inset',
    width: 1,
    height: 1,
    backgroundColor: '#000',
    icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
  })
  window.loadURL('about:blank')
  window.setTouchBar(touchBar)
  tray.setContextMenu(contextMenu)
})
