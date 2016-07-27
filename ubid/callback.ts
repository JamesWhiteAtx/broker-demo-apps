namespace ubid {
  export function redirect(loc: Location) {
    if (!loc) {return;}
    let origin = loc.origin;
    let path = loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1);
    path = getStatePage(path, loc.hash || loc.search);
    var search = encodeURIComponent(btoa(loc.search || ''));
    var hash = encodeURIComponent(btoa(loc.hash || ''));
    //console.log(origin + path);
    loc.replace(origin + path + '?csearch=' + search + '&chash=' + hash);
  }

  function getStatePage(path: string, qStr: string): string {
    if (!qStr) {
      return path;
    }
    var regex = new RegExp("[?#&]state(=([^&#]*)|&|#|$)");
    var results = regex.exec(qStr);
    if (!results || !results[2]) {
      return path;
    }
    var state = decodeURIComponent(results[2].replace(/\+/g, " "));
    var idx = state.indexOf(';');
    if (idx + 3 < state.length) {
      return path + state.substr(idx + 1) + '.html';
    }
  }
}