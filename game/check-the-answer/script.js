function createDivElementByClassName(parent, className) {
    var element = document.createElement("div");
    element.classList.add(className);
    parent.appendChild(element);
    return element;
}
function clearElementInside(element) {
    while (element.childNodes.length != 0) {
        element.childNodes[0].remove();
    }
}
var GameStatus = /** @class */ (function () {
    function GameStatus(defaultValue) {
        this.statusDict = {};
        if (defaultValue != undefined) {
            for (var key in defaultValue) {
                this.statusDict[key] = defaultValue[key];
            }
        }
    }
    GameStatus.prototype.set = function (key, val) {
        this.statusDict[key] = val;
    };
    GameStatus.prototype.add = function (key, val) {
        if (this.statusDict[key] == undefined) {
            this.statusDict[key] = val;
        }
        else {
            this.statusDict[key] += val;
        }
    };
    GameStatus.prototype.display = function (container) {
        clearElementInside(container);
        for (var key in this.statusDict) {
            var element = createDivElementByClassName(container, "control-panel-list-element");
            element.innerText = "".concat(key, ": ").concat(this.statusDict[key]);
        }
    };
    return GameStatus;
}());
var GameContainer = /** @class */ (function () {
    function GameContainer(container, nodes, beginId, status) {
        var _this = this;
        this.container = container;
        this.nodes = nodes !== null && nodes !== void 0 ? nodes : defaultNodes;
        var _ = beginId ? this.nodes.filter(function (v) { return v.id == beginId; })[0] : this.nodes[0];
        if (_ == undefined) {
            throw new TypeError("\u4E0D\u5B58\u5728 Id \u4E3A ".concat(beginId, " \u7684\u8282\u70B9\uFF01"));
        }
        this.currentNode = _;
        clearElementInside(this.container);
        this.cardView = createDivElementByClassName(this.container, "card");
        this.title = createDivElementByClassName(this.cardView, "card-title");
        this.description = createDivElementByClassName(this.cardView, "card-description");
        this.selectionContainer = createDivElementByClassName(this.cardView, "selection-container");
        this.controlPanel = createDivElementByClassName(this.container, "control-panel");
        this.resetButton = createDivElementByClassName(this.controlPanel, "control-panel-button");
        this.resetButton.addEventListener("click", function () {
            if (confirm("如果你重置游戏，所有的进度都会丢失。确定吗？")) {
                _this.gameStatus = new GameStatus(defaultStatus);
                _this.jump(beginId, {});
            }
        });
        this.resetButton.innerText = "重置游戏";
        this.statusList = createDivElementByClassName(this.controlPanel, "control-panel-list");
        this.gameStatus = status !== null && status !== void 0 ? status : new GameStatus(defaultStatus);
        this.updateView();
    }
    GameContainer.prototype.jump = function (id, delta) {
        var _ = id ? this.nodes.filter(function (v) { return v.id == id; })[0] : this.nodes[0];
        if (_ == undefined) {
            throw new TypeError("\u4E0D\u5B58\u5728 Id \u4E3A ".concat(id, " \u7684\u8282\u70B9\uFF01"));
        }
        this.currentNode = _;
        for (var key in delta) {
            if (key[0] == "$") {
                var _key = key.substring(1);
                this.gameStatus.set(_key, delta[key]);
            }
            else {
                this.gameStatus.add(key, delta[key]);
            }
        }
        this.updateView();
    };
    GameContainer.prototype.updateView = function () {
        clearElementInside(this.selectionContainer);
        this.gameStatus.display(this.statusList);
        this.currentNode.display(this);
    };
    GameContainer.prototype.getStatus = function (key) {
        var _a;
        return (_a = this.gameStatus.statusDict[key]) !== null && _a !== void 0 ? _a : 0;
    };
    return GameContainer;
}());
var GameSelection = /** @class */ (function () {
    function GameSelection(targetId, title, checkFunction, description, delta, doConfirm) {
        this.targetId = targetId;
        this.title = title;
        this.checkFunction = checkFunction !== null && checkFunction !== void 0 ? checkFunction : (function (_) { return true; });
        this.description = description !== null && description !== void 0 ? description : "";
        this.delta = delta !== null && delta !== void 0 ? delta : {};
        this.confirm = doConfirm;
    }
    GameSelection.prototype.createElement = function (parent) {
        var _this = this;
        var element = createDivElementByClassName(parent.selectionContainer, "card-selection");
        var title = createDivElementByClassName(element, "card-selection-title");
        title.innerHTML = this.title;
        var description = createDivElementByClassName(element, "card-selection-description");
        description.innerHTML = this.description;
        if (!this.checkFunction(parent)) {
            element.classList.add("card-selection-disabled");
        }
        element.addEventListener("click", function () {
            if (_this.confirm) {
                if (!confirm("你确定你已经通过流程图得到了答案，且你只是来验证答案是否正确的吗？")) {
                    return;
                }
            }
            if (_this.checkFunction(parent)) {
                parent.jump(_this.targetId, _this.delta);
            }
            else {
                alert("\u4F60\u6CA1\u6709\u8FBE\u6210\u9009\u62E9\u9009\u9879\u201C".concat(_this.title, "\u201D\u7684\u6761\u4EF6\uFF1A\n").concat(_this.description));
            }
        });
        return element;
    };
    return GameSelection;
}());
var NodeType;
(function (NodeType) {
    NodeType[NodeType["normalNode"] = 0] = "normalNode";
    NodeType[NodeType["winNode"] = 1] = "winNode";
    NodeType[NodeType["loseNode"] = 2] = "loseNode";
    NodeType[NodeType["importantNodeBegin"] = 3] = "importantNodeBegin";
})(NodeType || (NodeType = {}));
var GameNode = /** @class */ (function () {
    function GameNode(id, title, selections, description, nodeType) {
        this.id = id;
        this.nodeType = nodeType !== null && nodeType !== void 0 ? nodeType : NodeType.normalNode;
        this.title = title;
        this.selections = selections;
        this.description = description !== null && description !== void 0 ? description : "";
    }
    GameNode.prototype.display = function (container) {
        container.title.innerHTML = this.title;
        container.description.innerHTML = this.description;
        if (this.nodeType == NodeType.importantNodeBegin) {
            container.container.classList.add("card-style-important");
        }
        else {
            container.container.classList.remove("card-style-important");
        }
        this.selections.forEach(function (selection) {
            selection.createElement(container);
        });
    };
    return GameNode;
}());
var defaultNodes = [
    new GameNode("", "答案检验器", [
        new GameSelection("main", "那就开始吧！<span style='color: #f99; font-weight: 900; font-size: 36px'>（请确保你已经看流程图得到答案了！！！）</span>", function (_) { return true; }, undefined, undefined, true)
    ], "游戏本体由玛丽的对头开发，本页面仅作为思路检验用。<span style='color: #f44; font-weight: 900; font-size: 36px'>请先在图片上自己走一遍流程，得到了答案以后</span>，再来到网页验证你的结果。图片请看：<a href='https://www.bilibili.com/opus/864580129344454676'>玛对动态</a>", NodeType.importantNodeBegin),
    new GameNode("main", "密室！", [
        new GameSelection("east", "选择：东"),
        new GameSelection("south", "选择：南"),
        new GameSelection("west", "选择：西"),
        new GameSelection("north", "选择：北"),
    ], "有一天你醒来，发现你在一个陌生的密室……"),
    new GameNode("north", "衣柜", [
        new GameSelection("north2", "选择：观察"),
        new GameSelection("main", "选择：返回"),
    ], "这是一个衣柜"),
    new GameNode("north2", "大衣", [
        new GameSelection("northGain", "选择：掏衣兜", function (_) { return true; }, undefined, {
            "1 元硬币": 1
        }),
        new GameSelection("main", "选择：返回"),
    ], "里面有一件大衣"),
    new GameNode("northGain", "在大衣里", [
        new GameSelection("main", "好的"),
    ], "你获得了 1 元硬币"),
    new GameNode("south", "判断", [
        new GameSelection("southGain", "是", function (gc) { return gc.getStatus("铁发条") > 0; }, "铁发条 > 0", {
            "纯金把手": 1
        }),
        new GameSelection("main", "否", function (gc) { return gc.getStatus("铁发条") <= 0; }, "铁发条 ≤ 0"),
    ], "发现一个没有发条的八音盒。铁发条 > 0？"),
    new GameNode("southGain", "八音盒打开", [
        new GameSelection("main", "好的"),
    ], "里面是纯金把手。纯金把手 + 1"),
    new GameNode("east", "判断", [
        new GameSelection("eastMain", "是", function (gc) { return gc.getStatus("纯金把手") > 0; }, "纯金把手 > 0"),
        new GameSelection("main", "否", function (gc) { return gc.getStatus("纯金把手") <= 0; }, "纯金把手 ≤ 0"),
    ], "有一个缺了把手的金门。纯金把手 > 0？"),
    new GameNode("eastMain", "走廊", [
        new GameSelection("shop", "选择：售货机"),
        new GameSelection("emeast", "选择：东门"),
        new GameSelection("emsouth", "选择：南门"),
        new GameSelection("east", "选择：西门"),
    ], "有三个门和一个售货机"),
    new GameNode("shop", "判断", [
        new GameSelection("shopGain", "是", function (gc) { return gc.getStatus("1 元硬币") > 0; }, "1 元硬币 > 0", {
            "水": 1,
            "1 元硬币": -1
        }),
        new GameSelection("eastMain", "否", function (gc) { return gc.getStatus("1 元硬币") <= 0; }, "1 元硬币 ≤ 0"),
    ], "售货机售卖 1 元钱的水，只收硬币。1 元硬币 > 0？"),
    new GameNode("shopGain", "成交", [
        new GameSelection("eastMain", "好的"),
    ], "1 元硬币 -1，水+1。"),
    new GameNode("emeast", "判断", [
        new GameSelection("gateGain", "是", function (gc) { return gc.getStatus("金钥匙") > 0; }, "金钥匙 > 0", {
            "10 元钞票": 1,
        }),
        new GameSelection("eastMain", "否", function (gc) { return gc.getStatus("金钥匙") <= 0; }, "金钥匙 ≤ 0"),
    ], "有一个被锁住的金门。金钥匙 > 0？"),
    new GameNode("gateGain", "发现里面有 10 元钞票", [
        new GameSelection("eastMain", "好的"),
    ], "10 元钞票 + 1"),
    new GameNode("emsouth", "判断", [
        new GameSelection("gateSelect", "是", function (gc) { return gc.getStatus("金钥匙") + gc.getStatus("纯金把手") + gc.getStatus("1 元硬币") + gc.getStatus("10 元钞票") > 0; }, "拥有金钥匙、纯金把手、1 元硬币、10 元硬币中的任何一个"),
        new GameSelection("eastMain", "否", function (gc) { return gc.getStatus("金钥匙") + gc.getStatus("纯金把手") + gc.getStatus("1 元硬币") + gc.getStatus("10 元钞票") <= 0; }, "没有金钥匙、纯金把手、1 元硬币、10 元硬币中的任何一个"),
    ], "遭遇受贿型机械警卫。拥有值钱的东西？\n（货币、金制品都是值钱的东西）"),
    new GameNode("gateSelect", "选择", [
        new GameSelection("chest", "给警卫金钥匙", function (gc) { return gc.getStatus("金钥匙") > 0; }, "拥有金钥匙", { "金钥匙": -1 }),
        new GameSelection("chest", "给警卫纯金把手", function (gc) { return gc.getStatus("纯金把手") > 0; }, "拥有纯金把手", { "纯金把手": -1 }),
        new GameSelection("chest", "给警卫 1 元硬币", function (gc) { return gc.getStatus("1 元硬币") > 0; }, "拥有 1 元硬币", { "1 元硬币": -1 }),
        new GameSelection("chest", "给警卫 10 元钞票", function (gc) { return gc.getStatus("10 元钞票") > 0; }, "拥有 10 元钞票", { "10 元钞票": -1 }),
    ], "选择一个你拥有数量 > 0 的值钱的东西"),
    new GameNode("chest", "来到宝库", [
        new GameSelection("openChest", "选择：开箱", function (_) { return true; }, "", { "金钥匙": 1 }),
        new GameSelection("emsouth", "选择：返回")
    ], "发现了一个宝箱"),
    new GameNode("openChest", "里面有个金钥匙", [
        new GameSelection("chest", "好的")
    ], "金钥匙 + 1"),
    new GameNode("west", "大门", [
        new GameSelection("west2", "选择：观察"),
        new GameSelection("main", "选择：返回"),
    ]),
    new GameNode("west2", "电路板", [
        new GameSelection("westGain", "选择：按按钮", function (_) { return true; }, undefined, {
            "铁发条": 1
        }),
        new GameSelection("westBreak", "选择：用水破坏电路"),
        new GameSelection("main", "选择：返回"),
    ], "有个按钮"),
    new GameNode("westGain", "旁边", [
        new GameSelection("main", "好的"),
    ], "暗门打开了，发现里面有个发条。你获得了一个铁发条。"),
    new GameNode("westBreak", "判断", [
        new GameSelection("westBroken", "是", function (gc) { return gc.getStatus("水") > 0; }, "水 > 0"),
        new GameSelection("west2", "否", function (gc) { return gc.getStatus("水") <= 0; }, "水 ≤ 0"),
    ], "水>0？"),
    new GameNode("westBroken", "门锁被破坏", [
        new GameSelection("west2", "选择：返回"),
        new GameSelection("leave", "选择：逃出"),
    ]),
    new GameNode("leave", "判断", [
        new GameSelection("win", "是", function (gc) { return gc.getStatus("1 元硬币") + 10 * gc.getStatus("10 元钞票") >= 10; }, "拥有货币 ≥ 10元", {
            "$1 元硬币": 0,
            "$10 元钞票": 0,
        }),
        new GameSelection("lose", "否", function (gc) { return gc.getStatus("1 元硬币") + 10 * gc.getStatus("10 元钞票") < 10; }, "拥有货币 < 10元"),
    ], "遭遇受贿型警卫(人)，他不认金子，需要行贿 10 元。\n 拥有货币 ≥ 10元？"),
    new GameNode("win", "成功脱出！", [], "YOU WIN"),
    new GameNode("lose", "被打死", [], "YOU LOSE"),
];
var defaultStatus = {
    "水": 0,
    "金钥匙": 0,
    "纯金把手": 0,
    "1 元硬币": 0,
    "10 元钞票": 0,
    "铁发条": 0,
};
// window.addEventListener("load", () => {
//     setTimeout(() => {
//         window.location.reload();
//     }, 1000);
// });
