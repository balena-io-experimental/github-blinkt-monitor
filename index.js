const _ = require('_');
const Blinkt = require('node-blinkt');
const fetch = require('node-fetch');

function getIssueCount() {
  return fetch('https://api.github.com/issues', {
    headers: new fetch.Headers({
      'authorization': 'Basic ' + new Buffer(`${process.env.GITHUB_USER}:${process.env.GITHUB_TOKEN}`).toString('base64')
    })
  }).then((response) => response.json()).then((issues) => {
    console.log(issues.length);
  }).catch(console.error);
}

leds = new Blinkt();
leds.setup();
leds.clearAll();
leds.sendUpdate();

setInterval(() => {
  getIssueCount().then((issueCount) => {
    console.log('Have', issueCount, 'issues');

    // TODO: Handle > 8 issues
    _.range(issueCount).forEach((i) => {
      leds.setPixel(i, 255, 255, 0, 1);
    });

    leds.sendUpdate();
  });
}, 1000);