class LineManager {
    /**
     * 构造器
     * @param {LinerManager} baseManager 连线管理器
     * @param {number} leftIndex 左边的坐标
     * @param {number} rightIndex 右边的坐标
     */
    constructor(baseManager, leftIndex, rightIndex) {
        this.baseManager = baseManager;
        this.leftIndex = leftIndex;
        this.rightIndex = rightIndex;
        this.element = document.createElement("div");

        let leftHeight = (leftIndex + 0.5) / baseManager.leftBlocks.children.length;
        let rightHeight = (rightIndex + 0.5) / baseManager.leftBlocks.children.length;

        if (leftHeight < rightHeight) {
            this.element.classList.add("line");
            this.element.style.top = `${leftHeight * 100}%`;
            this.element.style.height = `${(rightHeight - leftHeight) * 100}%`;
        } else if (leftHeight > rightHeight) {
            this.element.classList.add("line-rev");
            this.element.style.top = `${rightHeight * 100}%`;
            this.element.style.height = `${(leftHeight - rightHeight) * 100}%`;
        } else {
            this.element.classList.add("line-no-height");
            this.element.style.top = `${rightHeight * 100}%`;
            this.element.style.height = "400px";
        }

        this.baseManager.lineContainer.appendChild(this.element);
    }

    leave() {
        this.element.remove();
        this.baseManager.connected.splice(this.baseManager.connected.indexOf(this), 1);
        delete this.element;
        delete this;
    }

    match(x, y) {
        return this.leftIndex == x && this.rightIndex == y;
    }
}

class LinerManager {
    /**
     * 构造器
     * @param {HTMLDivElement} baseElement 父级元素
     */
    constructor(baseElement) {
        this.baseElement = baseElement;
        this.leftBlocks = baseElement.querySelector("div.liner-blocks.liner-left");
        this.rightBlocks = baseElement.querySelector("div.liner-blocks.liner-right");
        this.lineContainer = baseElement.querySelector("div.lines");
        this.leftSelected = -1;
        this.rightSelected = -1;
        this.connected = [];
        this.listeners = [];

        for (let i = 0; i < this.leftBlocks.children.length; i++) {
            let ele = this.leftBlocks.children[i];
            ele.addEventListener("click", () => {
                if (ele.classList.contains("select")) {
                    this.leftSelected = -1;
                    ele.classList.remove("select");
                } else {
                    this.leftSelected = i;

                    this.clearLeftSelectedStyle();

                    ele.classList.add("select");

                    if (this.rightSelected != -1) {
                        this.connect();
                    }
                }
            });
        }

        for (let i = 0; i < this.rightBlocks.children.length; i++) {
            let ele = this.rightBlocks.children[i];
            ele.addEventListener("click", () => {
                if (ele.classList.contains("select")) {
                    this.rightSelected = -1;
                    ele.classList.remove("select");
                } else {
                    this.rightSelected = i;

                    this.clearRightSelectedStyle();

                    ele.classList.add("select");

                    if (this.leftSelected != -1) {
                        this.connect();
                    }
                }
            });
        }
    }

    clearLeftSelectedStyle() {
        for (let i = 0; i < this.leftBlocks.children.length; i++) {
            let ele = this.leftBlocks.children[i];
            ele.classList.remove("select");
        }
    }

    clearRightSelectedStyle() {
        for (let i = 0; i < this.rightBlocks.children.length; i++) {
            let ele = this.rightBlocks.children[i];
            ele.classList.remove("select");
        }
    }

    exists(x, y) {
        return this.connected.findIndex(ele => ele.match(x, y)) != -1;
    }

    find(x, y) {
        return this.connected.find(ele => ele.match(x, y));
    }

    connect() {
        if (this.exists(this.leftSelected, this.rightSelected)) {
            this.find(this.leftSelected, this.rightSelected).leave();
        } else {
            this.connected.filter(v => v.leftIndex == this.leftSelected).forEach(v => v.leave());
            this.connected.filter(v => v.rightIndex == this.rightSelected).forEach(v => v.leave());
            this.connected.push(new LineManager(this, this.leftSelected, this.rightSelected));
        }

        this.listeners.forEach(listener => listener());

        this.leftSelected = -1;
        this.rightSelected = -1;
        this.clearLeftSelectedStyle();
        this.clearRightSelectedStyle();
    }

    /**
     * 导出对应的数据
     * @returns {string} 经过状态压缩的数据
     */
    exportData() {
        // let oneConnectionTypeCount = this.rightBlocks.children.length + 1;
        // let finalResult = [];

        // for (let i = 0; i * 6 < this.leftBlocks.children.length; i++) {
        //     let result = 0;

        //     for (let j = 0; j < 6; j++) {
        //         result *= oneConnectionTypeCount + 1;
        //         if (i * 6 + j >= this.leftBlocks.children.length) {
        //             break;
        //         }

        //         let connectIndex = this.connected.findIndex(v => v.leftIndex == i * 6 + j);
        //         if (connectIndex != -1) {
        //             result += this.connected[connectIndex].rightIndex + 1;
        //         }
        //     }

        //     finalResult.push(NumberToBase64(result));
        // }

        // return finalResult.join(",");
        let charmap = "0123456789abcdefg=";
        let result = "";
        for (let i = 0; i < this.leftBlocks.children.length; i++) {
            let connectIndex = this.connected.findIndex(v => v.leftIndex == i);
            if (connectIndex != -1) {
                result += charmap[this.connected[connectIndex].rightIndex];
            } else {
                result += "=";
            }
        }
        return result;
    }

    addChangeListener(listener) {
        this.listeners.push(listener);
    }
}

function ComputeFinalResult(workLiner, imitatorLiner) {
    return workLiner.exportData() + ";" + imitatorLiner.exportData();
}

/**
 * 将整数转换为 Base64
 * @param {number} input 输入的整数
 */
function NumberToBase64(input) {
    let result = "";
    let charmap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let num = input;

    while (num != 0) {
        result = charmap[num % charmap.length] + result;
        num = Math.floor(num / charmap.length);
    }

    return result;
}
