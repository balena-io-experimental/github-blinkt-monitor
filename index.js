const _ = require('lodash');
const Blinkt = require('node-blinkt');
const fetch = require('node-fetch');

function getIssueCount() {
  return fetch('https://api.github.com/issues', {
    headers: new fetch.Headers({
      'authorization': 'Basic ' + new Buffer(`${process.env.GITHUB_USER}:${process.env.GITHUB_TOKEN}`).toString('base64')
    })
  })
  .then((response) => {
    if (response.status >= 200 && response.status < 400) {
      return response.json();
    } else {
      return response.json().then((error) => {
        throw new Error(`Bad response from github: ${error.message}`);
      });
    }
  })
  .catch(console.error);
}

leds = new Blinkt();
leds.setup();
leds.clearAll();
leds.sendUpdate();

let existingIssueMarkers = _.range(8).map(() => null);

setInterval(() => {
  getIssueCount().then((issues) => {
    let issueIds = issues.map((issue) => issue.id);

    console.log('Have issues:', issueIds);

    console.log('Existing issues:', existingIssueMarkers);

    issueIds.filter((issueId) => !_.includes(existingIssueMarkers, issueId))
    .forEach((issueId) => {
      existingIssueMarkers.push(issueId);
    });

    existingIssueMarkers = existingIssueMarkers.filter((issueId) => {
      return issueId === null || _.includes(issueIds, issueId);
    });

    console.log('Updated issues:', existingIssueMarkers);
  });
}, 1000);

setInterval(() => {
  let firstNullIndex = existingIssueMarkers.indexOf(null);
  if (firstNullIndex >= 0) existingIssueMarkers.splice(firstNullIndex, 1);
  if (existingIssueMarkers.length < 8) {
    _.range(8 - existingIssueMarkers.length)
    .forEach(() => existingIssueMarkers.push(null));
  }

  existingIssueMarkers.slice(0, 8).forEach((issueId, i) => {
    if (issueId !== null) leds.setPixel(i, 255, 255, 0, 0.1);
    else leds.setPixel(i, 0, 0, 0, 1);
  });

  leds.sendUpdate();
}, 200);