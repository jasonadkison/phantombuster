// This class contains shared functionality for our agents
class MattrHelper {

  constructor(buster, nick, tab) {
    this.buster = buster;
    this.nick = nick;
    this.tab = tab;
  }

  // Opens a tab and handles invalid status codes by exiting immediately.
  async openTab(url) {
    const [httpCode] = await this.tab.open(url);
    if ((httpCode >= 300) || (httpCode < 200)) {
      await this.buster.setResultObject({ httpCode, message: `Url is unavailable. URL: ${url}` });
      this.nick.exit(1);
    }
  }

}

module.exports = MattrHelper;
