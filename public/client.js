// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

const ONE_HOUR = 3600000;


window.database = firebase.database();

$(function() {
  setupTimers();
});

function setupTimers() {
  console.log('setting up timers');
  setupTimer('Sandra');
  setupTimer('Mikael');
}

function setupTimer(name) {
  const lowerCaseName = name.toLowerCase();
  const template = $('.timer-template');
  const timer = template
    .clone()
    .removeClass('timer-template')
    .addClass(`timer timer--${lowerCaseName}`)
    .insertAfter(template);
    
  timer.find('.timer__title').text(name);
  
  addEventsToTimer(timer, database.ref(`timers/${lowerCaseName}`));
}

function addEventsToTimer(timer, dbRef) {
  const face = timer.find('.timer__face');
  const startButton = timer.find('.timer__start');
  let currentTime = ONE_HOUR;
  let initialized = false;
  
  face.on('runnerStart', function () {
    startButton.text('Stoppa');
    reportTimeContinously(face, dbRef);
  }).on('runnerStop', function (event, info) {
    startButton.text('Starta');
    dbRef.set(info.time);
  });
  
  dbRef.on('value', snapshot => {
    currentTime = snapshot.val();
    setTimeText();
  });
  
  function setTimeText() {
    const date = new Date(currentTime);
    
    const parts = [date.getSeconds()];
    
    const hours = date.getHours() -1;
    
    if (hours || date.getMinutes()) {
      parts.unshift(date.getMinutes());
    }
    if (hours) {
      parts.unshift(hours);
    }

    const formattedParts = parts.map(part => {
      let partString = part.toString();
      while (partString.length < 2) {
        partString = '0' + partString;
      }
      return partString;
    });
    
    face.text(formattedParts.join(':'));
  }
  
  startButton.click(function () {
    if (!initialized) {
      initialized = true;
      face.runner({
        startAt: currentTime,
        stopAt: 0,
        countdown: true,
        milliseconds: false
      });
    }
   
    face.runner('toggle');
  });
  
  timer.find('.timer__reset').click(() => {
    dbRef.set(ONE_HOUR);
  });
}

function reportTimeContinously(face, dbRef) {
  const info = face.runner('info');
  if (info.running) {
    dbRef.set(info.time);
    setTimeout(() => reportTimeContinously(face, dbRef), 1000);
  }
}
