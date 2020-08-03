let issMap;
let canvas;

const mappa = new Mappa('Leaflet');

const options = {
    lat: 0,
    lng: 0,
    zoom: 1,
    style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
}

let img;
const api_url = "https://api.wheretheiss.at/v1/satellites/25544";
let latitude = 0;
let longitude = 0;

function preload() {
    img = loadImage('./assets/iss.png');
}

function setup() {
    canvas = createCanvas(640, 640);
    imageMode(CENTER);

    issMap = mappa.tileMap(options);
    issMap.overlay(canvas);

    getIss();
    issMap.onChange(drawIss);
}

function draw() {
}

function drawIss() {
    clear();

    const issPixelLoc = issMap.latLngToPixel(latitude, longitude);
    const zoom = issMap.zoom() + 1;
    image(img, issPixelLoc.x, issPixelLoc.y, 50 * zoom, 32 * zoom);
}

async function getIss() {
    const response = await fetch(api_url);
    const data = await response.json();

    latitude = data['latitude'];
    longitude = data['longitude'];

    document.getElementById('lat').textContent = latitude;
    document.getElementById('long').textContent = longitude;
}