
// Original source by Scribe Analytics Team
// Copyright (c) 2013, Scribe Analytics Team
// All rights reserved.

// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:

//   * Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//   * Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//   * Neither the name of the Scribe Analytics nor the
//     names of its contributors may be used to endorse or promote products
//     derived from this software without specific prior written permission.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL SCRIBE ANALYTICS TEAM BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.



if (typeof Scribe === 'undefined') {
  /**
   * Constructs a new Scribe Analytics tracker.
   *
   * @constructor Scribe
   *
   * @param options.tracker   The tracker to use for tracking events.
   *                          Must be: function(collection, event).
   *
   */

  var Scribe = function(options) {
    if (!(this instanceof Scribe)) return new Scribe(config);

    options = options || {};
    //console.log(options.config.mode);
    //console.log(options.tracker);
    //debugger;
    this.options    = options.config;
    this.tracker    = options.tracker;
    this.randomTracker = options.randomTracker;
    this.initialize(); 
  };

  (function(Scribe) {
    Scribe.prototype.options = function() {
      return this.options;
    };




// detect browser 

    // Browser Detection
    var BrowserDetect = (function() {
    var BrowserDetect = {
      init: function () {
        this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
        this.version = this.searchVersion(navigator.userAgent) || 
          this.searchVersion(navigator.appVersion) || 
          "an unknown version";
        this.OS = this.searchString(this.dataOS) || "an unknown OS";
      },
      searchString: function (data) {
        for (var i=0;i<data.length;i++) {
          var dataString = data[i].string;
          var dataProp = data[i].prop;
          this.versionSearchString = data[i].versionSearch || data[i].identity;
          if (dataString) {
            if (dataString.indexOf(data[i].subString) != -1)
              return data[i].identity;
          }
          else if (dataProp)
            return data[i].identity;
        }
      },
      searchVersion: function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index == -1) return;
        return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
      },
      dataBrowser: [
        {
          string: navigator.userAgent,
          subString: "Chrome",
          identity: "Chrome"
        },
        {   string: navigator.userAgent,
          subString: "OmniWeb",
          versionSearch: "OmniWeb/",
          identity: "OmniWeb"
        },
        {
          string: navigator.vendor,
          subString: "Apple",
          identity: "Safari",
          versionSearch: "Version"
        },
        {
          prop: window.opera,
          identity: "Opera",
          versionSearch: "Version"
        },
        {
          string: navigator.vendor,
          subString: "iCab",
          identity: "iCab"
        },
        {
          string: navigator.vendor,
          subString: "KDE",
          identity: "Konqueror"
        },
        {
          string: navigator.userAgent,
          subString: "Firefox",
          identity: "Firefox"
        },
        {
          string: navigator.vendor,
          subString: "Camino",
          identity: "Camino"
        },
        {   // for newer Netscapes (6+)
          string: navigator.userAgent,
          subString: "Netscape",
          identity: "Netscape"
        },
        {
          string: navigator.userAgent,
          subString: "MSIE",
          identity: "Explorer",
          versionSearch: "MSIE"
        },
        {
          string: navigator.userAgent,
          subString: "Gecko",
          identity: "Mozilla",
          versionSearch: "rv"
        },
        {     // for older Netscapes (4-)
          string: navigator.userAgent,
          subString: "Mozilla",
          identity: "Netscape",
          versionSearch: "Mozilla"
        }
      ],
      dataOS : [
        {
          string: navigator.platform,
          subString: "Win",
          identity: "Windows"
        },
        {
          string: navigator.platform,
          subString: "Mac",
          identity: "Mac"
        },
        {
             string: navigator.userAgent,
             subString: "iPod",
             identity: "iPod"
        },
        {
             string: navigator.userAgent,
             subString: "iPad",
             identity: "iPad"
        },
        {
             string: navigator.userAgent,
             subString: "iPhone",
             identity: "iPhone"
        },      
        {
          string: navigator.platform,
          subString: "Linux",
          identity: "Linux"
        }
      ]

    };
    BrowserDetect.init();
    return BrowserDetect;})();





//Geolocation
    var Geo = {};

    Geo.geoip = function(success, failure) {
      // MaxMind GeoIP2 JavaScript API:
      if (typeof geoip2 !== 'undefined') {
        geoip2.city(function(results) {
          success({
            latitude:   success.location.latitude,
            longitude:  success.location.longitude
          });
        }, failure, {
          timeout:                  2000,
          w3c_geolocation_disabled: true
        });
      }
    };

    var Util = {};

    Util.copyFields = function(source, target) {

      /**/
      var createDelegate = function(source, value) {
        return function() {
          return value.apply(source, arguments);
        };
      };

      target = target || {};

      var key, value;

      for (key in source) {
        if (! /layerX|Y/.test(key)) {
          value = source[key];

          if (typeof value === 'function') {
            // Bind functions to object being copied (???):
            target[key] = createDelegate(source, value);
          } else {
            target[key] = value;
          }
        }
      }

      return target;
    };




  /*
    merges two arrays, 
    o2 is given higher priority, 
    o1 is the default case most times, 
    o2 is set by users during intialization

    Example: 
    o2 = {"key1": "key2", "key2": "key1"}

    o1 = {"key1": "key1", "key2": "key2", "key3": "key3"}

    Function call:
    Util.merge(o1,o2)

    return:
    {"key1": "key2", "key2": "key1", "key3": "key3"}
  */  
    Util.merge = function(o1, o2) {
      var r, key, index;
      if (o1 === undefined) return o1;// doubt if this should be o2
      else if (o2 === undefined) return o1;
      else if (o1 instanceof Array && o2 instanceof Array) {
        r = [];
        // Copy
        for (index = 0; index < o1.length; index++) {
          r.push(o1[index]);
        }
        // Merge
        for (index = 0; index < o2.length; index++) {
          if (r.length > index) {
            r[index] = Util.merge(r[index], o2[index]);
          } else {
            r.push(o2[index]);
          }
        }
        return r;
      } else if (o1 instanceof Object && o2 instanceof Object) {
        r = {};
        // Copy:
        for (key in o1) {
          r[key] = o1[key];
        }
        // Merge:
        for (key in o2) {
          if (r[key] !== undefined) {
            r[key] = Util.merge(r[key], o2[key]);
          } else {
            r[key] = o2[key];
          }
        }
        return r;
      } else {
        return o2;
      }
    };
    // converts obj like var to
    Util.toObject = function(olike) {
      var o = {}, key;

      for (key in olike) {
        o[key] = olike[key];
      }

      return o;
    };

    Util.genGuid = function() {
      var s4 = function() {
        return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
      };

      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
             s4() + '-' + s4() + s4() + s4();
    };

    Util.parseQueryString = function(qs) {
      var pairs = {};

      if (qs.length > 0) {
        var query = qs.charAt(0) === '?' ? qs.substring(1) : qs;

        if (query.length > 0) {
          var vars = query.split('&');
          for (var i = 0; i < vars.length; i++) {
            if (vars[i].length > 0) {
              var pair = vars[i].split('=');

              try {            
                var name = decodeURIComponent(pair[0]);
                var value = (pair.length > 1) ? decodeURIComponent(pair[1]) : 'true';

                pairs[name] = value; 
              } catch (e) { }
            }
          }
        }
      }
      return pairs;
    };

    Util.unparseQueryString = function(qs) {
      var kvs = [], k, v;
      for (k in qs) {
        if (!qs.hasOwnProperty || qs.hasOwnProperty(k)) {
          v = qs[k];

          kvs.push(
            encodeURIComponent(k) + '=' + encodeURIComponent(v)
          );
        }
      }
      var string = kvs.join('&');

      if (string.length > 0) return '?' + string;
      else return '';
    };

    Util.size = function(v) {
      if (v === undefined) return 0;
      else if (v instanceof Array) return v.length;
      else if (v instanceof Object) {
        var size = 0;
        for (var key in v) {
          if (!v.hasOwnProperty || v.hasOwnProperty(key)) ++size;
        }
        return size;
      } else return 1;
    };

    Util.mapJson = function(v, f) {
      var vp, vv;
      if (v instanceof Array) {
        vp = [];
        for (var i = 0; i < v.length; i++) {
          vv = Util.mapJson(v[i], f);

          if (Util.size(vv) > 0) vp.push(vv);
        }
        return vp;
      } else if (v instanceof Object) {
        vp = {};
        for (var k in v) {
          vv = Util.mapJson(v[k], f);

          if (Util.size(vv) > 0) vp[k] = vv;
        }
        return vp;
      } else return f(v);
    };

    Util.jsonify = function(v) {
      return Util.mapJson(v, function(v) {
        if (v === '') return undefined;
        else {
          var r;
          try {
            r = JSON.parse(v);
          } catch (e) {
            r = v;
          }

          return r;
        }
      });
    };

    Util.undup = function(f, cutoff) {
      cutoff = cutoff || 250;

      var lastInvoked = 0;
      return function() {
        var curTime = (new Date()).getTime();
        var delta = curTime - lastInvoked;

        if (delta > cutoff) {
          lastInvoked = curTime;

          return f.apply(this, arguments);
        } else {
          return undefined;
        }
      };
    };

    Util.parseUrl = function(url) {
      var l = document.createElement("a");
      l.href = url;
      if (l.host === '') {
        l.href = l.href;
      }
      return {
        hash:     l.hash,
        host:     l.host,
        hostname: l.hostname,
        pathname: l.pathname,
        protocol: l.protocol,
        query:    Util.parseQueryString(l.search)
      };
    };

    Util.unparseUrl = function(url) {
      return (url.protocol || '') + 
             '//' + 
             (url.host || '') + 
             (url.pathname || '') +
             Util.unparseQueryString(url.query) + 
             (url.hash || '');
    };

    Util.equals = function(v1, v2) {
      var leftEqualsObject = function(o1, o2) {
        for (var k in o1) {
          if (!o1.hasOwnProperty || o1.hasOwnProperty(k)) {
            if (!Util.equals(o1[k], o2[k])) return false;
          }
        }
        return true;
      };

      if (v1 instanceof Array) {
        if (v2 instanceof Array) {
          if (v1.length !== v2.length) return false;

          for (var i = 0; i < v1.length; i++) {
            if (!Util.equals(v1[i], v2[i])) {
              return false;
            }
          }

          return true;
        } else {
          return false;
        } 
      } else if (v1 instanceof Object) {
        if (v2 instanceof Object) {
          return leftEqualsObject(v1, v2) && leftEqualsObject(v2, v1);
        } else {
          return false;
        }
      } else {
        return v1 === v2;
      }
    };

    Util.isSamePage = function(url1, url2) {
      url1 = url1 instanceof String ? Util.parseUrl(url1) : url1;
      url2 = url2 instanceof String ? Util.parseUrl(url2) : url2;

      // Ignore the hash when comparing to see if two pages represent the same resource:
      return url1.protocol === url2.protocol &&
             url1.host     === url2.host &&
             url1.pathname === url2.pathname &&
             Util.equals(url1.query, url2.query);
    };

    Util.qualifyUrl = function(url) {
      var escapeHTML = function(s) {
        return s.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');
      };

      var el= document.createElement('div');
      el.innerHTML= '<a href="'+escapeHTML(url)+'">x</a>';
      return el.firstChild.href;
    };

    Util.padLeft = function(n, p, c) {
      var pad_char = typeof c !== 'undefined' ? c : '0';
      var pad = new Array(1 + p).join(pad_char);
      return (pad + n).slice(-pad.length);
    };


    // for session storage 
    // session === visit

    Util.setCookie = function(name, value, ttl) {
        //console.log('name:'+name+'value:'+value+'ttl:'+ttl)
      var expires = "";
      var cookieDomain = "";
      if (ttl) {
        var date = new Date();
        date.setTime(date.getTime() + (ttl * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
      }
      if (document.domain) {
        cookieDomain = "; domain=" + document.domain;
      }
      //console.log(value);
      document.cookie = name + "=" + value;
      //document.cookie = name + "=" + value + expires + cookieDomain + "; path=/";
    }

    Util.getCookie = function(name) {
      var i, c;
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for (i = 0; i < ca.length; i++) {
        c = ca[i];
        while (c.charAt(0) === ' ') {
          c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
          return c.substring(nameEQ.length, c.length);
        }
      }
      return null;
    }



    // Util.destroyCookie = function(name) {
    //   setCookie(name, "", -1);
    // }


    var DomUtil = {};

    DomUtil.getFormData = function(node) {
      var acc = {};

      var setField = function(name, value) {
        if (name === '') name = 'anonymous';

        var oldValue = acc[name];

        if (oldValue != null) {
          if (oldValue instanceof Array) {
            acc[name].push(value);
          } else {
            acc[name] = [oldValue, value];
          }
        } else {
          acc[name] = value;
        }
      };

      for (var i = 0; i < node.elements.length; i++) {
        var child = node.elements[i];
        var nodeType = child.tagName.toLowerCase();

        if (nodeType == 'input' || nodeType == 'textfield') {
          // INPUT or TEXTFIELD element.
          // Make sure auto-complete is not turned off for the field:
          if ((child.getAttribute('autocomplete') || '').toLowerCase() !== 'off') {
            // Make sure it's not a password:
            if (child.type !== 'password') {
              // Make sure it's not a radio or it's a checked radio:
              if (child.type !== 'radio' || child.checked) {
                setField(child.name, child.value);
              }
            }
          }
        } else if (nodeType == 'select') {
          // SELECT element:
          var option = child.options[child.selectedIndex];

          setField(child.name, option.value);
        }
      }

      return acc;
    };

    DomUtil.monitorElements = function(tagName, onnew, refresh) {
      refresh = refresh || 50;

      var checker = function() {
        var curElements = document.getElementsByTagName(tagName);

        for (var i = 0; i < curElements.length; i++) {
          var el = curElements[i];

          var scanned = el.getAttribute('scribe_scanned');

          if (!scanned) {
            el.setAttribute('scribe_scanned', true);
            try { 
              onnew(el);
            } catch (e) {
              window.onerror(e);
            }
          }
        }

        setTimeout(checker, refresh);
      };

      setTimeout(checker, 0);
    };


    /*
      data-attribute
    */
    DomUtil.getDataset = function(node) {
      // node.dataset is undefined 
      if (typeof node.dataset !== 'undefined') {
        return Util.toObject(node.dataset);
      } else if (node.attributes) {
        // use our own fxn to identify attributes that have data- in their key
        var dataset = {};

        var attrs = node.attributes;

        for (var i = 0; i < attrs.length; i++) {
          var name = attrs[i].name;
          var value = attrs[i].value;

          //var str = "Hello world, welcome to the universe.";
          //var n = str.indexOf("welcome"); 
          //answer: 13
          if (name.indexOf('data-') === 0) {
            /*
              var str = "Hello world!";
              var res = str.substring(2);
              res = llo world!
            */
            name = name.substr('data-'.length);

            dataset[name] = value;
          }
        }

        return dataset;
      } else return {};
    };

    /*
      Purpose : wtf??
    */
    DomUtil.genCssSelector = function(node) {
      var sel = '';

      while (node != document.body) {
        var id = node.id;//someId
        var classes = node.className.split(" ").join("."); // alpha.beta.gama
        var tagName = node.nodeName.toLowerCase();// div a footer header etc

        if (id && id !== "") id = '#' + id;//#someId
        if (classes !== "") classes = '.' + classes;//.alpha.beta.gama

        var prefix = tagName + id + classes;//div+#someId+.alpha.beta.gama

        var parent = node.parentNode;
        /*
          In case it's a nth child inside a parent DOM. 
          Then we will identify it's number.. 
        */
        var nthchild = 1;

        for (var i = 0; i < parent.childNodes.length; i++) {
          if (parent.childNodes[i] === node) break;
          else {
            var childTagName = parent.childNodes[i].tagName;
            if (childTagName !== undefined) {
              nthchild = nthchild + 1;
            }
          }
        }
        /*
          x=5
          x !== "5" true
          x !==  5  false

          !== means different value or different type
        */
        if (sel !== '') sel = '>' + sel;

        sel = prefix + ':nth-child(' + nthchild + ')' + sel;//div+#someId+.alpha.beta.gama:nth-child('4')>

        node = parent;// why ??
      }

      return sel;
    };


    /*
      node properties
      1. id
      2. selector: id's class nth child etc info ..  
      3. title: in case their is title
      4. data : data-attribute
    */
    DomUtil.getNodeDescriptor = function(node) {
      return {
        id:         node.id,
        selector:   DomUtil.genCssSelector(node),
        title:      node.title === '' ? undefined : node.title,
        data:       DomUtil.getDataset(node)
      };
    };

    // returns all parents of current node until it reaches on body element.
    // node = document.getElementById('someID') or similar type of selector.
    // if selector is a class then .. multiple nodes will be present .. then ?? read more ..  
    // needs modification .. considering we are targetting id's only for now
    // but here we're calling from e.target .. it will automatically find the node
    DomUtil.getAncestors = function(node) {
      var cur = node;
      var result = [];

      while (cur && cur !== document.body) {
        result.push(cur);
        cur = cur.parentNode;
      }

      return result;
    };

    DomUtil.simulateMouseEvent = function(element, eventName, options) {
      var eventMatchers = {
        'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
        'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
      };
 
      options = Util.merge({
        pointerX: 0,
        pointerY: 0,
        button: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        bubbles: true,
        cancelable: true
      }, options || {});

      var oEvent, eventType = null;

      for (var name in eventMatchers) {
        if (eventMatchers[name].test(eventName)) { eventType = name; break; }
      }

      if (!eventType) throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

      if (document.createEvent) {
        oEvent = document.createEvent(eventType);
        if (eventType === 'HTMLEvents') {
          oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        } else {
          oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
            options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element
          );
        }
        element.dispatchEvent(oEvent);
      } else {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        oEvent = Util.merge(evt, options);
        try {
          element.fireEvent('on' + eventName, oEvent);
        } catch (error) {
          // IE nonsense:
          element.fireEvent('on' + eventName);
        }
      }
      return element;
    };

    var ArrayUtil = {};

    ArrayUtil.removeElement = function(array, from, to) {
      var tail = array.slice((to || from) + 1 || array.length);
      array.length = from < 0 ? array.length + from : from;
      return array.push.apply(array, tail);
    };

    ArrayUtil.toArray = function(alike) {
      var arr = [], i, len = alike.length;

      arr.length = alike.length;

      for (i = 0; i < len; i++) {
       arr[i] = alike[i];
      }

      return arr;
    };

    ArrayUtil.contains = function(array, el) {
      return ArrayUtil.exists(array, function(e){return e === el;});
    };

    ArrayUtil.diff = function(arr1, arr2) {
      var i, el, diff = [];
      for (i = 0; i < arr1.length; i++) {
        el = arr1[i];

        if (!ArrayUtil.contains(arr2, el)) diff.push(el);
      }
      return diff;
    };

    ArrayUtil.exists = function(array, f) {
      for (var i = 0; i < array.length; i++) {
        if (f(array[i])) return true;
      }
      return false;
    };

    ArrayUtil.map = function(array, f) {
      var r = [], i;
      for (i = 0; i < array.length; i++) {
        r.push(f(array[i]));
      }
      return r;
    };

    var Env = {};


    /*
      Fingerprint = md5(pluginData + LocaleData + userAgent )
    */
    Env.getFingerprint = function() {    
      var data = [
        JSON.stringify(Env.getPluginsData()),
        JSON.stringify(Env.getLocaleData()),
        navigator.userAgent.toString()
      ];

      return MD5.hash(data.join(""));
    };
    
    Env.getBrowserData = function() {
      var fingerprint = Env.getFingerprint();

      return ({
        ua:           navigator.userAgent,
        name:         BrowserDetect.browser,
        version:      BrowserDetect.version,
        platform:     BrowserDetect.OS,
        language:     navigator.language || navigator.userLanguage || navigator.systemLanguage,
        plugins:      Env.getPluginsData()
      });
    };

    Env.getUrlData = function() {
      var l = document.location;
      return ({
        hash:     l.hash,
        host:     l.host,
        hostname: l.hostname,
        pathname: l.pathname,
        protocol: l.protocol,
        query:    Util.parseQueryString(l.search)
      });
    };

    Env.getDocumentData = function() {
      return ({
        title:    document.title,
        referrer: document.referrer && Util.parseUrl(document.referrer) || undefined,
        url:      Env.getUrlData()
      });
    };

    Env.getScreenData = function() {
      return ({
        height: screen.height, 
        width: screen.width, 
        colorDepth: screen.colorDepth
      });
    };

    /*
      LocaleData {} = {language + timezoneOffset + gmtOffset + timezone} 
    */
    Env.getLocaleData = function() {
      // "Mon Apr 15 2013 12:21:35 GMT-0600 (MDT)"
      // 
      var results = new RegExp('([A-Z]+-[0-9]+) \\(([A-Z]+)\\)').exec((new Date()).toString());

      var gmtOffset, timezone;

      if (results && results.length >= 3) {
        gmtOffset = results[1];
        timezone  = results[2];
      }

      return ({
        language: navigator.systemLanguage || navigator.userLanguage || navigator.language,
        timezoneOffset: (new Date()).getTimezoneOffset(),
        gmtOffset: gmtOffset,
        timezone:  timezone
      });
    };

   // { browser + document + screen + locale data}
    Env.getPageloadData = function() {
      var l = document.location;
      return {
        browser:  Env.getBrowserData(),
        document: Env.getDocumentData(),
        screen:   Env.getScreenData(),
        locale:   Env.getLocaleData()
      };
    };


    /*
      getpluginsData [] = all about plugin's installed 
    */
    Env.getPluginsData = function() {
      var plugins = [];
      var p = navigator.plugins;
      for (var i = 0; i < p.length; i++) {
        var pi = p[i];
        plugins.push({
          name:         pi.name,
          description:  pi.description,
          filename:     pi.filename,
          version:      pi.version,
          mimeType: (pi.length > 0) ? ({
            type:         pi[0].type,
            description:  pi[0].description,
            suffixes:     pi[0].suffixes
          }) : undefined
        });
      }
      return plugins;
    };

    /*
      Handler has a private variable of array type 
      and some member functions push, dispatch
    */
    var Handler = function() {
      this.handlers = [];
      this.onerror = (console && console.log) || window.onerror || (function(e) {});
    };

    // push f inside handler array
    Handler.prototype.push = function(f) {
      this.handlers.push(f);
    };
    //Just in case: prototype help you to define functions and variables explicitly

    /*
      Why do we use Array.prototype.slice.call() ??

    1.Following line gives us the nodeList(it is dynamic) means:
      var p = document.getElementsByTagName('p');
      On console we see 2 p elements
      console.log(p.length); // 2
      append 1 more p 
      document.body.appendChild(document.createElement('p'));
      length of p changes as document was modified
      console.log(p.length); // 3
      so we change this to array which is more static
    
    2.Using call to invoke an anonymous function
    3.Using call to chain constructors for an object
      Check : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call    
      How it works?
      
      -> Function.protoype.call() 
        The call() method calls a function with a given this value and arguments provided individually.
        
        function Product(name, price) {}
        Product.call(this,name,price)
        
      An Example:
      myConcat has a seperator which is used to join lateron
      arguments: it is used to reffer all the arguments of the fxn
      we are considering arguments starting from 1 and returning them (i.e form 1 to end) into
      an array stored in args.
      And then using seperator which is at the 0th position and is not included in the arguments 
      to join them. 

      function myConcat(separator) {
        var args = Array.prototype.slice.call(arguments, 1);
        return args.join(separator);
      }

      returns "red, orange, blue"
      myConcat(", ", "red", "orange", "blue");

      here seperator: ","
      arguments: start from 1 to end .. red, orange, blue
      
    */
    /*
      ->Function.prototype.apply()
        The apply() method calls a function with a given this value and arguments provided as an array (or an array-like object).
    */

    // hander stores array of functions 
    // on dispatch with some arguments .. all the functions are called one by one with those argument
    Handler.prototype.dispatch = function() {
      //here args and i are two different variables
      var args = Array.prototype.slice.call(arguments, 0), i;
      // puts all args in an array so that .apply can use it
      for (i = 0; i < this.handlers.length; i++) {
        try {
          this.handlers[i].apply(null, args);
        }
        catch (e) {
          onerror(e);
        }
      }
    };

    var Events = {};

    // runs the function only if dom is loaded .. other wise waits fo 10ms
    Events.onready = function(f) {
      if (document.body != null) f();
      else setTimeout(function(){Events.onready(f);}, 10);
    };



    // read more .. 
    // el = DOM element
    // type = click .. 
    // capture = true or false 
    // f_ = a function
    // $('selector').on('click',function(){ }) equivalent to this
    Events.onevent = function(el, type, capture, f_) {

      /*
        Fixup: pass a function in argument

        returns 

     */
      var fixup = function(f) {
        return function(e) {
          if (!e) e = window.event;

          // Perform a shallow clone (Firefox bugs):
          // ?? 
          e = Util.copyFields(e);

          // Firstly setting the target node
          // target node can be found by target or srcElement
          /*
            The last two lines of code are especially for Safari. 
            If an event takes place on an element that contains text, 
            this text node, and not the element, becomes the target of the event.
            Therefore we check if the target's nodeType is 3, a text node. 
            If it is we move to its parent node, the HTML element.
          */

          e.target    = e.target || e.srcElement;
          e.keyCode   = e.keyCode || e.which || e.charCode;
          e.which     = e.which || e.keyCode;
          e.charCode  = (typeof e.which === "number") ? e.which : e.keyCode;
          e.timeStamp = e.timeStamp || (new Date()).getTime();

          if (e.target && e.target.nodeType == 3) e.target = e.target.parentNode;// Safari bug reffered in above comments

          var retVal;

          if (!e.preventDefault) {
            e.preventDefault = function() {
              retVal = false;
            };
          }

          return f(e) || retVal;
        };
      };

      var f = fixup(f_);

      if (el.addEventListener) {
        el.addEventListener(type, f, capture); 
      } else if (el.attachEvent)  {
        el.attachEvent('on' + type, f);
      }
    };

    Events.onexit = (function() {
      var unloaded = false;

      //handler = a array variable + 2 member functions to push and pull
      var handler = new Handler();

      //calls all the functions present in the handler ??why this is used when we have created a new handler?
      var handleUnload = function(e) {
        if (!unloaded) {
          handler.dispatch(e);
          unloaded = true;
        }
      };

      // window.onUnload call handleUpload which call's all the fxns inside handler array
      Events.onevent(window, 'unload', undefined, handleUnload);

      //read more
      var replaceUnloader = function(obj) {
        var oldUnloader = obj.onunload || (function(e) {});

        obj.onunload = function(e) {
          handleUnload();

          oldUnloader(e);
        };
      };

      replaceUnloader(window);

      Events.onready(function() {
        replaceUnloader(document.body);
      });

      return function(f) {
        handler.push(f);
      };
    })();

    Events.onengage = (function() {
      var handler = new Handler();
      var events = [];

      Events.onready(function() {
        Events.onevent(document.body, 'mouseover', true, function(e) {
          events.push(e);
        });

        Events.onevent(document.body, 'mouseout', true, function(end) {
          var i, start;

          for (i = events.length - 1; i >= 0; i--) {
            if (events[i].target === end.target) {
              start = events[i];
              ArrayUtil.removeElement(events, i);
              break;
            }
          }

          if (start !== undefined) {
            var delta = (end.timeStamp - start.timeStamp);

            if (delta >= 1000 && delta <= 20000) {
              handler.dispatch(start, end);
            }
          }
        });
      });

      return function(f) {
        handler.push(f);
      };
    })();


    // (function(a) {})() : defines and calls the function immediately
    // ?? read more 
    Events.onhashchange = (function() {
      var handler = new Handler();
      var lastHash = document.location.hash;

      var dispatch = function(e) {
        var newHash = document.location.hash;

        if (lastHash != newHash) {
          lastHash = newHash;

          e.hash = newHash;

          handler.dispatch(e);
        }
      };

      if (window.onhashchange) {
        Events.onevent(window, 'hashchange', false, dispatch);
      } else {
        setInterval(function() { dispatch({}); }, 25);
      }

      return function(f) {
        handler.push(f);
      };
    })();

    Events.onerror = (function() {
      var handler = new Handler();

      if (typeof window.onerror === 'function') handler.push(window.onerror);

      window.onerror = function(err, url, line) { handler.dispatch(err, url, line); };

      return function(f) {
        handler.push(f);
      };
    })();

    Events.onsubmit = (function() {
      var handler = new Handler();

      var handle = Util.undup(function(e) {
        handler.dispatch(e);
      });

      Events.onready(function() {
        Events.onevent(document.body, 'submit', true, function(e) {
          handle(e);
        });

        // Intercept enter keypresses which will submit the form in most browsers.
        Events.onevent(document.body, 'keypress', false, function(e) {
          if (e.keyCode == 13) {
            var target = e.target;
            var form = target.form;

            if (form) {
              e.form = form;
              handle(e);
            }
          }
        });

        // Intercept clicks on any buttons:
        Events.onevent(document.body, 'click', false, function(e) {
          var target = e.target;
          var targetType = (target.type || '').toLowerCase();
          
          if (target.form && (targetType === 'submit' || targetType === 'button')) {
            e.form = target.form;
            handle(e);
          }
        });
      });

      return function(f) {
        handler.push(f);
      };
    })();

    /**
      Initializes Scribe. This is called internally by the constructor and does
      not need to be called manually.
     
      1.set's options 
     */
    Scribe.prototype.initialize = function() {
      var self = this;

      /*
        bucket -> 
            Determines whether or not to include time information in the path where events are stored. 
            Must be equal to 'none', 'daily', 'monthly', or 'yearly'. If you choose monthly, for example, 
            then events will be organized into paths that contain the year and month in which the event 
            occurred (e.g. '/2013-12/').

        breakoutUsers -> 
            Determines whether or not to include user ID information in the path where events are stored. 
            If you set this field to true, then events for identified users will be organized into paths 
            like '/users/123/', where 123 is a user ID.

        breakoutVisitors -> 
             Determines whether or not to include visitor ID information in the path where events are stored. 
             If you set this field to true, then events for anonymous visitors will be organized into paths like 
             /visitors/123', where 123 is a visitor ID.
      */ 
      /*
        merges the default options with user specified options. Considering user defined options to be of higher priority.
      */
      this.options = Util.merge({
        bucket:           'none',
        breakoutUsers:    false,
        breakoutVisitors: false
      }, this.options);

      this.customRequests = function(category,eventName,data,success) {

        var allData = Util.merge(data,{
          category: category,
          eventName: eventName,
          success: true
        });

        //console.log(allData);
        this.randomTracker(allData);
      }
      // *****ADD OPTIONS HERE AND CHECK LATER ON**** : imp !!


      // Always assume that Javascript is the culprit of leaving the page
      // (we'll detect and intercept clicks on links and buttons as best 
      // as possible and override this assumption in these cases):

      this.javascriptRedirect = true; // ??? find out later on


      this.context = {};

      this.context.debug = this.options.debug;
      /* 
        Stores info like : plugin's data + localeData + userData 
      */
      this.context.fingerprint = Env.getFingerprint();

      
      // this.context.sessionId = (function() {
      //   var sessionId = sessionStorage.getItem('scribe_sid') || Util.genGuid();

      //   sessionStorage.setItem('scribe_sid', sessionId);

      //   return sessionId;
      // })();
      
      this.context.updateSessionId = function(){
        var ttl = 0.5 * 60; // 1/2 hours
        var sessionId = Util.getCookie('scribe_sid');
        //console.log(sessionId);
        if(sessionId){
          //console.log("no sessionId");

          Util.setCookie('scribe_sid',sessionId,ttl);
        }
        else{
          sessionId = Util.genGuid();
         // console.log(sessionId)
          Util.setCookie('scribe_sid',sessionId,ttl);
        }
      }

      this.context.sessionId = ( function () {
        var ttl = 0.5 * 60; // 1/2 hours

        var sessionId = Util.getCookie('scribe_sid');
        //console.log(sessionId);
        if(sessionId){
          //console.log("no sessionId");
          Util.setCookie('scribe_sid',sessionId,ttl);
        }
        else{
          sessionId = Util.genGuid();
         // console.log(sessionId)
          Util.setCookie('scribe_sid',sessionId,ttl);
          //document.cookie = "scribe_sid=" + sessionId;
        }
        return sessionId;
      })();



      // visitorId = scribe_vid
      this.context.visitorId = (function() {
        var visitorId = localStorage.getItem('scribe_vid') || Util.genGuid();

        localStorage.setItem('scribe_vid', visitorId);

        return visitorId;
      })();

      // userId userProfile .. set if present otherwise it's null
      this.context.userId      = JSON.parse(localStorage.getItem('scribe_uid')      || 'null');
      this.context.userProfile = JSON.parse(localStorage.getItem('scribe_uprofile') || 'null');

      // Try to obtain geo location if possible:
      Geo.geoip(function(position) {
        self.context.geo = position;
      });



      Events.onready(function() {
        // Track page view, but only after the DOM has loaded

        // EVENT: view
        if(self.options.modes.events.pageView){
          self.pageview();
        }

        //EVENT: nonLinkClicks
        // Track all clicks to the document:
        // considering similar like  $('selector').on("click",function(){ // code here})
        if(self.options.modes.events.nonLinkClicks){

          Events.onevent(document.body, 'click', true, function(e) {
            var ancestors = DomUtil.getAncestors(e.target);

            // Do not track clicks on links, these are tracked separately!
            // ancestors contain all parents of dom element e 
            // node = ancestors[i] .. returns true if (node.tagName === A (i.e it's a link))
            // if(it's false (i.e not a link)){ track -> name: click prop: give details about that node }
            if (!ArrayUtil.exists(ancestors, function(e) { return e.tagName === 'A';})) {
              self.track('click', {
                target: DomUtil.getNodeDescriptor(e.target)
              });
            }
          });
        }
        });
      
      //EVENT: hashChange
      if(self.options.modes.events.hashChange){
      //this is saved hash... to track the jump .. 
      self.oldHash = document.location.hash;

      var trackJump = function(hash) {
        if (self.oldHash !== hash) {// Imp! -> Guard against tracking more than once
          
          //var str = "Hello world!";
          //var res = str.substring(2)
          //    res  = ello world!
          var id = hash.substring(1);

          // If it's a real node, get it so we can capture node data:
          var targetNode = document.getElementById(id);


          /*
            var data = Util.merge({ url: Util.parseUrl(document.location)}  ,  targetNode ? DomUtil.getNodeDescriptor(targetNode) : {id: id});
          */
          var data = Util.merge({
            url: Util.parseUrl(document.location)
          }, targetNode ? DomUtil.getNodeDescriptor(targetNode) : {id: id});

          self.track('jump', {
            target: data,
            source: {
              url: Util.merge(Util.parseUrl(document.location), {
                hash: self.oldHash // Override the hash
              })
            }
          });

          self.oldHash = hash;
        }
      };

      // Track hash changes:
      Events.onhashchange(function(e) {
        trackJump(e.hash);
      });

      }//if

      //EVENT: engage
      if(self.options.modes.events.engage){
        // Track all engagement:
        Events.onengage(function(start, end) {
          self.track('engage', {
            target:   DomUtil.getNodeDescriptor(start.target), 
            duration: end.timeStamp - start.timeStamp
          });
        });
      }

      //EVENT: links
      if(self.options.modes.events.engage){
      // Track all clicks on links:
      DomUtil.monitorElements('a', function(el) {
        Events.onevent(el, 'click', true, function(e) {
          var target = e.target;

          // TODO: Make sure the link is actually to a page.
          // It's a click, not a Javascript redirect:
          self.javascriptRedirect = false;
          setTimeout(function(){self.javascriptRedirect = true;}, 500);

          var parsedUrl = Util.parseUrl(el.href);
          var value = {target: Util.merge({url: parsedUrl}, DomUtil.getNodeDescriptor(target))};

          if (Util.isSamePage(parsedUrl, document.location.href)) {
            // User is jumping around the same page. Track here in case the 
            // client prevents the default action and the hash doesn't change
            // (otherwise it would be tracked by onhashchange):
            self.oldHash = undefined;

            trackJump(document.location.hash);
          } else if (parsedUrl.hostname === document.location.hostname) {
            // We are linking to a page on the same site. There's no need to send
            // the event now, we can safely send it later:
            self.trackLater('click', value);
          } else {
            var intercepted = target.getAttribute('scribe_intercepted');          

            if (!intercepted) {
              target.setAttribute('scribe_intercepted', 'true');

              e.preventDefault();

              // We are linking to a page that is not on this site. So we first
              // wait to send the event before simulating a different click
              // on the link. This ensures we don't lose the event if the user
              // does not return to this site ever again.
              self.track('click', 
                value,
                function() {
                  // It's a click, not a Javascript redirect:
                  self.javascriptRedirect = false;

                  // Simulate a click to the original element:
                  DomUtil.simulateMouseEvent(target, 'click');
                }
              );
            } else {
              // We already intercepted this, so we'll let it pass on through
              // without modification:
              target.removeAttribute('scribe_intercepted');
            }
          } 
        });
      });
      }

      //EVENT: jsRedirect 
      // Track JavaScript-based redirects, which can occur without warning:
      if(self.options.modes.events.jsRedirect){
        Events.onexit(function(e) {
          if (self.javascriptRedirect) {
            self.trackLater('redirect');
          }
        });
      }

      //EVENT: formSubmit
      if(self.options.modes.events.formSubmit){
      // Track form submissions:
      Events.onsubmit(function(e) {
        if (e.form) {
          if (!e.form.formId) {
            e.form.formId = Util.genGuid();
          }

          self.trackLater('formsubmit', {
            form: Util.merge({formId: e.form.formId}, DomUtil.getFormData(e.form))
          });
        }
      });
      }
      // Track form abandonments:

      // Load and send any pending events:
      this._loadOutbox();
      this._sendOutbox();
    };

    /**
     * Retrieves the path where a certain category of data is stored.
     *
     * @memberof Scribe
     *
     * @param type  A simple String describing the category of data, such as
     *              'profile' or 'events'.
     */
    Scribe.prototype.getPath = function(type) {
      var now = new Date();
      var rootNode =  this.context.userId ? (this.options.breakoutUsers ? '/users/' + this.context.userId + '/' : '/users/') : 
                     (this.options.breakoutVisitors ? '/visitors/' + this.context.visitorId + '/' : '/visitors/');
      var dateNode;

      if (/daily|day/.test(this.options.bucket)) {
        dateNode = now.getUTCFullYear() + '-' + Util.padLeft(now.getUTCMonth(), 2) + '-' + Util.padLeft(now.getUTCDate(), 2) + '/';
      } else if (/month/.test(this.options.bucket)) {
        dateNode = now.getUTCFullYear() + '-' + Util.padLeft(now.getUTCMonth(), 2) + '/';
      } else if (/year/.test(this.options.bucket)) {
        dateNode = now.getUTCFullYear() + '/';
      } else {
        dateNode = '';
      } 

      var targetNode = type + '/';

      return rootNode + dateNode + targetNode;
    };

    Scribe.prototype._saveOutbox = function() {
      localStorage.setItem('scribe_outbox', JSON.stringify(this.outbox));
    };

    Scribe.prototype._loadOutbox = function() {
      this.outbox = JSON.parse(localStorage.getItem('scribe_outbox') || '[]');
    };

    //if this shows error check for debug mode.. 
    Scribe.prototype._sendOutbox = function() {
      for (var i = 0; i < this.outbox.length; i++) {
        var message = this.outbox[i];

        var event = message.value.event;
        //for debug mode 
        message.debug = this.context.debug;
        // Specially modify redirect, formSubmit events to save the new URL,
        // because the URL is not known at the time of the event:
        if (ArrayUtil.contains(['redirect', 'formSubmit'], event)) {
          message.value.target = Util.jsonify(Util.merge(message.value.target || {}, {url: Util.parseUrl(document.location)}));
        }

        // If source and target urls are the same, change redirect events
        // to reload events:
        if (event === 'redirect') {
          try {
            // See if it's a redirect (= different url) or reload (= same url):
            var sourceUrl = Util.unparseUrl(message.value.source.url);
            var targetUrl = Util.unparseUrl(message.value.target.url);

            if (sourceUrl === targetUrl) {
              // It's a reload:
              message.value.event = 'reload';
            }
          } catch (e) {
            window.onerror && window.onerror(e);
          }
        }

        try {
          this.tracker(message);
        } catch (e) {
          // Don't let one bad apple spoil the batch.
          window.onerror && window.onerror(e);
        }
      }
      this.outbox = [];
      this._saveOutbox();
    };

    /**
     * Identifies a user.
     *
     * @memberof Scribe
     *
     * @param userId  The unique user id.
     * @param props   An arbitrary JSON object describing properties of the user.
     *
     */
    Scribe.prototype.identify = function(userId, props, context, success, failure) {
      this.context.userId       = userId;
      this.context.userProfile  = props;

      localStorage.setItem('scribe_uid',      JSON.stringify(userId));
      localStorage.setItem('scribe_uprofile', JSON.stringify(props || {}));
      
      this.context = Util.merge(context || {}, this.context);
      //update sessionId / scribe_sid
      this.context.updateSessionId();
      this.tracker({
        path:     this.getPath('profile'), 
        value:    this._createEvent(undefined, props),
        op:       'replace',
        success:  success,
        failure:  failure,
        debug:    this.context.debug, 
      });
    };

    /**
     * A utility function to create an event. Adds timestamp, stores the name
     * of the event and contextual data, and generates an idiomatic, trimmed 
     * JSON objects that contains all event details.
     */

     /*
       Returns json string which will be stored related to an event + timestamp 
     */
    Scribe.prototype._createEvent = function(name, props) {
      props = props || {};

      props.timestamp = props.timestamp || (new Date()).toISOString();
      props.event     = name;
      props.source    = Util.merge({url: Util.parseUrl(document.location)}, props.source || {});

      return Util.jsonify(Util.merge(this.context, props));
    };

    /**
     * Tracks an event now.
     *
     * @memberof Scribe
     *
     * @param name        The name of the event, such as 'downloaded trial'.
     * @param props       An arbitrary JSON object describing properties of the event.
     * @param callback    A function to call when the tracking is complete.
     *
     */
     // tracks events 
     /*
       path: ?? read more 
       value: (name + prop{})
       op: append or replace ?? read more 
     */
    Scribe.prototype.track = function(name, props, success, failure) {
      //update sessionId / scribe_sid
      this.context.updateSessionId();
      this.tracker({
        path:    this.getPath('events'), 
        value:   this._createEvent(name, props),
        op:      'append',
        success: success,
        failure: failure,
        debug:   this.context.debug
      });
    };

    /**
     * Tracks an event later. The event will only be tracked if the user visits
     * some page on the same domain that has Scribe Analytics installed.
     *
     * This function is mainly useful when the user is leaving the page and 
     * there is not enough time to capture some user behavior.
     *
     * @memberof Scribe
     *
     * @param name        The name of the event, such as 'downloaded trial'.
     * @param props       An arbitrary JSON object describing properties of the event.
     *
     */
    Scribe.prototype.trackLater = function(name, props) {
      this.outbox.push({
        path:    this.getPath('events'), 
        value:   this._createEvent(name, props),
        op:      'append'
      });

      this._saveOutbox();
    };

    /**
     * Identifies the user as a member of some group.
     *
     * @memberof Scribe
     *
     * @param groupId
     * @param props
     *
     */
    Scribe.prototype.group = function(groupId, props, success, failure) {
      this.context.userGroupId      = groupId;
      this.context.userGroupProfile = props;

      this.context = Util.merge(context || {}, this.context);
      //update sessionId / scribe_sid
      this.context.updateSessionId();
      this.tracker({
        path:     this.getPath('groups'), 
        value:    this._createEvent(undefined, props),
        op:       'replace',
        success:  success,
        failure:  failure,
        debug:   this.context.debug
      });
    };

    /**
     * Tracks a page view.
     *
     */
    Scribe.prototype.pageview = function(url, success, failure) {
      url = url || document.location;
      // this.track("pageview", { some things in object}, success, failure)
      this.track('pageview', Util.merge(Env.getPageloadData(), {url: Util.parseUrl(url + '')}), success, failure);
    };

    return Scribe;
  })(Scribe);
}



