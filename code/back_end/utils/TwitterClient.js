const {TwitterApi} = require("twitter-api-v2")

const client = new TwitterApi({
    appKey: "8uxqptM8D2UZuxiRTDpnfEnSC",
    appSecret: "zv8173nVBGMjHnIsIJRRgUcFHUwopCIpBoLMJksaL1khWxdsJe",
    accessToken:"1734599984341807104-HLzgfjRxqxRu5SEO5BqjDp1EI0F5rK",
    accessSecret: "aRcVaDAbTk9MKOA5TNyDJcHPiYDHnbtUkd5CEi3CN3zbP"
})

const rwClient = client.readWrite

module.exports = rwClient