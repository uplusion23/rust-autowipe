/**
 * BASIC DOCUMENTATION
 *
 * Rate Limit: 240 calls/minute
 *
 * This controller is very light and relies on axios a node package available on npmjs.com,
 * there are tons of features missing and not officially supported. All and every response
 * will be the response given back from the request, it will not be parsed and stored in
 * a friendly way for you to easily handle large projects; in addition, there is absolutely
 * no TS support, therefore you will not receive tips and intellisense with this library.
 */

const axios = require("axios").default;

class PteroController {
  ADDRESS;
  API_PATH = "/api";
  HEADERS = {
    Authorization: "Bearer <API-KEY>",
    "Content-Type": "application/json",
    Accept: "Application/vnd.pterodactyl.v1+json",
  };

  /**
   * Constructor for the PteroController library
   * @param {string} ADDRESS The URL to your Pterodactyl panel.
   * @param {string} API_KEY The API key you obtain from your Pterodactyl panel.
   */
  constructor(ADDRESS, API_KEY) {
    this.ADDRESS = ADDRESS;
    this.HEADERS["Authorization"] = `Bearer ${API_KEY}`;
  }

  async getServers() {
    return new Promise(async (res, rej) => {
      if (!this.ADDRESS)
        return rej("You must specify a valid address for PteroController!");

      const req = await axios
        .request({
          method: "GET",
          headers: this.HEADERS,
          responseType: "json",
          url: `${this.ADDRESS}${this.API_PATH}/client`,
        })
        .catch((err) => {
          return rej(err);
        });

      if (!req || req.status != 200)
        return rej(
          "Response code other than 200, ensure you are providing a valid ID or API key!"
        );

      return res(req.data);
    });
  }

  async getServerDetails(SERVER_ID) {
    return new Promise(async (res, rej) => {
      if (!this.ADDRESS)
        return rej("You must specify a valid address for PteroController!");
      if (!SERVER_ID)
        return rej("You must specify a valid server id for PteroController!");

      const req = await axios
        .request({
          method: "GET",
          headers: this.HEADERS,
          responseType: "json",
          url: `${this.ADDRESS}${this.API_PATH}/client/servers/${SERVER_ID}`,
        })
        .catch((err) => {
          return rej(err);
        });

      if (!req || req.status != 200)
        return rej(
          "Response code other than 200, ensure you are providing a valid ID or API key!"
        );

      return res(req.data);
    });
  }

  async sendServerCommand(SERVER_ID, COMMAND) {
    return new Promise(async (res, rej) => {
      if (!this.ADDRESS)
        return rej("You must specify a valid address for PteroController!");
      if (!SERVER_ID)
        return rej("You must specify a valid server id for PteroController!");
      if (!COMMAND)
        return rej("You must specify a valid command you wish to run!");

      const req = await axios
        .request({
          method: "POST",
          headers: this.HEADERS,
          responseType: "json",
          url: `${this.ADDRESS}${this.API_PATH}/client/servers/${SERVER_ID}/command`,
          data: {
            command: COMMAND,
          },
        })
        .catch((err) => {
          return rej(err);
        });

      if (!req || req.status != 204)
        return rej(
          "Response code other than 204, ensure you are providing a valid ID or API key!"
        );

      return res({ successful: true });
    });
  }

  async getServerFiles(SERVER_ID, DIRECTORY = "") {
    return new Promise(async (res, rej) => {
      if (!this.ADDRESS)
        return rej("You must specify a valid address for PteroController!");
      if (!SERVER_ID)
        return rej("You must specify a valid server id for PteroController!");

      const req = await axios
        .request({
          method: "GET",
          headers: this.HEADERS,
          responseType: "json",
          url: `${this.ADDRESS}${
            this.API_PATH
          }/client/servers/${SERVER_ID}/files/list?directory=${encodeURI(
            DIRECTORY
          )}`,
        })
        .catch((err) => {
          return rej(err);
        });

      if (!req || req.status != 200)
        return rej(
          "Response code other than 200, ensure you are providing a valid ID or API key!"
        );

      return res(req.data);
    });
  }

  async startServer(SERVER_ID) {
    return new Promise(async (res, rej) => {
      if (!this.ADDRESS)
        return rej("You must specify a valid address for PteroController!");
      if (!SERVER_ID)
        return rej("You must specify a valid server id for PteroController!");

      const req = await axios
        .request({
          method: "POST",
          headers: this.HEADERS,
          responseType: "json",
          url: `${this.ADDRESS}${this.API_PATH}/client/servers/${SERVER_ID}/power`,
          data: {
            signal: "start",
          },
        })
        .catch((err) => {
          return rej(err);
        });

      if (!req || req.status != 204)
        return rej(
          "Response code other than 204, ensure you are providing a valid ID or API key!"
        );

      return res({ successful: true });
    });
  }

  async stopServer(SERVER_ID) {
    return new Promise(async (res, rej) => {
      if (!this.ADDRESS)
        return rej("You must specify a valid address for PteroController!");
      if (!SERVER_ID)
        return rej("You must specify a valid server id for PteroController!");

      const req = await axios
        .request({
          method: "POST",
          headers: this.HEADERS,
          responseType: "json",
          url: `${this.ADDRESS}${this.API_PATH}/client/servers/${SERVER_ID}/power`,
          data: {
            signal: "stop",
          },
        })
        .catch((err) => {
          return rej(err);
        });

      if (!req || req.status != 204)
        return rej(
          "Response code other than 204, ensure you are providing a valid ID or API key!"
        );

      return res({ successful: true });
    });
  }

  async killServer(SERVER_ID) {
    return new Promise(async (res, rej) => {
      if (!this.ADDRESS)
        return rej("You must specify a valid address for PteroController!");
      if (!SERVER_ID)
        return rej("You must specify a valid server id for PteroController!");

      const req = await axios
        .request({
          method: "POST",
          headers: this.HEADERS,
          responseType: "json",
          url: `${this.ADDRESS}${this.API_PATH}/client/servers/${SERVER_ID}/power`,
          data: {
            signal: "kill",
          },
        })
        .catch((err) => {
          return rej(err);
        });

      if (!req || req.status != 204)
        return rej(
          "Response code other than 204, ensure you are providing a valid ID or API key!"
        );

      return res({ successful: true });
    });
  }

  async restartServer(SERVER_ID) {
    return new Promise(async (res, rej) => {
      if (!this.ADDRESS)
        return rej("You must specify a valid address for PteroController!");
      if (!SERVER_ID)
        return rej("You must specify a valid server id for PteroController!");

      const req = await axios
        .request({
          method: "POST",
          headers: this.HEADERS,
          responseType: "json",
          url: `${this.ADDRESS}${this.API_PATH}/client/servers/${SERVER_ID}/power`,
          data: {
            signal: "restart",
          },
        })
        .catch((err) => {
          return rej(err);
        });

      if (!req || req.status != 204)
        return rej(
          "Response code other than 204, ensure you are providing a valid ID or API key!"
        );

      return res({ successful: true });
    });
  }

  async getServerFileContents(SERVER_ID, FULL_PATH = "") {
    return new Promise(async (res, rej) => {
      if (!this.ADDRESS)
        return rej("You must specify a valid address for PteroController!");
      if (!FULL_PATH || FULL_PATH.length <= 0)
        return rej("You must specify a valid FULL_PATH!");
      if (!SERVER_ID)
        return rej("You must specify a valid server id for PteroController!");

      const req = await axios
        .request({
          method: "GET",
          headers: this.HEADERS,
          responseType: "json",
          url: `${this.ADDRESS}${
            this.API_PATH
          }/client/servers/${SERVER_ID}/files/contents?file=${encodeURI(
            FULL_PATH
          )}`,
        })
        .catch((err) => {
          return rej(err);
        });

      if (!req || req.status != 200)
        return rej(
          "Response code other than 200, ensure you are providing a valid ID or API key!"
        );

      return res(req.data);
    });
  }

  async deleteServerFiles(SERVER_ID, DIRECTORY = "", FILES = []) {
    return new Promise(async (res, rej) => {
      if (!this.ADDRESS)
        return rej("You must specify a valid address for PteroController!");
      if (!DIRECTORY || DIRECTORY.length <= 0)
        return rej("You must specify a valid DIRECTORY!");
      if (!FILES || FILES.length <= 0)
        return rej("You must provide files that you wish to delete!");
      if (!SERVER_ID)
        return rej("You must specify a valid server id for PteroController!");

      const req = await axios
        .request({
          method: "POST",
          headers: this.HEADERS,
          responseType: "json",
          url: `${this.ADDRESS}${this.API_PATH}/client/servers/${SERVER_ID}/files/delete`,
          data: {
            root: DIRECTORY,
            files: FILES,
          },
        })
        .catch((err) => {
          return rej(err);
        });

      if (!req || req.status != 204)
        return rej(
          "Response code other than 204, ensure you are providing a valid ID or API key!"
        );

      return res({ successful: true });
    });
  }

  async getAllVariables(SERVER_ID) {
    return new Promise(async (res, rej) => {
      if (!this.ADDRESS)
        return rej("You must specify a valid address for PteroController!");
      if (!SERVER_ID)
        return rej("You must specify a valid server id for PteroController!");

      const req = await axios
        .request({
          method: "GET",
          headers: this.HEADERS,
          responseType: "json",
          url: `${this.ADDRESS}${this.API_PATH}/client/servers/${SERVER_ID}/startup`,
        })
        .catch((err) => {
          return rej(err);
        });

      if (!req || req.status != 200)
        return rej(
          "Response code other than 200, ensure you are providing a valid ID or API key!"
        );

      if (!req.data || !req.data.data)
        return rej("We did not receive any values.");

      return res(req.data.data);
    });
  }

  async getVariable(SERVER_ID, NAME) {
    return new Promise(async (res, rej) => {
      if (!this.ADDRESS)
        return rej("You must specify a valid address for PteroController!");
      if (!SERVER_ID)
        return rej("You must specify a valid server id for PteroController!");

      const req = await axios
        .request({
          method: "GET",
          headers: this.HEADERS,
          responseType: "json",
          url: `${this.ADDRESS}${this.API_PATH}/client/servers/${SERVER_ID}/startup`,
        })
        .catch((err) => {
          return rej(err);
        });

      if (!req || req.status != 200)
        return rej(
          "Response code other than 200, ensure you are providing a valid ID or API key!"
        );

      if (!req.data || !req.data.data)
        return rej("We did not receive any values.");

      return res(
        req.data.data.filter((x) => x.attributes.env_variable === NAME)[0]
      );
    });
  }

  async modifyVariable(SERVER_ID, { name, value }) {
    return new Promise(async (res, rej) => {
      if (!this.ADDRESS)
        return rej("You must specify a valid address for PteroController!");
      if (!SERVER_ID)
        return rej("You must specify a valid server id for PteroController!");

      const req = await axios
        .request({
          method: "PUT",
          headers: this.HEADERS,
          responseType: "json",
          url: `${this.ADDRESS}${this.API_PATH}/client/servers/${SERVER_ID}/startup/variable`,
          data: {
            key: name,
            value,
          },
        })
        .catch((err) => {
          return rej(err);
        });

      if (!req || req.status != 200)
        return rej(
          "Response code other than 204, ensure you are providing a valid ID or API key!"
        );

      return res({ successful: true });
    });
  }

  async safeMapWipe(SERVER_ID, BLUEPRINTS = false) {
    return new Promise(async (res, rej) => {
      if (!this.ADDRESS)
        return rej("You must specify a valid address for PteroController!");
      if (!SERVER_ID)
        return rej("You must specify a valid server id for PteroController!");

      const serverSaveFiles = await this.getServerFiles(
        SERVER_ID,
        "/server/rust"
      );

      serverSaveFiles.data.forEach(async (file, index, array) => {
        const filename = file.attributes.name;

        if (filename != "cfg" && filename != "companion.id") {
          if (filename.includes("player.blueprints")) {
            if (BLUEPRINTS)
              await this.deleteServerFiles(SERVER_ID, "/server/rust", [
                filename,
              ]);
          } else {
            await this.deleteServerFiles(SERVER_ID, "/server/rust", [filename]);
          }
        }

        if (index == array.length - 1) return res({ successful: true });
      });
    });
  }
}

module.exports = PteroController;
