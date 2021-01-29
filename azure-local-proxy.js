const fetch = require("node-fetch");
const express = require("express");

const PAT_TOKEN = "gxvc65a64osoezhsdv3fi5k3oxqxmsqsebclwshmtrrdz7ujh2wq";
const BASE_URL = "https://tfs.astralnalog.ru/tfs/DefaultCollection/";

const expressApp = express();

(async () => {
  fetch(`${BASE_URL}AstralWebReport`)
})();