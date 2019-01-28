window.onload = function() {
    ChangeAnimating();
    ChangePushIncrement();
    VerifyPushing();
}
var colors = [["#007fff", "#3fbfff", "#006f6f"],
                ["#ff7f00", "#ffbf3f", "#6f6f00"],
                ["#7fff00", "#9fdf3f", "#006f00"],
                ["#ff007f", "#ff7f7f", "6f0000]"]];

var pushIncrementing;
var TimeoutId;

var Timer = {
    animation : 1000,
    datetime : Date.now(),
    set animationTime(value) {
        this.animation = value;
    },
    get time() {
        let result = this.datetime - Date.now() + this.animation;
        this.datetime += (result < 0 ? this.animation - result : this.animation)
        return result;
    }
};

class PStack
{
    constructor(previous, value, color)
    {
        this.previous = previous;
        this.value = value;
        this.size = (previous ? previous.size + 1 : 0);
        this.color = (color != undefined ? color : Math.floor(Math.random() * 4) % 4);
    }

    Push(value, color)
    {
        return new PStack(this, value, color);
    }

    Pop()
    {
        return this.previous;
    }
};

class PQueue
{
    constructor(leftReserve, left, right, mediate,
        rightCopyReserve, rightCopy,
        recopy, toCopy, rightCopied)
    {
        this.leftReserve = (leftReserve ? leftReserve : new PStack());
        this.left = (left ? left : new PStack());
        this.right = (right ? right : new PStack());
        this.mediate = (mediate ? mediate : new PStack());
        this.rightCopyReserve = (rightCopyReserve ? rightCopyReserve : new PStack());
        this.rightCopy = (rightCopy ? rightCopy : new PStack());

        this.recopy = (recopy != undefined ? recopy : false);
        this.toCopy = (toCopy != undefined ? toCopy : 0);
        this.rightCopied = (rightCopied != undefined ? rightCopied : false);
    }

    Push(value)
    {
        let time = Timer.time;

        let newLeftReserve = this.leftReserve;
        let newLeft = this.left;
        let newRightCopyReserve = this.rightCopyReserve;
        let newRecopy = this.recopy;

        if (newRecopy)
        {
            newLeftReserve = newLeftReserve.Push(value);
            ReservePush(time, newLeftReserve);
        }
        else
        {
            newLeft = newLeft.Push(value);
            NormalPush(time, newLeft, newRightCopyReserve.size);
            newRecopy = newLeft.size > this.right.size;
            if (newRightCopyReserve.size)
            {
                newRightCopyReserve = newRightCopyReserve.Pop();
            }
        }
        let newQueue = new PQueue(newLeftReserve, newLeft, this.right, this.mediate,
            newRightCopyReserve, this.rightCopy, newRecopy, this.toCopy, this.rightCopied);

        if(!newRecopy)
        {
            TimeoutId = setTimeout(PrintVersion, time, queueIndex + 1, "Додано елемент \"" + value + "\"", 0);
        }
        return (newRecopy ? newQueue.Recopy(true, value) : newQueue);
    }

    Pop()
    {
        let time = Timer.time;

        let newRight = this.right;
        let newRightCopyReserve = this.rightCopyReserve;
        let newRightCopy = this.rightCopy;
        let newToCopy = this.toCopy;
        let newRecopy = this.recopy;
        let value = this.Get();

        if (newRecopy)
        {
            if (newToCopy > 0)
            {
                newToCopy = newToCopy - 1;
                RecopyPop(time);
            }
            else
            {
                newRight = newRight.Pop();
                newRightCopyReserve = newRightCopyReserve.Pop();
                RecopyExtendedPop(time);
            }
        }
        else
        {
            newRight = newRight.Pop();
            NormalPop(time, newRightCopyReserve.size);
            if (this.left.size > newRight.size)
            {
                newRecopy = true;
            }
            if (newRightCopyReserve.size)
            {
                newRightCopyReserve = newRightCopyReserve.Pop();
            }
        }

        newRightCopy = newRightCopy.Pop();
        let newQueue = new PQueue(this.leftReserve, this.left, newRight, this.mediate,
            newRightCopyReserve, newRightCopy, newRecopy, newToCopy, this.rightCopied);

        if(!newRecopy)
        {
            TimeoutId = setTimeout(PrintVersion, time, queueIndex + 1, "Взято елемент \"" + value + "\"", 0);
        }

        return (newRecopy ? newQueue.Recopy(false, value) : newQueue);
    }

    Get()
    {
        return (this.recopy
            ? this.rightCopy.value
            : this.right.value);
    }

    Recopy(isPush, value)
    {
        let newLeft = this.left;
        let newRight = this.right;
        let newMediate = this.mediate;
        let newRightCopyReserve = this.rightCopyReserve;
        let newRightCopied = this.rightCopied;
        let newToCopy = this.toCopy;

        let actions = 3;
        while (!newRightCopied && newRight.size && actions)
        {
            let time = Timer.time;
            RightToMediate(time, newRight);

            newMediate = newMediate.Push(newRight.value, newRight.color);
            newRight = newRight.Pop();
            ++newToCopy;
            --actions;
        }

        while (newLeft.size && actions)
        {
            let time = Timer.time;
            LeftToRight(time, newLeft);

            newRightCopied = true;
            newRight = newRight.Push(newLeft.value, newLeft.color);
            newRightCopyReserve = newRightCopyReserve.Push(newLeft.value, newLeft.color);
            newLeft = newLeft.Pop();
            --actions;
        }

        while (newToCopy > 0 && actions)
        {
            let time = Timer.time;
            MediateToRight(time, newMediate);

            newRight = newRight.Push(newMediate.value, newMediate.color);
            newRightCopyReserve = newRightCopyReserve.Push(newMediate.value, newMediate.color);
            newMediate = newMediate.Pop();
            --newToCopy;
            --actions;
        }

        while (newMediate.size && actions)
        {
            let time = Timer.time;
            CleanMediate(time);

            newMediate = newMediate.Pop();
            --actions;
        }

        let time = Timer.time;
        TimeoutId = setTimeout(PrintVersion, time, queueIndex + 1, (isPush ? "Додано" : "Взято") + " елемент \"" + value + "\" з перекопіюванням", 0);

        if (actions)
        {
            TimeoutId = setTimeout(SwapStacks, time, true);
            let text = GetRecopyText(4);
            TimeoutId = setTimeout(SetNotify, time, text);

            time = Timer.time;
            TimeoutId = setTimeout(SwapStacks, time, false);

            return new PQueue(newLeft, this.leftReserve, newRight, newMediate,
                this.rightCopy, newRightCopyReserve, false, 0, false);
        }
        
        return new PQueue(this.leftReserve, newLeft, newRight, newMediate,
            newRightCopyReserve, this.rightCopy, true, newToCopy, newRightCopied);
    }
};

queues = new Array();
queues[0] = new PQueue();
queueIndex = 0;
elementIds = 1;

var datetime = Date.now();

function VerifyPushing() {
    if (-999999999 <= Number(pushInput.value) && Number(pushInput.value) <= 9999999999) {
        pushInput.classList.remove("wrongInput");
    }
    else {
        pushInput.classList.add("wrongInput");
    }
}

function Push(value)
{
    if (value != undefined) {
        queueIndex = queues.push(queues[queueIndex].Push(value)) - 1;
    }
    else if (-999999999 <= Number(pushInput.value) && Number(pushInput.value) <= 9999999999) {
        queueIndex = queues.push(queues[queueIndex].Push(Number(pushInput.value))) - 1;
        if (pushIncrementing) {
            pushInput.value++;
        }
        pushInput.focus();
    }
}

function Pop()
{
    popOutput.value = queues[queueIndex].Get();
    queueIndex = queues.push(queues[queueIndex].Pop()) - 1;
}

function VisualQueue(index)
{
    for (let index = 0; index <= TimeoutId; index++) {
        clearTimeout(index);
    }

    if (Timer.datetime - Date.now() > Timer.animation) {
        PrintVersion(queueIndex, "Миттєве закінчення анімації", 0);
    }
    Timer.datetime = Date.now();

    queueIndex = index;
    CleanChilds(LeftReserve);
    CleanChilds(Left);
    CleanChilds(Right);
    CleanChilds(Mediate);
    CleanChilds(RightCopyReserve);
    CleanChilds(RightCopy);

    let queue = queues[index];

    FillStack(queue.leftReserve, LeftReserve);
    FillStack(queue.left, Left);
    FillStack(queue.right, Right);
    FillStack(queue.mediate, Mediate);
    FillStack(queue.rightCopyReserve, RightCopyReserve);
    FillStack(queue.rightCopy, RightCopy);
}

function FillStack(stack, DOMElement)
{
    let elements = new PStack();
    while(stack.size)
    {
        let div = document.createElement('div');
        div.className = "element";
        div.innerText = stack.value;
        div.style.border = "3px solid " + colors[stack.color][0];
        div.style.backgroundColor = colors[stack.color][1];
        div.style.color = colors[stack.color][2];
        stack = stack.previous;
        elements = elements.Push(div);
    }
    while(elements.size)
    {
        DOMElement.appendChild(elements.value);
        elements = elements.previous;
    }
}

function CleanChilds(DOMElement)
{
    while (DOMElement.firstChild) {
        DOMElement.removeChild(DOMElement.firstChild);
    }
}

function AddElement(DOMElement, value, color, animationTime)
{
    let div = document.createElement('div');
    div.className = "element";
    div.animate(
        [   {width: "0px", height: "0px", lineHeight: "0px", fontSize: "0px"},
            {width: "100px", height: "50px", lineHeight: "50px", fontSize: "20px"}],
        {duration: animationTime});
    div.innerText = value;
    div.style.borderColor = colors[color][0];
    div.style.backgroundColor = colors[color][1];
    div.style.color = colors[color][2];
    document.getElementById(DOMElement).appendChild(div);
}

function MarkDeleteElement(DOMElement, animationTime)
{
    let div = document.getElementById(DOMElement).lastChild;
    div.animate(
        [   {width: "100px", height: "50px", lineHeight: "50px", fontSize: "20px"},
            {width: "0px", height: "0px", lineHeight: "0px", fontSize: "0px"}],
        {duration: animationTime});
}

function RemoveElement(time, DOMElement) {
    time = (time < 0 ? 0 : time);
    TimeoutId = setTimeout(MarkDeleteElement, time, DOMElement, Timer.animation);
    TimeoutId = setTimeout(DeleteElement, time - 20 + Timer.animation, DOMElement);
}

function DeleteElement(DOMElement)
{
    document.getElementById(DOMElement).removeChild(document.getElementById(DOMElement).lastChild);
}

function SetTime()
{
    let time = Number(timeInput.value);
    if (time >= 0) {
        Timer.animationTime = time;
    }
}

function PrintVersion(queueID, text, level)
{
    if (level == 0) {
        let button = document.createElement('button');
        button.className = "logVersion";
        button.onclick = function() {
            VisualQueue(queueID)
        };
        button.innerHTML = text;
        log.appendChild(button);
    }
    else{
        let p = document.createElement('p');
        p.className = "logRecord";
        log.appendChild(p);
    }
}

function ReadFile(inputElement)
{
    filename = inputElement.files[0];
    if (filename) {
        let fileReader = new FileReader();
        fileReader.onload = function(e) {
            DoActions(e.target.result);
        }
        fileReader.readAsText(filename);
    }
    else
    {
        alert("Access denied!");
    }
    inputElement.value = "";
}

function DoActions(actionsString) {
    let actions = actionsString.split(/[\r\n]/);
    for (let index = 0; index < actions.length; index++) {
        const element = actions[index];
        let parts = element.split(/[\t ]/, 2);
        if (parts[0] == "push" && parts[1] != undefined && parts[1].length < 10) {
            Push(parts[1]);
        }
        else if (parts[0] == "pop") {
            Pop();
        }
        else if(parts[0] == "time" && Number(parts[1]) >= 0)
        {
            Timer.animationTime = Number(parts[1]);
        }
    }
}

function SetDelayedAnimationTime(animationTime)
{
    Timer.datetime -= Timer.animation;
    TimeoutId = setTimeout(function(){Timer.animationTime = animationTime}, Timer.time);
}

function SetNotify(text) {
    stage.innerHTML = text;
}

function ReservePush(time, element) {
    let text = "Режим перекопіювання.</br>Елемент додано до резервного лівого стеку.";
    TimeoutId = setTimeout(AddElement, time, "LeftReserve", element.value, element.color, Timer.animation);
    TimeoutId = setTimeout(SetNotify, time, text);
}

function NormalPush(time, element, cleaned) {
    TimeoutId = setTimeout(AddElement, time, "Left", element.value, element.color, Timer.animation);
    let text = "Звичайний режим.</br>Елементи додаються до лівого стеку.";
    if (cleaned) {
        RemoveElement(time, "RightCopyReserve");
        text += "</br>Прибираються зайві елементи з резервного правого стеку.";
    }
    TimeoutId = setTimeout(SetNotify, time, text);
}

function RecopyExtendedPop(time) {

    RemoveElement(time, "Right");
    RemoveElement(time, "RightCopyReserve");
    RemoveElement(time, "RightCopy");
    let text = "Режим перекопіювання.</br>Якщо посередній стек не містить елементів черги, то елементи беруться з трьох стеків, що їх містять:</br>1) правого;</br>2) копії правого;</br>3) резервного правого.";
    TimeoutId = setTimeout(SetNotify, time, text);
}

function RecopyPop(time) {
    RemoveElement(time, "RightCopy");
    let text = "Режим перекопіювання.</br>Елементи беруться з копії правого стеку";
    TimeoutId = setTimeout(SetNotify, time, text);
}

function NormalPop(time, cleaned) {
    RemoveElement(time, "Right");
    RemoveElement(time, "RightCopy");
    let text = "Звичайний режим.</br>Елементи беруться з копії правого стеку";
    if (cleaned) {
        RemoveElement(time, "RightCopyReserve");
        text += "</br>Прибираються зайві елементи з резервного правого стеку.";
    }
    TimeoutId = setTimeout(SetNotify, time, text);
}

function RightToMediate(time, element) {
    TimeoutId = setTimeout(AddElement, time, "Mediate", element.value, element.color, Timer.animation);
    RemoveElement(time, "Right");
    let text = GetRecopyText(0);
    TimeoutId = setTimeout(SetNotify, time, text);
}

function LeftToRight(time, element) {
    TimeoutId = setTimeout(AddElement, time, "Right", element.value, element.color, Timer.animation);
    TimeoutId = setTimeout(AddElement, time, "RightCopyReserve", element.value, element.color, Timer.animation);
    RemoveElement(time, "Left");
    let text = GetRecopyText(1);
    TimeoutId = setTimeout(SetNotify, time, text);
}

function MediateToRight(time, element) {
    TimeoutId = setTimeout(AddElement, time, "Right", element.value, element.color, Timer.animation);
    TimeoutId = setTimeout(AddElement, time, "RightCopyReserve", element.value, element.color, Timer.animation);
    RemoveElement(time, "Mediate");
    let text = GetRecopyText(2);
    TimeoutId = setTimeout(SetNotify, time, text);
}

function CleanMediate(time) {
    RemoveElement(time, "Mediate");
    let text = GetRecopyText(3);
    TimeoutId = setTimeout(SetNotify, time, text);
}

function SwapStacks(first)
{
    if (first) {
        let LRParent = LeftReserve.parentElement;
        Left.parentElement.appendChild(LeftReserve, Left.parentElement.firstChild);
        LRParent.appendChild(Left, LRParent.firstChild);
        Left.id = "LeftR";
        LeftReserve.id = "Left";
        LeftR.id = "LeftReserve"
        let text = GetRecopyText(5);
    }
    else {
        let RCParent = RightCopy.parentElement;
        RightCopyReserve.parentElement.appendChild(RightCopy, RightCopyReserve);
        RCParent.appendChild(RightCopyReserve, RCParent.firstChild);
        RightCopy.id = "RightCopyR";
        RightCopyReserve.id = "RightCopy";
        RightCopyR.id = "RightCopyReserve";
        stage.innerHTML = "Звичайний режим";
    }
}

function ChangeAnimating()
{
    if (isAnimatingInput.checked) {
        Timer.animationTime = Number(timeInput.value);
    }
    else {
        Timer.datetime = Date.now();
        Timer.animationTime = 0;
        VisualQueue(queueIndex);
        PrintVersion(queueIndex, "Миттєве закінчення анімації", 0);
    }
}

function ChangePushIncrement()
{
    pushIncrementing = pushIncrement.checked;
}

function GetRecopyText(stageId) {
    return "<p>Режим перекопіювання. Здійснення перекопіювання:</p>"
        + "<p class=\"" + (stageId < 0 ? "stageUndone\">" : (stageId == 0 ? "stageInProgress\">► " : "stageComplete\">✓ ")) + "З правого стеку до посереднього</p>"
        + "<p class=\"" + (stageId < 1 ? "stageUndone\">" : (stageId == 1 ? "stageInProgress\">► " : "stageComplete\">✓ ")) + "З лівого стеку до правого та резервного правого</p>"
        + "<p class=\"" + (stageId < 2 ? "stageUndone\">" : (stageId == 2 ? "stageInProgress\">► " : "stageComplete\">✓ ")) + "З посереднього стеку до правого та резервного правого</p>"
        + "<p class=\"" + (stageId < 3 ? "stageUndone\">" : (stageId == 3 ? "stageInProgress\">► " : "stageComplete\">✓ ")) + "Очищення посереднього стеку від взятих елементів</p>"
        + "<p class=\"" + (stageId < 4 ? "stageUndone\">" : (stageId == 4 ? "stageInProgress\">► " : "stageComplete\">✓ ")) + "Обмін лівого стеку з лівим резервним</p>"
        + "<p class=\"" + (stageId < 5 ? "stageUndone\">" : (stageId == 5 ? "stageInProgress\">► " : "stageComplete\">✓ ")) + "Обмін копії правого стеку з правим резервним</p>";
}
