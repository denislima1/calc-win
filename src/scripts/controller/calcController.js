class CalcController {

    constructor() {
        this._locale = 'pt-BR';
        this._audioOnOff = false;
        // this._audio = new Audio('click.mp3');

        this._lastOperator = '';
        this._lastNumber = '';
        this._operation = [];
        this._displayCalcEl = document.querySelector('#display');
        this._displayHistoricCalcEl = document.querySelector('#displayHistoric');
        this._dateEl = document.querySelector('#data');
        this._timeEl = document.querySelector('#hora');

        this._currentDate;
        this.initialize();
        this.initButtonsEvents();
        this.initKeyboard();
    }

    copyToClipboard() {
        let input = document.createElement('input');

        input.value = this.displayCalc;
        document.body.appendChild(input);

        input.select();
        document.execCommand("Copy");

        input.remove();
    }

    pasteFromClipboard() {
        document.addEventListener('paste', e => {
            let text = e.clipboardData.getData('Text');

            this.displayCalc = parseFloat(text);

            console.log(text);
        });
    }

    initialize() {

        //atualiza o horario
        this.setDisplayTime();
        setInterval(() => {
            this.setDisplayTime();
        }, 1000);

        this.setLastNumberToDisplay();
        this.pasteFromClipboard();

        document.querySelectorAll('.btn-ac').forEach(btn => {
            btn.addEventListener('dblclick', e => {
                this.toggleAudio();
            });
        });
    }

    toggleAudio() {
        this._audioOnOff = !this._audioOnOff;
    }

    playAudio() {
        if (this._audioOnOff) {
            this._audio.currentTime = 0;
            this._audio.play();
        }
    }

    clearAll() {
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNumberToDisplay();
        this.setHistoricToDisplay();
    }

    clearEntry() {
        this._operation.pop();
        this.setLastNumberToDisplay();
    }

    isOperator(value) {
        return (['+', '-', '*', '%', '/'].indexOf(value) > -1);
    }

    pushOperation(value) {
        this._operation.push(value);
        if (this._operation.length > 3) {
            this.calc();
        }
    }

    getResult() {
        try {
            return eval(this._operation.join(''));
            console.log('getResult', this._operation);
        } catch (e) {
            setTimeout(() => {
                this.setError();
            }), 1;
        }
    }

    calc() {

        let last = '';
        this._lastOperator = this.getLastItem();

        if (this._operation.length < 3) {
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this.lastNumber];
        }

        if (this._operation.length > 3) {
            last = this._operation.pop();
            this.lastNumber = this.getResult();

        } else if (this._operation.length == 3) {
            this.lastNumber = this.getLastItem(false);
        }

        console.log('_lastOperator', this._lastOperator);
        console.log('lastNumber', this._lastNumber);

        let result = this.getResult();

        if (last == '%') {
            result /= 100;
            this._operation = [result];

        } else {
            this._operation = [result];

            if (last) this._operation.push(last);
        }

        this.setLastNumberToDisplay();
        this.setHistoricToDisplay();

        console.log(this._operation);
    }

    getLastItem(isOperator = true) {
        let lastItem;
        for (let i = this._operation.length - 1; i >= 0; i--) {

            if (this.isOperator(this._operation[i]) == isOperator) {
                lastItem = this._operation[i];
                break;
            }
        }

        if (!lastItem) {
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        }
        return lastItem;
    }

    setLastNumberToDisplay() {
        let lastNumber = this.getLastItem(false);

        if (!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;
    }

    setHistoricToDisplay() {
        let historicCalc = this._operation.join(' ');

        this.displayHistoric = historicCalc;
    }

    elevado1() {
        let result = this.getResult();
        result = 1 / this._operation;
        console.log(result);
        this.displayCalc = result.toFixed(8);
    }

    elevado2() {
        let result = this.getResult();
        result = this._operation * this._operation;
        console.log(result);
        this.displayCalc = result;
    }

    raiz() {
        let result = this.getResult();
        result = Math.sqrt(this._operation);
        console.log(result);
        this.displayCalc = result.toFixed(8);
    }

    verificaSomaOuSub() {
        let click = false;
        this.click = !this.click;
    }

    somaOUsubtracao() {
        if (this.click) {
            this.displayCalc = "-" + this._operation;
        } else {
            this.displayCalc = "+" + this._operation;
        }
    }

    addOperation(value) {
        //console.log('A', isNaN(this.getLastOperation()));

        if (isNaN(this.getLastOperation())) {
            if (this.isOperator(value)) {
                this.setLastOperation(value);
            } else {
                this.pushOperation(value);
                this.setLastNumberToDisplay();
                this.setHistoricToDisplay();
            }
        } else {
            if (this.isOperator(value)) {
                this.pushOperation(value);
            } else {
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);

                //atualizar display
                this.setLastNumberToDisplay();
                this.setHistoricToDisplay();
            }
        }
    }

    getLastOperation() {
        return this._operation[this._operation.length - 1];
    }

    setLastOperation(value) {
        this._operation[this._operation.length - 1] = value;
    }

    setError() {
        this.displayCalc = "Error";
    }

    addDot() {
        let lastOperation = this.getLastOperation();
        console.log('lastOperation', lastOperation);

        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if (this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperation('0.');
        } else {
            this.setLastOperation(lastOperation.toString() + '.');
        }
        this.setLastNumberToDisplay();
    }

    initKeyboard() {
        document.addEventListener('keyup', e => {
            console.log(e.key);
            this.playAudio();

            switch (e.key) {

                case 'Escape':
                    this.clearAll();
                    break;

                case ' ':
                case 'Backspace':
                    this.clearEntry();
                    break;

                case '+':
                case '-':
                case '*':
                case '/':
                case '%':
                    this.addOperation(e.key);
                    break;

                case 'Enter':
                case '=':
                    this.calc();
                    break;

                case '.':
                case ',':
                    this.addDot();
                    break;

                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;

                case 'c':
                    if (e.ctrlKey) this.copyToClipboard();
                    break;
                default:
                    break;
            }
        });
    }

    execBtn(value) {
        this.playAudio();
        switch (value) {

            case 'ac':
                this.clearAll();
                break;

            case 'ce':
            case 'exclui':
                this.clearEntry();
                break;

            case 'soma':
                this.addOperation('+');
                break;

            case 'subtracao':
                this.addOperation('-');
                break;

            case 'divisao':
                this.addOperation('/');
                break;

            case 'multiplicacao':
                this.addOperation('*');
                break;

            case 'porcento':
                this.addOperation('%');
                break;
            case 'elevado1':
                this.elevado1();
                break;
            case 'elevado2':
                this.elevado2();
                break;
            case 'raiz':
                this.raiz();
                break;
            case 'somaOUsubtracao':
                this.somaOUsubtracao();
                break;

            case 'igual':
                this.calc();
                break;

            case 'ponto':
                this.addDot();
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;

            default:
                this.setError();
                break;

        }

    }

    //verifica o botão clicado
    initButtonsEvents() {
        let buttons = document.querySelectorAll('div > button');
        // console.log('Buttons', buttons);

        buttons.forEach((btn, index) => {
            this.addEventListenerAll(btn, "click drag", e => {
                // console.log(btn);
                let textBtn = btn.className.replace("btn btn-", "").replace(" col-sm", "");
                console.log(textBtn);
                this.execBtn(textBtn);
            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
                btn.style.cursor = "pointer";
            });
        });
    }

    //verificar qual o evento do botão que foi clicado
    addEventListenerAll(element, events, fn) {
        events.split(' ').forEach(event => {
            element.addEventListener(event, fn, false);
        });
    }

    //verifica a data e horario local
    setDisplayTime() {
        this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

    get displayCalc() {
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value) {
        if (value.toString().length > 14) {
            this.setError();
            return false;
        }
        this._displayCalcEl.innerHTML = value;
    }

    get displayHistoric() {
        return this._displayHistoricCalcEl.innerHTML;
    }

    set displayHistoric(value) {
        this._displayHistoricCalcEl.innerHTML = value;
    }

    get displayTime() {
        return this._timeEl.innerHTML;
    }

    set displayTime(value) {
        this._timeEl.innerHTML = value;
    }

    get displayDate() {
        return this._dateEl.innerHTML;
    }

    set displayDate(value) {
        this._dateEl.innerHTML = value;
    }

    get currentDate() {
        return new Date();
    }

    set currentDate(value) {
        this._currentDate = value;
    }

}