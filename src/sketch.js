let img;
const api_url = "https://api.wheretheiss.at/v1/satellites/25544/?units=miles";
let latitude = 0;
let longitude = 0;

let issMap;
let canvas;
const mappa = new Mappa('Leaflet');

function preload() {
    img = loadImage('./icons/iss.png');
}

let mapDiv;

function setup() {
    mapDiv = document.getElementById('map');

    canvas = createCanvas(mapDiv.offsetWidth, mapDiv.offsetHeight);
    canvas.parent('map');
    imageMode(CENTER);
    angleMode(DEGREES);

    getIss().then(createMap);

    setInterval(function () {
        getIss().then(drawIss);
    }, 1000); // Calls where the iss at api every 1 second
}

function createMap() {
    const options = {
        lat: latitude,
        lng: longitude,
        zoom: 2.5,
        style: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    };

    issMap = mappa.tileMap(options);
    issMap.overlay(canvas);
    issMap.onChange(drawIss);
}

function draw() {
}

function drawIss() {
    clear();

    const groundTrack = getGroundTrack();

    stroke(252, 226, 5);
    strokeWeight(3);
    noFill();
    for (let i = 0; i < groundTrack.length; i++) {
        if (i < groundTrack.length - 1 && groundTrack[i].y < groundTrack[i + 1].y) {
            const p1 = issMap.latLngToPixel(groundTrack[i].x, groundTrack[i].y);
            const p2 = issMap.latLngToPixel(groundTrack[i + 1].x, groundTrack[i + 1].y);
            line(p1.x, p1.y, p2.x, p2.y);
        }
    }

    const issPixelLoc = issMap.latLngToPixel(latitude, longitude);
    const zoom = issMap.zoom() + 1;
    image(img, issPixelLoc.x, issPixelLoc.y, 50 * zoom, 32 * zoom);
}

async function getIss() {
    const response = await fetch(api_url);
    const data = await response.json();

    latitude = data['latitude'];
    longitude = data['longitude'];

    document.getElementById('lat').textContent = latitude.toLocaleString(undefined, {maximumFractionDigits: 2});
    document.getElementById('long').textContent = longitude.toLocaleString(undefined, {maximumFractionDigits: 2});
    document.getElementById('alt').textContent = data['altitude'].toLocaleString(undefined, {maximumFractionDigits: 2});
    document.getElementById('vel').textContent = data['velocity'].toLocaleString(undefined, {maximumFractionDigits: 2});
}

const orbits = 3; // Number of orbits to calculate
const timeStep = 180; // Amount of steps to calculate per total degrees
const degreesPerSecond = 360 / 86400; // The amount of degrees the earth rotates per second
const T = 5580; // Period of ISS
const inclination = 51.64; // Degrees of inclination of the iss' orbit
const earthRotationPerOrbit = T * degreesPerSecond; // Amount earth rotates per orbit
function getGroundTrack() {
    const phase = asin(latitude / inclination); // Current phase shift of latitude of the ISS
    const deltaTheta = orbits * 360 / timeStep;
    const deltaRotation = earthRotationPerOrbit / timeStep;

    let groundTrack = [];
    let long = longitude;
    for (let theta = 0; theta < orbits * 360; theta += deltaTheta) {
        let lat = inclination * sin(phase + theta);

        groundTrack.push(createVector(lat, long));
        long += deltaTheta - deltaRotation;
        if (long > 180) {
            long -= 360;
        }
    }

    return groundTrack;
}