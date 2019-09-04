// This class contains shared functionality for our agents
class MattrHelper {

  constructor(buster, nick, tab) {
    this.buster = buster;
    this.nick = nick;
    this.tab = tab;
  }

  // Opens a tab and handles invalid status codes by exiting immediately.
  async openTab(requestedUrl) {
    const [httpCode, httpStatus, actualUrl] = await this.tab.open(requestedUrl);
    console.log('requestedUrl', requestedUrl);
    console.log('actualUrl', actualUrl);
    console.log('httpCode', httpCode);

    // error out if instagram redirected to login page
    if (actualUrl.includes('instagram.com/accounts/login')) {
      await this.raiseHttpError(302, 'Agent flagged. Login redirect detected.', { httpCode, requestedUrl, actualUrl });
    }

    if ((httpCode >= 300) || (httpCode < 200)) {
      await this.raiseHttpError(httpCode, 'Unexpected HTTP status code encountered.', { httpCode, requestedUrl, actualUrl })
    }
  }

  // throw an exception and stop execution
  async raiseHttpError(httpCode = 1, message = "Execution failed, raised exception.", params = {}) {
    await this.buster.setResultObject({ httpCode, message, params });
    this.nick.exit(1);
  }

}

module.exports = MattrHelper;
