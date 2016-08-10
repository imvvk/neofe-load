

//动态加载资源
var _loaded = {}; // 已经加载的静态文件
var _loading = {}; // 正在加载中的静态文件
var _callbacks = []; // 静态文件加载的回调列表
var _links = []; // 加载中的css列表
var _timer; // 轮询css加载状态的定时器

var canonicalURI = function(src) {
  if (/^\/\/\/?/.test(src)) {
    src = location.protocol + src;
  }
  return src;
};

//只检测一次
var _initResourceMap = function() {
  var allTags = document.getElementsByTagName('link'),
  len = allTags.length,
  tag;

  while (len) {
    tag = allTags[--len];
    if ((tag.rel == 'stylesheet' || tag.type == 'text/css') && tag.href) {
      _loaded[canonicalURI(tag.href)] = true;
    }
  }

  allTags = document.getElementsByTagName('script');
  len = allTags.length;
  while (len) {
    tag = allTags[--len];
    if ((!tag.type || tag.type == "text/javascript") && tag.src) {
      _loaded[canonicalURI(tag.src)] = true;
    }
  }

  _initResourceMap = function() {};
};

var _complete = function(uri) {
  var list = _callbacks,
  item, i;

  delete _loading[uri];
  _loaded[uri] = true;
  for (i = 0; i < list.length; i++) {
    item = list[i];
    delete item.resources[uri];
    if (isEmpty(item.resources)) {
      item.callback && item.callback();
      list.splice(i--, 1);
    }
  }
};

var _poll = function() {
  var sheets = document.styleSheets,
  i = sheets.length,
  links = _links;

  while (i--) {
    var link = sheets[i],
      owner = link.ownerNode || link.owningElement,
      j = links.length;

    if (owner) {
      while (j--) {
        if (owner == links[j]) {
          _complete(links[j]['data-href']);
          links.splice(j, 1);
        }
      }
    }
  }

  if (!links.length) {
    clearInterval(_timer);
    _timer = null;
  }
};

var _injectJS = function(uri) {
  var script = document.createElement('script');
  var callback = function() {
    script.onload = script.onerror = script.onreadystatechange = null;
    _complete(uri);
  };

  script.type = 'text/javascript';
  script.src = uri;

  script.onload = script.onerror = callback;
  script.onreadystatechange = function() {
    var state = this.readyState;
    if (state == 'complete' || state == 'loaded') {
      callback();
    }
  };
  document.getElementsByTagName('head')[0].appendChild(script);
};

var _injectCSS = function(uri) {
  var link = document.createElement('link');
  link.setAttribute("rel","stylesheet");
  link.setAttribute("href",uri);
  link["data-href"] = uri;

  document.getElementsByTagName('head')[0].appendChild(link);

  if (link.attachEvent) {
    var callback = function() {
      _complete(uri);
    };
    link.onload = callback;
  } else {
    _links.push(link);
    if (!_timer) {
      _timer = setInterval(_poll, 20);
    }
  }
};

var _load = function(list, callback) {
  var resources = {},
  uri, path, type, ret;

  _initResourceMap();

  list = isArray(list) ? list : [list];
  for (var i = 0, j = list.length; i < j; i++) {
    uri = canonicalURI(list[i]);
    resources[uri] = true;

    if (_loaded[uri]) {
      setTimeout(proxy(_complete, null, uri), 0);
    } else if (!_loading[uri]) {
      _loading[uri] = true;
      //if (uri.indexOf('.css') > -1) {
      if (uri.match(/[\?\.]css$/)) {
        _injectCSS(uri);
      } else {
        _injectJS(uri);
      }
    }
    }

    if (callback) {
      _callbacks.push({
        resources: resources,
        callback: callback
      });
    }
  };

  var _map = function(arr,fn) {
    if (arr.map) {
      return arr.map(fn);
    }
    var new_arr = [];
    for (var i = 0, l = arr.length; i < l; i++) {
      new_arr.push(fn(arr[i], i, arr));
    }
    return new_arr;
  }
  function proxy(fn,context,args) {
    args = args == null ? [] :  isArray(args) ? args : [args];
    return function(){
      var _args = [].slice(arguments,0);
      _args =  _args.concat(args);
      return fn.apply(context,_args);
    }
  }

  function isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  }
  function isEmpty(o){
    if (isArray(o)) {
      return o.length;
    }else if (typeof o === "object" ) {
      for(var i in o) {
        if (o.hasOwnProperty(i)){
          return false;
        }
      }
      return true;
    } else if (typeof o === "string" ) {
      return !!o;
    }
    console.error("not array or object");
    return false
  }

function replaceVersion(manifest, module) {
  var version = manifest[module]; 
  var static_src = Config.base + module;
  if (version) {
    static_src = static_src.replace(/\.(js|css)$/, function(all,$1) {
      return "."+ version + $1;
    });
  }
  return static_src; 
}


var Config = module.exports.Config = {
  base : "/"
} 
module.exports.loadModule = function loadModule(module, callback) {
  var manifest = window.__Manifest__;
  var static_src = module;
  if (isArray(static_src)) {
    static_src = _map(module, function(m) {
      return replaceVersion(manifest, m);
    });
  }
  _load(static_src, callback);
};

module.exports.load = _load;


