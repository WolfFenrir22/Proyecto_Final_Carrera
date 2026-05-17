const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("hacadisAPI", {
  appName: "HACADIS"
});