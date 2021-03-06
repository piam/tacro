// Hackish for now.
var Fact = require('./fact.js');
var Engine = require('./engine.js');
var Storage = require('./storage.js');
var Move = require('./move.js');

var storage = new Storage(Engine.fingerprint);
var log = {};
var state;
var lastStateFp = null;
var STATE_KEY = "lastState-v13";
var USERID_KEY = "tacro-userid";
var SIZE_MULTIPLIER = 3;
var urlNum = 0;
var selectedNode = null;
var workBox;
var factToShooterBox = {};
var deferredUntilRedraw = [];
var landMap = {};
var landDepMap = {}; // XXX
var currentPane;

var varColors = [
    "#9370db",
    "#70db93",
    "#f13e44",
    "#cc4a14",
    "#99583d",
    "#3d983d",
    "#3d9898",
];


// ==== Stubs for node.js usage ====
if (typeof document == 'undefined') {
    function Node() {};
    Node.prototype = {
        style: {},
        appendChild: function(){},
        removeChild: function(){},
        sheet: { insertRule: function(){}},
    };

    document = {
        createElement:function() {return new Node();},
        getElementById:function() {return new Node();},
        createTextNode:function() {return new Node();},
        head: new Node(),
    };

    window = {
        addEventListener: function(){},
        location: {search: ""},
    };

    history = {
        pushState: function(){},
    }
}

// ==== END stubs ====

if (window.location.search.match("CLEAR")) {
    localStorage.clear();
}
function removeClass(node, className) {
    while (node.className.match(className)) {
        node.className = node.className.replace(className,'');
    }
}

function newVarNamer() {
    var names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    var map = {};
    return function(obj) {
        /*
        if (!map[obj]) {
            map[obj] = names.shift();
        }
        return map[obj];
        */
        return names[obj];
    };
}

function makeTree(doc, fact, exp, path, inputTot, varNamer, spanMap, cb) {
    if (!spanMap) spanMap = {};
    var termSpan;
    var width = 0;
    var height = 0;

    if (Array.isArray(exp)) {
        termSpan = doc.createElement("span");
        var termName = fact.Skin.TermNames[exp[0]];
        if (!termName) throw new Error("Bad term " + JSON.stringify(exp));
        var arity = exp.length - 1;
        var children = [];
        for (var i = 1; i <= arity; i++) {
            path.push(i);
            var subTree = makeTree(doc, fact, exp[i], path, arity, varNamer,
                                   spanMap, cb);
            subTree.span.className += " tool" + cssEscape(termName);
            spanMap[path] = subTree.span;
            subTree.span.zpath = path.slice();
            children.push(subTree);
            path.pop();
        }
        switch (arity) {
        case 2:
            var opSpan = doc.createElement("a");
            //opSpan.href = "#" + tag + "=" + path;
            termSpan.appendChild(children[0].span);
            termSpan.appendChild(opSpan);
            path.push("0");
            spanMap[path] = opSpan;
            opSpan.zpath = path.slice();
            path.pop();
            opSpan.className += " operator " +" arity2";
            var txtSpan = doc.createElement("span");
            opSpan.appendChild(txtSpan);
            opSpan.className += " txtBox";
            txtSpan.innerHTML = termName;
            txtSpan.className = " txt";
            opSpan.treeWidth = children[1].width;
            opSpan.treeHeight = children[0].height;
            width = children[0].width + children[1].width;
            height = children[0].height + children[1].height;
            opSpan.style.height = "100%";
            children[0].span.style.height = "100%";
            opSpan.style.height =
                children[0].span.style.height =
                "" + (100 * children[0].height / height) + "%";;
            children[1].span.style.height = "" + (100 * children[1].height / height) + "%";

            children[0].span.style.width = "" + (100 * children[0].width / width) + "%";
            opSpan.style.width =  "" + (100 * children[1].width / width) + "%";
            children[1].span.style.width = opSpan.style.width;
            termSpan.appendChild(children[1].span);
            break;
        case 1:
            var opSpan = doc.createElement("a");
            //opSpan.href = "#" + tag + "=" + path;
            termSpan.appendChild(opSpan);
            path.push("0");
            spanMap[path] = opSpan;
            opSpan.zpath = path.slice();
            path.pop();
            opSpan.className += " operator arity1";
            var txtSpan = doc.createElement("span");
            opSpan.appendChild(txtSpan);
            opSpan.className += " txtBox";
            txtSpan.innerHTML = termName;
            txtSpan.className = " txt";
            width = 1 + children[0].width;
            height = 1 + children[0].height;
            opSpan.treeWidth = width;
            opSpan.treeHeight = 1;
            opSpan.style.width = "100%";
            opSpan.style.height = "" + (100 / height) + "%";
            children[0].span.style.height = "" + (100 * children[0].height / height) + "%";
            children[0].span.style.width = "" + (100 * children[0].width / width) + "%";

            termSpan.appendChild(children[0].span);
            break;
        case 0:
            var opSpan = doc.createElement("a");
            //opSpan.href = "#" + tag + "=" + path;
            termSpan.appendChild(opSpan);
            path.push("0");
            spanMap[path] = opSpan;
            opSpan.treeWidth = 1;
            opSpan.treeHeight = 1;
            opSpan.zpath = path.slice();
            path.pop();
            opSpan.className += " operator arity1";
            var txtSpan = doc.createElement("span");
            opSpan.appendChild(txtSpan);
            opSpan.className += " txtBox";
            txtSpan.innerHTML = termName;
            txtSpan.className = " txt";
            width = 1;
            height = 1;
            opSpan.style.width = "100%";
            opSpan.style.height = "100%";
            break;
        default:
            console.log("TODO: XXX Only arity 0-2 supported:"+termName);
            throw new Error("TODO: XXX Only arity 0-2 supported: "+termName);
        }
    } else {
        // Variable
        termSpan = doc.createElement("a");
        //termSpan.href = "#" + tag + "=" + path;
        termSpan.className += " variable";
        termSpan.style["background-color"] = varColors[exp];
        width = 1;
        height = 1;
        var txtSpan = doc.createElement("span");
        txtSpan.className = " txt";
        txtSpan.style.width="100%";
        txtSpan.style.height="100%";
        termSpan.appendChild(txtSpan);
        termSpan.className += " txtBox";
        var spans = spanMap["v" + exp];
        if (!spans) {
            spans = [];
            spanMap["v" + exp] = spans;
        }
        spans.push(termSpan);
        var innerHTML = varNamer(exp);
        var whichChild = path[path.length - 1];
        for (var i = path.length  - 1; (i >= 0) && path[i] == whichChild; i--) {
            if (whichChild == 1) {
                innerHTML = innerHTML + ")";
            } else if (whichChild == 0) {
                innerHTML = "(" + innerHTML;
            }
        }
        txtSpan.innerHTML = innerHTML;
    }
    if (cb) {
        var onclick = cb(path);
        if (onclick) {
            termSpan.onclick = onclick;
        }
    }
    spanMap[path] = termSpan;
    termSpan.zpath = path.slice();
    termSpan.className += " term";
    termSpan.className += " depth" + path.length;
    if (path.length > 0) {
        var inputNum = path[path.length - 1];
        termSpan.className += " input" + inputNum + "of" + inputTot;
    }
    termSpan.treeWidth = width;
    termSpan.treeHeight = height;
    return ({span:termSpan, width:width, height:height});
}

function makeThmBox(fact, exp, cb) {
    var termBox = document.createElement("span");
    termBox.className += " termbox";
    var spanMap = {};
    var namer = newVarNamer();
    var tree = makeTree(document, fact, exp, [], -1, namer, spanMap, cb);
    termBox.appendChild(tree.span);
    tree.span.style.width = "100%";
    tree.span.style.height = "100%";
    termBox.style.width = "" + (2 * tree.width) + "em";
    termBox.style.height ="" + (2 * tree.height) + "em";
    termBox.spanMap = spanMap;
    spanMap[[]] = tree.span;
    termBox.tree = tree;
    
    var nullCb = function(){};
    fact.Core[Fact.CORE_FREE].forEach(function(fm) {
        var fmSpan = document.createElement("span");
        fmSpan.className = "freemap";
        termBox.appendChild(fmSpan);
        fm.forEach(function(v) {
            var vTree = makeTree(document, fact, v, [], -1, namer);
            fmSpan.appendChild(vTree.span);
        });
    });
    return termBox;
}


function size(thmBox, ems) {
    thmBox.style.width = ems + "em";
    thmBox.style.height = ems + "em";
    thmBox.tree.span.style["font-size"] = "" + (50 * ems / thmBox.tree.width) + "%";
}

function cssEscape(str) {
    // TODO: collisions
    return encodeURIComponent(str).replace(/%/g,"_");
}
function registerNewTool(toolOp) {
    var styleEl = document.createElement('style');
    // Apparently some version of Safari needs the following line? I dunno.
    styleEl.appendChild(document.createTextNode(''));
    document.head.appendChild(styleEl);
    var styleSheet = styleEl.sheet;
    for (var arg = 1; arg <= 2; arg++) {
        var rule = ".tool" + cssEscape(toolOp) + "_" + arg +
            " .shooter .depth1.input" + arg + "of2.tool" + cssEscape(toolOp) +
            " { border: 2px solid black; cursor:pointer;}";

        styleSheet.insertRule(rule, 0);
    }

}

function setWorkPath(wp) {
    var className = "";
    if (typeof wp == 'undefined') {
        delete state.workPath;
    } else {
        state.workPath = wp;
        var usableTools = Engine.getUsableTools(state.work, state.workPath);
        for (var k in usableTools) if (usableTools.hasOwnProperty(k)) {
            var v = usableTools[k];
            className += " tool" + cssEscape(v[0]) + "_" + v[1];
        }
    }
    document.body.className = className;
}

function addToShooter(factData, land) {
    if (!factData) {
        throw new Error("Bad fact: "+ factData);
    }
    if (!land) land = currentLand();
    var fact = Engine.canonicalize(new Fact(factData));
    var factFp = storage.fpSave("fact", fact);
    var newTool = Engine.onAddFact(fact);
    if (newTool) {
        registerNewTool(newTool);
    }
    switch (fact.Core[Fact.CORE_HYPS].length) {
    case 0:
        var box;
        var factOnclickMaker = function(path) {
            if (path.length != 1) {
                return null;
            }
            var factPath = path.slice();
            return function(ev) {
                console.log("ApplyFact " + fact.Skin.Name);
                try {
                    doAnimate(fact, box, factPath,
                              state.work, workBox, state.workPath, function() {
                                  var newWork = Engine.applyFact(
                                      state.work, state.workPath,
                                      fact, factPath);
                                  message("");
                                  state.url = "";
                                  setWorkPath();
                                  setWork(newWork);
                                  redraw();
                              });
                } catch (e) {
                    console.log("Error in applyFact: " + e);
                    console.log(e.stack);
                    message(e);
                }
                ev.stopPropagation();
            };
        };
        box = makeThmBox(fact, fact.Core[Fact.CORE_STMT], factOnclickMaker);
        box.className += " shooter";
        size(box, 2 * SIZE_MULTIPLIER);
        landMap[land.name].pane.appendChild(box);
        var turnstile = document.createElement("span");
        turnstile.className = "turnstile";
        turnstile.innerText = "\u22a2";
        turnstile.onclick = function(ev) {
            try {
                state.url = "#u=" + (urlNum++) + "/=]" + "#f=" + fact.Skin.Name;
                var thm = Engine.ground(state.work, fact);
                var newFactFp = addToShooter(thm);
                currentLand().thms.push(newFactFp);
                message("");
                setWorkPath();
                nextGoal();
                redraw();
            } catch (e) {
                console.log("Error in ground: " + e);
                console.log(e.stack);
                message(e);
            }
            ev.stopPropagation()
        };
    
        box.appendChild(turnstile);
        factToShooterBox[fact.Skin.Name] = {
            fact: fact,
            box: box,
            land: land.name,
            turnstile: turnstile
        };
        box.id = "shooter-" + fact.Skin.Name;
        break;
    case 1:
        // Adding generify to the shooter
        var box;
        var factOnclickMaker = function(path) {
            return null;
        };
        var hyp0box = makeThmBox(fact, fact.Core[Fact.CORE_HYPS][0],factOnclickMaker);
        var stmtbox = makeThmBox(fact, fact.Core[Fact.CORE_STMT], factOnclickMaker);
        size(hyp0box, 2 * SIZE_MULTIPLIER);
        size(stmtbox, 2 * SIZE_MULTIPLIER);
        landMap[land.name].pane.appendChild(hyp0box);
        hyp0box.appendChild(stmtbox);
        hyp0box.onclick = function(ev) {
            try {
                setWork(Engine.applyInference(state.work, fact));
                message("");
                setWorkPath();
                state.url = "";
            } catch (e) {
                console.log("Error in applyInference: " + e);
                console.log(e.stack);
                message(e);
            }
            redraw();
            ev.stopPropagation()
        };
        break;
    default:
        console.log("Skipping inference: " + JSON.stringify(fact.Core));
    } // TODO: handle axioms with hyps
    return factFp;
}


function workOnclickMaker(path) {
    var goalPath = path.slice();
    if (goalPath[goalPath.length-1] == 0) {
        goalPath.pop();
    }
    return function(e) {
        setWorkPath(goalPath);
        // Highlight usable tools.
        // TODO: move this somewhere else
        state.url = "#u=" + (urlNum++) + "/#g=" + goalPath;
        save();
        redrawSelection();
        e.stopPropagation();
    }
}

function startWork(fact) {
    var work = new Fact(fact);
    work.setHyps([work.Core[Fact.CORE_STMT]]);
    work.Skin.HypNames = ["Hyps.0"];
    if (!work.Tree.Cmd) {
        work.setCmd("thm");
    }
    work.setProof(["Hyps.0"]);
    return Engine.canonicalize(work);
}

function setWork(work) {
    state.work = work;
    state.workHash = Engine.fingerprint(work);
    save();
}

function save() {
    var stateFp = storage.fpSave("state", state);
    if (stateFp != log.now) {
        var oldNow = log.now;
        log.now = stateFp;
        var logFp = storage.fpSave("log", log);
        log.parent = logFp;
        storage.local.setItem("childOf/" + oldNow, logFp);
        storage.local.setItem(STATE_KEY, logFp);
        if (storage.user) {
            storage.remote.child("users").child(storage.user.uid).
                child(STATE_KEY).set(logFp);
        }
        history.pushState(logFp, "state", "#s=" + stateFp + "/" + state.url);
    }
}

function currentLand() {
    return state.lands[state.lands.length-1];
}
function nextGoal() {
    var land = currentLand();
    var goal = land.goals.shift();
    if (!goal) {
        delete land.goals;
        var nextLand = landDepMap[land.name]; // XXX
        if (nextLand) {
            enterLand(nextLand);
            return nextGoal();
        } else {
            message("No more lands! You win! Now go write a land.");
        }
    }
    state.work = startWork(goal);
    save();
    return goal;
}

function onNextRedraw(f) {
    deferredUntilRedraw.push(f);
}
function redrawSelection() {
    if (selectedNode) {
        selectedNode.className += "NOT";
    }
    if (typeof state.workPath !== 'undefined') {
        selectedNode = workBox.spanMap[state.workPath];
        if (!selectedNode) {
            throw new Error("Selected node not found:" + state.workPath);
        }
        selectedNode.className += " selected";
    }
}
function redraw() {
    deferredUntilRedraw.forEach(function(f) { f(); });
    deferredUntilRedraw.splice(0, deferredUntilRedraw.length);
    var well = document.getElementById("well");
    try {
        var box = makeThmBox(state.work,
                             state.work.Core[Fact.CORE_HYPS][0],
                             workOnclickMaker);
        size(box, box.tree.width * SIZE_MULTIPLIER);
        well.removeChild(well.firstChild);
        well.appendChild(box);
        workBox = box;
        redrawSelection();
        Engine.forEachGroundableFact(state.work, function(w, f) {
            message("Groundable: " + f.Skin.Name);
            message("Ground out!");
            var box = factToShooterBox[f.Skin.Name];
            box.turnstile.style.display = "block";
            landMap[box.land].tab.className = "tab groundable";
            onNextRedraw(function() {
                box.turnstile.style.display = "none";
                landMap[box.land].tab.className = "tab";
            });
        });
    } catch (e) {
        message(e);
    }
}

function loadState(flat) {
    state = flat;
    state.work = new Fact(state.work);
    setWorkPath(state.workPath);
    message("");
}

function loadLogFp(logFp, cb) {
    storage.fpLoad("log", logFp, function(logObj) {
        storage.fpLoad("state", logObj.now, function(stateObj) {
            log = logObj;
            loadState(stateObj);
            redraw();
            // TODO: should popstate? double-undo problem.
            history.pushState(logFp, "state",
                              "#s=" + logObj.now + "/" + state.url);
            document.getElementById("forward").style.visibility="visible";
            if (cb) {cb();}
        });
    });
}
function enterLand(landData) {
    var land = {
        name:landData.name,
        thms:[],             // hash values
        goals:[],            // structs
    };
    state.lands.push(land);
    addLandToUi(land);
    land.goals = landData.goals.slice();
    if (landData.axioms) {
        landData.axioms.forEach(function(data) {
            var factFp = addToShooter(data);
            land.thms.push(factFp);
        });
    }
}

function addLandToUi(land) {
    if (landMap[land.name] && landMap[land.name].pane) {
        console.log("Warning: Skipping already-added land " + land.name);
        return;
    }
    var tab = document.createElement("button");
    document.getElementById("shooterTabs").appendChild(tab);
    tab.className = "tab";
    tab.innerHTML = land.name.replace(/[<]/g,"&lt;");
    var pane = document.createElement("span");
    document.getElementById("shooterTape").appendChild(pane);
    if (!landMap[land.name]) {
        landMap[land.name] = {land:land};
    }
    landMap[land.name].pane = pane;
    landMap[land.name].tab = tab;
    pane.className = "pane pane" + land.name;
    tab.onclick = function() {
        if (currentPane) {currentPane.style.display="none";}
        pane.style.display="inline-block";
        currentPane = pane;
    };
    tab.onclick();
}

function message(msg) {
    if (msg) {console.log("Tacro: " + msg);}
    document.getElementById("message").innerText = msg;
}

function cheat(n) {
    while (n > 0) {
        var thm = new Fact(state.work);
        thm.Tree.Proof=[];
        thm.Tree.Cmd = 'stmt'
        thm.setHyps([]);
        var factFp = addToShooter(thm);
        currentLand().thms.push(factFp);
        message("");
        nextGoal();
        n--;
        redraw();
        save();
    }
}
function exportFacts() {

    console.log("==== EXPORT BEGIN ====");
    state.lands.forEach(function(land) {
        land.thms.forEach(function(thmFp) {
            var factData = storage.fpLoad("fact",thmFp);
            if (factData.length < 4000) {
                console.log("addFact(" + factData + ")");
            } else {
                console.log("addFact(" + factData.substring(0,4000));
                while (factData.length > 0) {
                    factData = factData.substring(4000);
                    console.log("        " + factData.substring(0, 4000));
                }
                console.log("      )");
            }
        });
    });
   
    console.log("==== EXPORT END ====");
}




window.addEventListener('popstate', function(ev) {
    console.log("popstate to " + ev.state);
    if (ev.state) {
        loadLogFp(ev.state);
    }
});
document.getElementById("rewind").onclick = function() {
    var parentFp = log.parent;
    if (parentFp) {
        loadLogFp(parentFp);
    }
    return false;
};
document.getElementById("forward").onclick = function() {
    var childLogFp = storage.local.getItem("childOf/" + log.now);
    if (childLogFp) {
        loadLogFp(childLogFp);
    } else {
        document.getElementById("forward").style.visibility="hidden";
    }
    return false;
};


function firebaseLoginLoaded() {
    console.log("Firebase Login loaded.");
    storage.authInit(FirebaseSimpleLogin, function(user) {
        if (user) {
            // user authenticated
            var loginNode = document.getElementById("login");
            loginNode.disabled = false;
            loginNode.innerText = user.displayName;
            loginNode.onclick = function() {
                storage.authLogout();
                return false;
            }
            storage.remote.child("users").child(user.uid).child(STATE_KEY).
                on('value', function(snap) {
                    var logFp = snap.val();
                    console.log("Found remote logFp: " + logFp);
                });
        } else {
            // user is logged out
            document.getElementById("login").innerText = "guest";
            resetLoginLink();
        }
    });
}


function resetLoginLink() {
    var link = document.getElementById("login");
    link.disabled = false;
    link.onclick = function() {
        storage.authLogin();
        return false;
    };
}


var logFp = storage.local.getItem(STATE_KEY);
if (logFp) {
    loadLogFp(logFp, function() {
        state.lands.forEach(function(land) {
            addLandToUi(land);
            land.thms.forEach(function(thmFp) {
                storage.fpLoad("fact", thmFp, function(thmObj) {
                    addToShooter(thmObj, land);
                });
            });
        });
        if (window.location.search.match("CHEAT")) {
            cheat(1);
        }
    });
} else {
    state = {
        lands: [],
        url:"",
    };
}

storage.remoteGet("checked/lands", function(lands) {
    var numLands = 0;
    for (var n in lands) if (lands.hasOwnProperty(n)) {
        numLands++;
        land = JSON.parse(lands[n].land);
        landMap[land.name] = {land:land};
        if (land.depends && land.depends.length > 0) {
            landDepMap[land.depends[0]] = land; // TODO: multidep
        } else {
            landDepMap[undefined] = land;
            if (!state) {
                state = {
                    lands:[],
                    url: "",
                }
            }
            if (state.lands.length == 0) {
                enterLand(land);
                nextGoal();
                state.url = "";
                save();
                redraw();
            }
        }
    }
    console.log("Got checked lands: " + numLands);
});


function getPageCoords(node) {
    var x = 0;
    var y = 0;
    do {
        y += node.offsetTop;
        x += node.offsetLeft;
    } while ((node = node.offsetParent));
    return [x,y];
}

// Forwards to reallyDoAnimate, but sets a timeout to make sure onDone always gets
// called.
function doAnimate(fact, factBox, factPath, work, workBox, workPath, onDone) {
    var complete = false;
    var timeout;
    var callback = function() {
        if (!complete) {
            comblete = true;
            onDone();
            if (timeout) {
                window.clearTimeout(timeout);
            }
        }
    }
    try {
        reallyDoAnimate(fact, factBox, factPath, work, workBox, workPath, callback);
        timeout = window.setTimeout(function() {
            if (!complete) {
                console.log("Timeout in reallyDoAnimate! ");
                onDone();
            }
        }, 6000);
    } catch (e) {
        console.log("Error in reallyDoAnimate: " + e);
        console.log(e.stack);
        onDone();
    }
}

function reallyDoAnimate(fact, factBox, factPath, work, workBox, workPath, onDone) {
    var factRect = factBox.getBoundingClientRect();
    var childRect = factBox.spanMap[factPath].getBoundingClientRect();
    var dstRect = workBox.spanMap[workPath].getBoundingClientRect();
    var clone = makeThmBox(fact, fact.Core[Fact.CORE_STMT]);
    clone.className += " shooter";
    size(clone, 2 * SIZE_MULTIPLIER);
    document.body.appendChild(clone);
    clone.style.position = "absolute";
    var xxxWtf = 26;
    clone.style.left = factRect.left + xxxWtf + "px"; // TOOD XXX WTF
    clone.style.top = factRect.top + xxxWtf + "px";// TOOD XXX WTF
    clone.className += " animClone";
    var anim = Move(clone);
    anim.tag = "grow";
    var origAnim = anim;

    /* Goal of this matrix, when applied to fact:
     *    Origin = (ox, oy) = middle of fact
     * 1. top-right of child moves to top-left of dst, though left 5 px
     *    M * (childTR-factTL) = (dstTL-factTL) - (5,0)
     * 2. bottom-right of child moves to bottom-left of dst, left 5px
     *    M * (childBR-factTL) = (dstBL-factTL) - (5,0)
     * 3. aspect ratio preserved (x scale == y scale)
     */
    var ox = factRect.left + factRect.width / 2.0;
    var oy = factRect.top + factRect.height / 2.0;
    var scale = factBox.tree.width / 2.0;
    console.log("XXXX Scale="  +scale);
    var dx = dstRect.left + xxxWtf - ((factRect.width * scale / 2.0)) - ox;
    var dy = dstRect.top - (childRect.top - oy) * scale - oy;
    anim = anim.matrix(scale, 0,
                       0, scale,
                       dx, dy);
    
    // Now the fact is sitting next to the target. Time to animate the unify.
    var varMap = Engine.getMandHyps(work, workPath, fact, factPath);
    // This map is used for sizing a new tree in order calculate intermediate
    // animation scales. Every var is mapped to zero, except for onces which
    // have already been mapped to terms.
    var partialVarMap = {};
    for (var v in varMap) if (varMap.hasOwnProperty(v)) {
        partialVarMap[v] = 0;
    }
    // A map to spans which will be queried for the progressively-computed treeWidth and treeHeight.
    var partialSpanMap = clone.spanMap;
    var varNamer = newVarNamer(); // TODO: should use work's varNamer
    for (var v in varMap) if (varMap.hasOwnProperty(v)) {
        var term = varMap[v];
        if (term != v) {
            var spans = clone.spanMap["v" + v];
            var next;
            if (Array.isArray(term)) {
                // Changing var to term. Need to grow the var square, and all of
                // its parent squares.
                partialVarMap[v] = term;
                var newSpanMap = {};
                var newTree = makeTree(document, work, Engine.globalSub(fact, partialVarMap, work),
                                       [], -1, varNamer, newSpanMap);
                
                var scaleMap = {};
                for (var spanPath in clone.spanMap) {
                    if (newSpanMap.hasOwnProperty(spanPath) && (spanPath[0] != "v")) {
                        scaleMap[spanPath] = {}
                        var newSpan = newSpanMap[spanPath];
                        var oldSpan = partialSpanMap[spanPath];
                        scaleMap[spanPath].x = newSpan.treeWidth / oldSpan.treeWidth;
                        scaleMap[spanPath].y = newSpan.treeHeight / oldSpan.treeHeight;
                    }
                }
                console.log("Raw scales: " + JSON.stringify(scaleMap));
                // Now we have computed the amount by which we want to scale
                // each span in this anim step. Unfortunately, some are
                // contained in others and scaling is inherited!
                var actualScaleMap = {};
                function actuallyScale(spanPath) {
                    spanPath = spanPath.slice();
                    if (actualScaleMap.hasOwnProperty(spanPath)) {
                        return actualScaleMap[spanPath];
                    }
                    var desiredScale = {x: scaleMap[spanPath].x,
                                        y: scaleMap[spanPath].y};
                    actualScaleMap[spanPath] = desiredScale;
                    next = Move(clone.spanMap[spanPath]);
                    var msg = "Path " + spanPath + " :";
                    while (spanPath.length > 0) {
                        spanPath.pop();
                        var inheritedScale = actuallyScale(spanPath);
                        desiredScale.x /= inheritedScale.x;
                        msg += " x /= " + inheritedScale.x;
                        desiredScale.y /= inheritedScale.y;
                    }
                    next.duration(2000); //XXX
                    next.matrix(desiredScale.x, 0, 0, desiredScale.y, 0, 0);
                    // TODO: PICKUP: I think these scales are right, but they mess up the positoins.
                    // screw up all the positions. :(
                    console.log(msg + " scale (" + desiredScale.x  + "x" + desiredScale.y +")");
                    anim.then(next);
                    return desiredScale;
                }
                for (var spanPath in clone.spanMap) {
                    if (newSpanMap.hasOwnProperty(spanPath) && (spanPath[0] != "v")) {
                        var pathArr = spanPath ? spanPath.split(/,/) : [];
                        actuallyScale(pathArr);
                    }
                }
                 
                partialSpanMap = newTree.spanMap;
            } else {
                // Changing var to var. change color of all the spans
                // simultaneously.
                spans.forEach(function(span) {
                    next = Move(span).set("background-color",
                                          varColors[term]);
                    next.tag = "background-color";
                    anim.then(next);
                });
            }
            if (next) {
                anim = next;
            }

        }
    };
    // Now the unify is complete. Move the child onto the dst.
    var next = Move(clone);
    next.tag = "slide";
    next._transforms = origAnim._transforms.slice();
    next.x(dstRect.width / scale + 15); // TODO: XXX WTF
    anim.then(next);
    anim = next;
    anim = anim.then().y(0); // XXX needed or anims bleed together?
    // Now move the child and the root-arrow off the screen, along with the work


    var dy = document.body.offsetHeight;
    next = Move(clone.spanMap[factPath]);
    next.tag = "wipe1";
    next.y(dy);
    anim.then(next);
    
    next = Move(clone.spanMap[[0]]);
    next.tag = "wipe2";
    next.y(dy);
    anim.then(next);
    
    next = Move(workBox).y(dy);
    next.tag = "wipe3";
    anim.then(next);
    
    var otherHalf = clone.spanMap[[3-factPath[0]]];
    anim = next;
    //XXX WTF
    next = Move(otherHalf).translate((factRect.width - childRect.width) / 2,
                                     (factRect.height - childRect.height) / 2);
    anim.then(next);
    anim = next;
    anim.then(function() { clone.parentNode.removeChild(clone) });
    anim = anim.then(onDone);
    
    // Need to delay to next tick so that the clone shows up in original spot.
    window.setTimeout(origAnim.end.bind(origAnim),0);
}

//XXX


window.setTimeout(function() {

    setWorkPath([]);
    redrawSelection();
    var sbox = factToShooterBox["neHAKB"];
    
    doAnimate(sbox.fact, sbox.box, [2],
              state.work, workBox, state.workPath,
              function(){message("XXX done");});
}, 250);


/*
*/
