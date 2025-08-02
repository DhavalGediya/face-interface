function userLog(interactionEvent, uid, projectId, projectName) {
  return null;
  const serverTimeObj = {
    serverDate: "",
    serverOffset: "",
  };

  axios.get(`https://ptpvr.com/serverTime`).then((res) => {
    // server returns a json object with a date property.
    serverTimeObj.serverDate = res.data.date;
    serverTimeObj.serverOffset = moment(res.data.date).diff(new Date());

    const temp = moment().add(
      "milliseconds",
      moment(res.data.date).diff(new Date())
    );
    const temp1 = temp._d;
    const serverDate = new Date(temp1).getTime();

    // alert(new Date(temp1).getTime())

    let queryString = window.location.search;
    let query_source = new URLSearchParams(queryString);
    let utm_source = query_source.get("utm_source");
    let utm_medium = query_source.get("utm_medium");
    let utm_content = query_source.get("utm_content");
    let utm_campaign = query_source.get("utm_campaign");
    let utm_term = query_source.get("utm_term");

    var module = {
      options: [],
      header: [
        navigator.platform,
        navigator.userAgent,
        navigator.appVersion,
        navigator.vendor,
        window.opera,
      ],
      dataos: [
        {
          name: "Windows Phone",
          value: "Windows Phone",
          version: "OS",
        },
        {
          name: "Windows",
          value: "Win",
          version: "NT",
        },
        {
          name: "iPhone",
          value: "iPhone",
          version: "OS",
        },
        {
          name: "iPad",
          value: "iPad",
          version: "OS",
        },
        {
          name: "Kindle",
          value: "Silk",
          version: "Silk",
        },
        {
          name: "Android",
          value: "Android",
          version: "Android",
        },
        {
          name: "PlayBook",
          value: "PlayBook",
          version: "OS",
        },
        {
          name: "BlackBerry",
          value: "BlackBerry",
          version: "/",
        },
        {
          name: "Macintosh",
          value: "Mac",
          version: "OS X",
        },
        {
          name: "Linux",
          value: "Linux",
          version: "rv",
        },
        {
          name: "Palm",
          value: "Palm",
          version: "PalmOS",
        },
      ],
      databrowser: [
        {
          name: "Chrome",
          value: "Chrome",
          version: "Chrome",
        },
        {
          name: "Firefox",
          value: "Firefox",
          version: "Firefox",
        },
        {
          name: "Safari",
          value: "Safari",
          version: "Version",
        },
        {
          name: "Internet Explorer",
          value: "MSIE",
          version: "MSIE",
        },
        {
          name: "Opera",
          value: "Opera",
          version: "Opera",
        },
        {
          name: "BlackBerry",
          value: "CLDC",
          version: "CLDC",
        },
        {
          name: "Mozilla",
          value: "Mozilla",
          version: "Mozilla",
        },
      ],
      init: function () {
        var agent = this.header.join(" "),
          os = this.matchItem(agent, this.dataos),
          browser = this.matchItem(agent, this.databrowser);

        return {
          os: os,
          browser: browser,
        };
      },
      matchItem: function (string, data) {
        var i = 0,
          j = 0,
          html = "",
          regex,
          regexv,
          match,
          matches,
          version;

        for (i = 0; i < data.length; i += 1) {
          regex = new RegExp(data[i].value, "i");
          match = regex.test(string);
          if (match) {
            regexv = new RegExp(data[i].version + "[- /:;]([\\d._]+)", "i");
            matches = string.match(regexv);
            version = "";
            if (matches) {
              if (matches[1]) {
                matches = matches[1];
              }
            }
            if (matches) {
              matches = matches.split(/[._]+/);
              for (j = 0; j < matches.length; j += 1) {
                if (j === 0) {
                  version += matches[j] + ".";
                } else {
                  version += matches[j];
                }
              }
            } else {
              version = "0";
            }
            return {
              name: data[i].name,
              version: parseFloat(version),
            };
          }
        }
        return {
          name: "unknown",
          version: 0,
        };
      },
    };

    var e = module.init();
    if (e.browser.name === "Safari") {
      var isSafari =
        /(Mac|iPhone|iPod|iPad)/i.test(window.navigator.userAgent) &&
        /WebKit/i.test(window.navigator.userAgent) &&
        !/(CriOS|FxiOS|OPiOS|mercury)/i.test(window.navigator.userAgent);
      var isChrome = navigator.userAgent.indexOf("Chrome") > -1;

      if (!isSafari || isChrome) {
        e.browser.name = "Chrome";
      }
    }

    // const URL = `https://ptpvr.com/userlogs`;
    let ip_address = "";

    let myipPromise = new Promise((resolve, reject) => {
      fetch("https://api.ipify.org/?format=json")
        .then((results) => results.json())
        .then((data) => {
          ip_address = data.ip.toString();
          resolve();
        })
        .catch((err) => {
          errorLog("Ip get", err, "");
        });
    });

    // myipPromise
    //     .then(() => {
    let data = {
      name: "",
      email: localStorage.getItem("emailId"),
      datetime: serverDate,
      productType: "Melzo Noor",
      interactionEvent: interactionEvent,
      osName: e.os.name,
      osVersion: e.os.version,
      browser: e.browser.name,
      browserVersion: e.browser.version,
      navigatorUseragent: navigator.userAgent,
      navigatorAppVersion: navigator.appVersion,
      navigatorPlatform: navigator.platform,
      navigatorVendor: navigator.vendor,
      utm_source: utm_source,
      utm_campaign: utm_campaign,
      utm_medium: utm_medium,
      utm_content: utm_content,
      utm_term: utm_term,
      ipAddress: ip_address,
      uid: uid,
      projectId: projectId,
      projectName: projectName,
    };

    console.log("data :: ", data);

    //             axios(URL, {
    //                     method: "POST",
    //                     data
    //                 })
    //                 .then(response => {})
    //                 .catch(error => {
    //                     throw error;
    //                 });
    //         })
    //         .catch((err) => {
    //             throw err;
    //         })

    // }).catch(err => {
    //     errorLog("Enter UserLog Error", err, "")
  });
}

function errorLog(interactionEvent, errorMessage, otherMessage) {
  return null;
  const serverTimeObj = {
    serverDate: "",
    serverOffset: "",
  };

  axios
    .get(`https://ptpvr.com/serverTime`)
    .then((res) => {
      // server returns a json object with a date property.
      serverTimeObj.serverDate = res.data.date;
      serverTimeObj.serverOffset = moment(res.data.date).diff(new Date());

      const temp = moment().add(
        "milliseconds",
        moment(res.data.date).diff(new Date())
      );
      const temp1 = temp._d;
      const serverDate = new Date(temp1).getTime();

      // alert(new Date(temp1).getTime())

      let queryString = window.location.search;
      let query_source = new URLSearchParams(queryString);
      let utm_source = query_source.get("utm_source");
      let utm_medium = query_source.get("utm_medium");
      let utm_content = query_source.get("utm_content");
      let utm_campaign = query_source.get("utm_campaign");
      let utm_term = query_source.get("utm_term");

      var module = {
        options: [],
        header: [
          navigator.platform,
          navigator.userAgent,
          navigator.appVersion,
          navigator.vendor,
          window.opera,
        ],
        dataos: [
          {
            name: "Windows Phone",
            value: "Windows Phone",
            version: "OS",
          },
          {
            name: "Windows",
            value: "Win",
            version: "NT",
          },
          {
            name: "iPhone",
            value: "iPhone",
            version: "OS",
          },
          {
            name: "iPad",
            value: "iPad",
            version: "OS",
          },
          {
            name: "Kindle",
            value: "Silk",
            version: "Silk",
          },
          {
            name: "Android",
            value: "Android",
            version: "Android",
          },
          {
            name: "PlayBook",
            value: "PlayBook",
            version: "OS",
          },
          {
            name: "BlackBerry",
            value: "BlackBerry",
            version: "/",
          },
          {
            name: "Macintosh",
            value: "Mac",
            version: "OS X",
          },
          {
            name: "Linux",
            value: "Linux",
            version: "rv",
          },
          {
            name: "Palm",
            value: "Palm",
            version: "PalmOS",
          },
        ],
        databrowser: [
          {
            name: "Chrome",
            value: "Chrome",
            version: "Chrome",
          },
          {
            name: "Firefox",
            value: "Firefox",
            version: "Firefox",
          },
          {
            name: "Safari",
            value: "Safari",
            version: "Version",
          },
          {
            name: "Internet Explorer",
            value: "MSIE",
            version: "MSIE",
          },
          {
            name: "Opera",
            value: "Opera",
            version: "Opera",
          },
          {
            name: "BlackBerry",
            value: "CLDC",
            version: "CLDC",
          },
          {
            name: "Mozilla",
            value: "Mozilla",
            version: "Mozilla",
          },
        ],
        init: function () {
          var agent = this.header.join(" "),
            os = this.matchItem(agent, this.dataos),
            browser = this.matchItem(agent, this.databrowser);

          return {
            os: os,
            browser: browser,
          };
        },
        matchItem: function (string, data) {
          var i = 0,
            j = 0,
            html = "",
            regex,
            regexv,
            match,
            matches,
            version;

          for (i = 0; i < data.length; i += 1) {
            regex = new RegExp(data[i].value, "i");
            match = regex.test(string);
            if (match) {
              regexv = new RegExp(data[i].version + "[- /:;]([\\d._]+)", "i");
              matches = string.match(regexv);
              version = "";
              if (matches) {
                if (matches[1]) {
                  matches = matches[1];
                }
              }
              if (matches) {
                matches = matches.split(/[._]+/);
                for (j = 0; j < matches.length; j += 1) {
                  if (j === 0) {
                    version += matches[j] + ".";
                  } else {
                    version += matches[j];
                  }
                }
              } else {
                version = "0";
              }
              return {
                name: data[i].name,
                version: parseFloat(version),
              };
            }
          }
          return {
            name: "unknown",
            version: 0,
          };
        },
      };

      var e = module.init();
      if (e.browser.name === "Safari") {
        var isSafari =
          /(Mac|iPhone|iPod|iPad)/i.test(window.navigator.userAgent) &&
          /WebKit/i.test(window.navigator.userAgent) &&
          !/(CriOS|FxiOS|OPiOS|mercury)/i.test(window.navigator.userAgent);
        var isChrome = navigator.userAgent.indexOf("Chrome") > -1;

        if (!isSafari || isChrome) {
          e.browser.name = "Chrome";
        }
      }

      let ip_address = "";

      let myipPromise = new Promise((resolve, reject) => {
        fetch("https://api.ipify.org/?format=json")
          .then((results) => results.json())
          .then((data) => {
            ip_address = data.ip.toString();
            resolve();
          })
          .catch((err) => {
            errorLog("Ip get", err, "");
          });
      });

      //   myipPromise
      //     .then(() => {
      let data = {
        name: "",
        mobile: "",
        expo: "",
        email: localStorage.getItem("emailId"),
        dateTime: serverDate,
        productType: "Melzo Noor",
        productName: "Melzo Noor",
        interactionEvent: interactionEvent, // 'Ar Hand ',
        osName: e.os.name,
        osVersion: e.os.version,
        browser: e.browser.name,
        browserVersion: e.browser.version,
        navigatorUseragent: navigator.userAgent,
        navigatorAppVersion: navigator.appVersion,
        navigatorPlatform: navigator.platform,
        navigatorVendor: navigator.vendor,
        utm_source: utm_source,
        utm_campaign: utm_campaign,
        utm_medium: utm_medium,
        utm_content: utm_content,
        utm_term: utm_term,
        ipAddress: ip_address,
        uid: uid,
        projectId: finalProjectId,
        projectName: projectName,
        errorMessage: errorMessage.message,
        otherMessage: otherMessage,
      };
      console.log("data :: ", data);

      //       axios(URL, {
      //         method: "POST",
      //         data,
      //       })
      //         .then((response) => {
      //           // console.log(response.data)
      //         })
      //         .catch((error) => {
      //           throw error;
      //         });
      //     })
      //     .catch((err) => {
      //       throw err;
      //     });
    })
    .catch((err) => {
      console.error(err.message);
    });
}
