const btn = document.querySelector('.change-btn');
const form = document.querySelector('.info-container--form');
const url = "neworder.php";
const label = document.querySelectorAll('.step-label');
const labelError = document.querySelectorAll('.error-message');
const svg = document.querySelector('.form-row svg');
const inputs = document.querySelectorAll('.form-row input');
const stepForm1 = document.querySelector('.step-form.step1');
const stepForm2 = document.querySelector('.step-form.step2');
const percent = document.querySelector('.data-percent');

//Класс отправки любой формы формы 
class sendForm {
    constructor(form, url, successPopup, method, headers, inputs) {
        this.form = form;
        this.url = url;
        this.successPopup = successPopup;
        this.headers = headers;
        this.method = method;
        this.inputs = inputs;
    }
    createFormData() {
        const data = new FormData();
        this.inputs.forEach((e) => {
            if (e.hasAttribute('name')) {
                data.append(e.getAttribute('name'), e.value);
            }
        })
        for (var pair of data.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }
        return data;
    }
    sendAjaxForm() {
        const request = new XMLHttpRequest();
        const data = this.createFormData();
        request.open(this.method, this.url, true);
        request.setRequestHeader(this.headers[0], this.headers[1]);

        request.addEventListener("readystatechange", () => {
            if (request.readyState === 4 && request.status === 200) {
                console.log(request.responseText)
            } else {

            }
        });
        request.send(data);
    }

}
//Класс изменяющий условия займа в панели над формой
class changeConditions {
    constructor(btn, form, url) {
        this.btn = btn;
        this.form = form;
        this.inputs = this.form.querySelectorAll('.info-input');
        this.btnText = this.btn.querySelector('span');
        this.inputsChangeble = [];
        this.url = url;
        this.sender = new sendForm(this.form, this.url, '', "GET", ["Content-type", "application/x-www-form-urlencoded"], this.inputs);
    }
    init() {
        const input = this.form.querySelector('.input-count');

        this.inputs.forEach((e) => {
            if (e.classList.contains('input-date') || e.classList.contains('input-count')) {
                this.inputsChangeble.push(e)
            }
        })

        this.formatInitListeners(input);
        this.formatValue(input);
        this.countResults();

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.formatValue(input);
            if (this.btnText.textContent.trim() === 'Изменить') {
                this.allowChanges(input);
            } else {
                this.prohibitChanges();
            }
        })
    }
    allowChanges(input) {
        this.btnText.textContent = 'Готово';
        this.inputsChangeble.forEach((e) => {
            e.removeAttribute("readonly");
            e.removeAttribute("disabled");
        })
        input.focus();
        input.select();
    }
    prohibitChanges() {
        this.btnText.textContent = 'Изменить';
        this.inputsChangeble.forEach((e) => {
            e.setAttribute('readonly', true);
            e.setAttribute("disabled", true);
            this.countResults();
        })
        this.sender.sendAjaxForm();
    }
    formatValue(input) {
        let arr = input.value.split("").reverse();
        if (arr.includes(' ')) {
            return;
        }
        arr.splice(3, 0, ' ');
        input.value = arr.reverse().join("");
    }
    formatInitListeners(e) {
        e.addEventListener('blur', () => {
            this.checkValue(e);
        })
    }
    checkValue(input) {
        if (this.formatToNumber(input) > 15000) {
            input.value = 15000;
            this.formatValue(input)
            return
        }
        if (this.formatToNumber(input) < 1000) {
            input.value = 1000;
            this.formatValue(input)
        }
    }
    formatToNumber(input) {
        let arr = input.value.split("");
        if (arr.includes(' ')) {
            arr.splice(arr.indexOf(' '), 1);
        }
        const number = +arr.join("");

        return number;
    }
    countResults() {
        const percentDiscount = this.form.getAttribute('discount-loan-percent');
        const percent = this.form.getAttribute('loan-percent');
        const returnDate = this.form.querySelector('.input-date').value;
        const sum = this.form.querySelector('.input-count');
        const noDiscountSum = document.querySelector('.count-sum');
        const discountSum = document.querySelector('.discount-sum .count-sum');

        const date = new Date();

        let arr = returnDate.split("");
        let index = arr.indexOf(' ');
        let number = arr.splice(0, index)


        arr.splice(0, 1)
        const monthes = {
            "января": 0,
            "февраля": 1,
            "марта": 2,
            "апреля": 3,
            "мая": 4,
            "июня": 5,
            "июля": 6,
            "августа": 7,
            "сентября": 8,
            "октября": 9,
            "ноября": 10,
            "декабря": 11,
        }
        number = number.join("");
        let month = arr.join("");

        number = +number;
        month = monthes[month];
        let year = date.getFullYear();

        if (date.getMonth() > +month) {
            year = date.getFullYear() + 1;
        }

        const returnDateInSeconds = new Date(year, month, number).getTime();
        const currentDate = date.getTime();
        const difference = returnDateInSeconds - currentDate;


        const daysCount = Math.ceil(difference / (1000 * 3600 * 24));
        const percentPerDay = (this.formatToNumber(sum) / 100) * daysCount;


        noDiscountSum.value = this.formatToNumber(sum) + (percentPerDay * +percent);
        discountSum.value = this.formatToNumber(sum) + (percentPerDay * +percentDiscount);
    }
}

//Запускаем в случае если есть форма и кнопка
if (form && btn) {
    const conditions = new changeConditions(btn, form, url);
    conditions.init();
}

// В Верстке диаграммы , скрытый инпут который задает изначальное количество процентов на диаграмме
// Также на каждом инпуте есть атрибут succes-percent - отвечает за то сколько процентов дает инпут к успеху
// Также на каждом инпуте есть атрибут countes - отвечает за то был ли уже учтен инпут при подсчете изначально false

//Класс отвечающий за подсче процентов одобрения займа на диаграмме под формой 
class countSuccess {
    constructor(form) {
        this.form = form;
        this.inputs = this.form.querySelectorAll('input[type=text]');
        this.percent = this.form.querySelector('input[type=hidden]').value;
    }
    init() {
        this.eventHandler();

        this.progressView(this.percent);
        this.inputs.forEach((e) => {
            e.addEventListener('blur', () => {
                this.eventHandler();
            })
            e.addEventListener('input', () => {
                this.eventHandler();
            })
            e.addEventListener('focus', () => {
                this.eventHandler();
            })
            e.addEventListener('change', () => {
                this.eventHandler();
            })
            e.addEventListener('cut', () => {
                this.eventHandler();
            })
            e.addEventListener('copy', () => {
                this.eventHandler();
            })
            e.addEventListener('paste', () => {
                this.eventHandler();
            })
        })
    }
    eventHandler() {
        let validBlocks = this.getValid();
        let invalidBlocks = this.getInValid();
        this.checkIputsValue(validBlocks, invalidBlocks);
    }
    getValid() {
        const validBlocks = document.querySelectorAll('.valid');

        return validBlocks;
    }
    getInValid() {
        const invalidBlocks = document.querySelectorAll('.invalid');

        return invalidBlocks;
    }
    checkIputsValue(validBlocks, invalidBlocks) {
        const inputs = []
        const invalidInputs = []
        validBlocks.forEach((e) => {
            const input = e.querySelector('input');
            inputs.push(input);

            return inputs;
        });
        invalidBlocks.forEach((e) => {
            const input = e.querySelector('input');
            invalidInputs.push(input);

            return invalidInputs;
        });
        if (inputs.length > 0) {
            inputs.forEach((e) => {
                if (e.getAttribute('counted') === 'false') {
                    const percent = +e.getAttribute('success-percent')
                    this.percent = +this.percent + percent;
                    e.setAttribute('counted', true);
                    this.progressView(this.percent);
                }
            })
        }
        if (invalidInputs.length > 0) {
            invalidInputs.forEach((e) => {
                if (e.getAttribute('counted') === 'true') {
                    const percent = +e.getAttribute('success-percent')
                    this.percent = +this.percent - percent;
                    e.setAttribute('counted', false);
                    this.progressView(this.percent);
                }
            })
        }
    }
    progressView(percent) {
        let diagramBox = document.querySelectorAll('.diagram.progress');
        diagramBox.forEach((box) => {
            let deg = (360 * percent / 100) + 180;
            if (percent >= 50) {
                box.classList.add('over_50');
            } else {
                box.classList.remove('over_50');
            }
            box.querySelector('.piece.right').style.transform = 'rotate(' + deg + 'deg)';
            box.querySelector('.diagram-text b').textContent = percent + '%';
        });
    }
}

//Запускаем в случае если есть скрытый инпут с изначальным количество процентов в атрибуте value
if (percent) {
    const formCounter = new countSuccess(stepForm1);
    formCounter.init();
}


//Класс валидации всего чего хочешь (накинь метод для нужного инпута)

class validateForm {
    //Запуск Валидации при потере фокуса;
    checkOnBlur(elem, value, validationType) {
        elem.addEventListener('blur', (e) => {
            this.validationType(elem, e.target.value, validationType)
        })
    }
    //Запуск Валидации по событию инпут;
    checkOnInput(elem, value, validationType) {
        elem.addEventListener('input', (e) => {
            this.validationType(elem, e.target.value, validationType)
        })
    }
    //Определение функции валидатора;
    validationType(elem, value, validationType) {
        switch (validationType) {
            case 'phone':
                this.checkMobile(value, elem);
                break;
            case 'checkbox':
                this.checkBoxCheck(value, elem);
                break;
            case 'date':
                this.checkBirthday(value, elem);
                break;
            case 'name':
                this.checkName(value, elem);
                break;
            case 'email':
                this.checkEmail(value, elem);
                break;
        }
    }
    //Валидация номера телефона;
    checkMobile(value, input) {
        const regEx = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/
        if (value.match(regEx)) {
            input.parentNode.classList.add('valid');
            input.parentNode.classList.remove('invalid');
            return true;
        } else {
            input.parentNode.classList.add('invalid');
            input.parentNode.classList.remove('valid');
            return false
        }
    }
    //Валидация имени;
    checkName(value, input) {
        const regEx = /^[А-ЯА-я -]+$/;
        if (value.match(regEx)) {
            input.parentNode.classList.add('valid');
            input.parentNode.classList.remove('invalid');
            return true;
        } else {
            input.parentNode.classList.add('invalid');
            input.parentNode.classList.remove('valid');
            return false
        }
    }
    //Валидация дня рождения;
    checkBirthday(value, input) {
        let personYear = +value.split("").reverse("").splice(0, 4).reverse().join("");
        let personMonth = value.split("").reverse("").splice(5, 2).reverse().join("");
        let personDay = value.split("").reverse("").splice(8, 2).reverse().join("");
        const date = new Date();
        const currentYear = +date.getFullYear();
        const userAge = currentYear - personYear;

        if (value.length < 10) {
            input.parentNode.classList.add('invalid');
            input.parentNode.classList.remove('valid');
            return false
        }
        if (personMonth > 12) {
            personMonth = 12;
        }
        if (personDay > 31) {
            personDay = 31;
        }
        if (personYear > currentYear) {
            personYear = currentYear;
        }
        input.value = personDay + '.' + personMonth + '.' + personYear;
        if (userAge < 18 || userAge > 70) {
            input.parentNode.classList.add('invalid');
            input.parentNode.classList.remove('valid');
            return false
        } else {
            input.parentNode.classList.add('valid');
            input.parentNode.classList.remove('invalid');
            return true
        }
    }
    //Валидация чекбокса;
    checkBoxCheck(value, elem) {
        const notification = elem.parentNode.querySelector('.checkbox-notification');
        if (!value) {
            notification.classList.add('visible');
            return false
        } else {
            notification.classList.remove('visible');
            return true
        }
    }
    //Валидация email;
    checkEmail(value, elem) {
        const regEx = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
        if (value.match(regEx)) {
            elem.parentNode.classList.add('valid');
            elem.parentNode.classList.remove('invalid');
            return true;
        } else {
            elem.parentNode.classList.add('invalid');
            elem.parentNode.classList.remove('valid');
            return false
        }
    }
}

//Класс валидации и отправки первого шага;
class FirstStepValidate {
    constructor(form, url, popup) {
        this.form = form;
        this.popup = popup;
        this.inputs = this.form.querySelectorAll('.form--input');
        this.phone = this.form.querySelector('#phone');
        this.dateOfBirth = this.form.querySelector('#birthday-input');
        this.name = this.form.querySelector('#name');
        this.checkBox = this.form.querySelector('#checkbox-required');
        this.url = url;
        this.validator = new validateForm();
        this.sender = new sendForm(this.form, this.url, '', "GET", ["Content-type", "application/x-www-form-urlencoded"], this.inputs);
    }
    init() {
        this.validator.checkOnBlur(this.phone, this.phone.value, 'phone');
        this.validator.checkOnBlur(this.dateOfBirth, this.dateOfBirth.value, 'date');
        this.validator.checkOnBlur(this.name, this.name.value, 'name');
        this.validator.checkOnBlur(this.checkBox, this.checkBox.checked, 'checkbox');
        this.validator.checkOnInput(this.phone, this.phone.value, 'phone');
        this.validator.checkOnInput(this.dateOfBirth, this.dateOfBirth.value, 'date');
        this.validator.checkOnInput(this.name, this.name.value, 'name');
        this.validator.checkOnInput(this.checkBox, this.checkBox.checked, 'checkbox');

        this.form.addEventListener('submit', (e) => {
            if (this.validate()) {
                e.preventDefault();
                this.sender.sendAjaxForm();
            } else {
                e.preventDefault();
            }
        })
    }
    validate() {
        const validArray = [];
        if (this.validator.checkBirthday(this.dateOfBirth.value, this.dateOfBirth)) {
            validArray.push(true)
        }
        if (this.validator.checkMobile(this.phone.value, this.phone)) {
            validArray.push(true)
        }
        if (this.validator.checkName(this.name.value, this.name)) {
            validArray.push(true)
        }
        if (this.validator.checkBoxCheck(this.checkBox.checked, this.checkBox)) {
            validArray.push(true)
        }
        if (validArray.length < this.inputs.length) {
            return false
        } else {
            return true
        }
    }
}

//Класс валидации и отправки второго шага;
class secondStepValidate {
    constructor(form, url, popup) {
        this.form = form;
        this.popup = popup;
        this.email = this.form.querySelector('#email');
        this.inputs = this.form.querySelectorAll('.form--input');
        this.checkBox = this.form.querySelector('#checkbox-required');
        this.url = url;
        this.validator = new validateForm();
        this.sender = new sendForm(this.form, this.url, '', "GET", ["Content-type", "application/x-www-form-urlencoded"], this.inputs);
    }
    init() {
        this.validator.checkOnBlur(this.email, this.email.value, 'email');
        this.validator.checkOnInput(this.email, this.email.value, 'email');
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validate()) {
                this.sender.sendAjaxForm();
            } else {
        
            }
        })
    }
    validate() {
        const validArray = [];
        if (this.validator.checkEmail( this.email.value, this.email)) {
            validArray.push(true)
        }
        if (this.validator.checkBoxCheck(this.checkBox.checked, this.checkBox)) {
            validArray.push(true)
        }
        if (validArray.length < this.inputs.length) {
            return false
        } else {
            return true
        }
    }
}


//Запускаем в случае наличии на страницы необходимой формы
if (stepForm1) {
    const firstStep = new FirstStepValidate(stepForm1, 'newclient.php');
    firstStep.init();
}
//Запускаем второй шаг формы 
if(stepForm2) {
    const secondStep = new secondStepValidate(stepForm2, 'newclient.php', '');
    secondStep.init();
}
//Вызывает фокус на ипутах в случае нажатия на label или иконку если такая имеется
if (label.length > 0) {
    if (svg) {
        svg.addEventListener('click', () => {
            const input = svg.parentNode.querySelector('input');
            input.focus();
        })
    }
    label.forEach((e) => {
        e.addEventListener('click', () => {
            const input = e.parentNode.querySelector('input');
            input.focus();
        })
    })
    labelError.forEach((e) => {
        e.addEventListener('click', () => {
            const input = e.parentNode.querySelector('input');
            input.focus();
        })
    })
}


//Калькулятор
class Calculator {
    constructor (amountElement, amountvalueElement, amountOptions, termElement, termvalueElement, termOptions, result, percentResult, percentOfLoan ,controllRight,controllLeft, dateOutput) {
      this.amountElement = amountElement
      this.amountvalueElement = amountvalueElement
      this.amountOptions = amountOptions
      this.termElement = termElement
      this.termvalueElement = termvalueElement
      this.termOptions = termOptions
      this.result = result
      this.percentResult = percentResult;
      this.percent = 0;
      this.controllLeft = controllLeft;
      this.controllRight = controllRight;
      this.dateOutput = dateOutput;
    }
    init() {  
      this.termElement.setAttribute('min', this.termOptions.min);
      this.termElement.setAttribute('max', this.termOptions.max);
      this.amountElement.setAttribute('min', this.amountOptions.min);
      this.amountElement.setAttribute('max', this.amountOptions.max);
      this.amountvalueElement.value = this.amountOptions.cur;
      this.termvalueElement.value = this.termOptions.cur;
      this.amountElement.value = this.amountOptions.min;
      this.termElement.value = this.termOptions.min  ;
      this.getReturnDate(this.termElement.value);
      
      this.updateSlider(this.amountElement, this.amountOptions); 
      this.updateSlider(this.termElement, this.termOptions); 
      this.sendOrder();
      this.handleUpdateValue(this.amountElement, this.amountvalueElement);
      this.handleUpdateDaysValue(this.termElement, this.termvalueElement);
      this.updateValue(this.amountElement, this.amountvalueElement, this.amountOptions); 

      const inputSymbol = document.querySelectorAll('.count-wrapper span');

      inputSymbol.forEach(element => {
          element.addEventListener('click', (e) => {
              const input = e.target.parentNode.querySelector('input')
              input.focus()
              input.value = '';
          })

      });


      this.amountElement.addEventListener('input', () => {
            this.updateValue(this.amountElement, this.amountvalueElement, this.amountOptions); 
      });
      this.termElement.addEventListener('input', () => {
            this.updateValue(this.termElement, this.termvalueElement, this.termOptions); 
      });
      this.controllLeft.forEach((e) => {
          e.addEventListener('click', (evt) => {
            evt.preventDefault();
            let target = evt.target;
            let targetInput = target.closest('.input-wrapper').querySelector('input')

            if(this.termElement === targetInput) {
                if(this.termElement.value === this.termOptions.min) {
                    return;
                }else{
                    this.termElement.value = this.termElement.value - 1;
                    this.updateValue(this.termElement, this.termvalueElement, this.termOptions); 
                    this.updateSlider(this.termElement, this.termOptions); 
                    this.getReturnDate(this.termElement.value);
                }
            }
            if(this.amountElement === targetInput) {
                if(this.amountElement.value === this.amountOptions.min) {
                    return;
                }else{
                    this.amountElement.value = +this.amountElement.value - 100;
                    this.updateValue(this.amountElement, this.amountvalueElement, this.amountOptions); 
                    this.updateSlider(this.amountElement, this.amountOptions); 
                }
            }
          })
      });

      this.controllRight.forEach((e) => {
        e.addEventListener('click', (evt) => {
          evt.preventDefault();
          let target = evt.target;
          let targetInput = target.closest('.input-wrapper').querySelector('input')

          if(this.termElement === targetInput) {
              if(this.termElement.value === this.termOptions.max) {
                  return;
              }else{
                  this.termElement.value = +this.termElement.value + 1;
                  this.updateValue(this.termElement, this.termvalueElement, this.termOptions); 
                  this.updateSlider(this.termElement, this.termOptions); 
                  this.getReturnDate(this.termElement.value);
              }
          }
          if(this.amountElement === targetInput) {
            if(this.amountElement.value === this.amountOptions.max) {
                return;
            }else{
                this.amountElement.value = +this.amountElement.value + 100;
                this.updateValue(this.amountElement, this.amountvalueElement, this.amountOptions); 
                this.updateSlider(this.amountElement, this.amountOptions); 
            }
        }
        })
       });
    }
    updateValue(element, valElem, options) {    

      let sumpart = String(element.value).split('').reverse() ;
      sumpart.splice(3,0 , ' ');
      sumpart.reverse();
      let sum = sumpart.join('');
    
      valElem.value = sum;

      this.updateSlider(element, options);
      this.countResult(this.amountElement.value, this.termElement.value, this.percent);
      this.getReturnDate(this.termElement.value);
    }
    handleUpdateDaysValue (element, valElem) {
      const regex = /[^0-9]/;
      valElem.addEventListener('input', (e)=> {
          e.target.value = e.target.value.replace(regex, '')
         
        
          const rangeValue = valElem.value.split('');
          const number = rangeValue.join('');
          element.value = number;

 

          if(number < this.termOptions.min) {
            valElem.parentNode.classList.add('invalid')
            element.value = this.termOptions.min;
          }else {
            valElem.parentNode.classList.remove('invalid')
          }
          if(number > this.termOptions.max) {
            valElem.parentNode.classList.add('invalid')
            element.value = this.termOptions.max;
          }
        
          this.updateSlider(this.termElement, this.termOptions); 
          this.getReturnDate(this.termElement.value);
      })
      valElem.addEventListener('blur', () => {
        if(valElem.value > this.termOptions.max) {
          console.log(1)
          valElem.value = this.termOptions.max;
          valElem.parentNode.classList.remove('invalid')
        }
        if(valElem.value < this.termOptions.min) {
          valElem.value = this.termOptions.min;
          valElem.parentNode.classList.remove('invalid')
        }
      })
    }
    handleUpdateValue (element, valElem) {
      const regex = /[^0-9]/;
      valElem.addEventListener('input', (e)=> {
          e.target.value = e.target.value.replace(regex, '')
          let arr = [];
          const rangeValue = valElem.value.split('');
          rangeValue.forEach((e) => {
            if(e !== ' ' && e !== '₽') {
              arr.push(e)
            }
          })
          const string = arr.join('');
          const number = +string;
          element.value = number;
        
          this.updateSlider(this.amountElement, this.amountOptions); 
          if(number < this.amountOptions.min) {
            valElem.parentNode.classList.add('invalid')
            element.value = this.amountOptions.min;
          }else {
            valElem.parentNode.classList.remove('invalid')
          }
          if(number > this.amountOptions.max) {
            valElem.parentNode.classList.add('invalid')
            element.value = this.amountOptions.max;
          }
      })
      valElem.addEventListener('blur', ()=> {
        this.updateValue(element, valElem, this.amountOptions)
        valElem.parentNode.classList.remove('invalid')
      })
    }
    updateSlider(element, options) {
       let percentage =  (element.value - options.min) / (options.max - options.min) * 100;
  
     element.style = 'background: linear-gradient(to right, #E5613E, #E5613E ' + percentage + '%, #000 ' + percentage + '%, #000 100%)';
    }
    countResult(sum, days, percent) {
        sum = +sum;
        days = +days;
        percent = +percent;
        if(percent === 0) {
            percent = 1;
        }
        
        let percentPerDay = sum/100 * percent;
        let overPay = percentPerDay * days;
        let result = sum + overPay;
      
        this.result.forEach(element => {
            let sumpart = String(sum).split('').reverse() ;
            sumpart.splice(3,0 , ' ');
            sumpart.reverse();
            sum = sumpart.join('');
            
            element.textContent =  sum;
        });

        
        this.percentResult.innerHTML = Math.ceil(result);
    }
    sendOrder () {
      const form = document.querySelector('.range');
      const btn = document.querySelector('.btn-submit');

      btn.addEventListener('click', () => {
        form.submit();
      })
    }
    getReturnDate (days) {
      var options = {
        month: 'long',
        day: 'numeric',
      };
      const date = new Date();
      const currenDate = date.getDate();
      const month = date.getMonth();
      days = +days;
      const daysCount = days + currenDate;
      const returnDate = new Date (0, month, daysCount, 0, 0 ,0);
  
      this.dateOutput.value = returnDate.toLocaleString('ru', options);
    }
}
const calculatorElem = document.querySelector('.range'); 
const amountElement = document.querySelector('.range .loan-amount')
const amountvalueElement = document.querySelector('.range .loan-amount-value .count') 
const termElement = document.querySelector('.range .loan-term')
const termvalueElement = document.querySelector('.range .loan-term-value  .count') 
const result = document.querySelectorAll('.count-sum')
const percentResult = document.querySelector('.count-sum_percent');
const percentOfLoan = document.querySelector('.percent-count');
const controllRight = document.querySelectorAll('.controll-right');
const controllLeft = document.querySelectorAll('.controll-left');
const dateOutput = document.querySelector('.result-date .date');

const amountOptions = {
    min: 1000,
    max: 15000,
    cur: 1000,
}

const termOptions = {
    min: 7,
    max:  16,
    cur:  7
}
if(calculatorElem) {
    const calculator = new Calculator (amountElement, amountvalueElement, amountOptions, termElement, termvalueElement, termOptions, result, percentResult ,percent, controllRight, controllLeft, dateOutput);
    calculator.init()      
}

const smoothScroll = () => {
    const links = document.querySelectorAll('a');
    if(links) {
        links.forEach((e) => {
            const id = e.getAttribute('href')
            if(id[0] === '#' && id[1]) {
                const target = document.querySelector(id);
                e.addEventListener('click', (evt) => {
                    evt.preventDefault();
                    e.scrollIntoView({behavior: 'smooth', block: 'start'})
                })
            }
        })
    }
} 
smoothScroll();

const openMenu = () => {
    const openBtn = document.querySelector('.burger-btn');
    const closeBtn = document.querySelector('.close-btn');
    const menu = document.querySelector('.mobile-menu');
  
    openBtn.addEventListener('click', (e) => {
            menu.classList.add('open');
    })
    closeBtn.addEventListener('click', (e) => {
        menu.classList.remove('open');
    })
}

openMenu();

const openSelect = () => {
    const select = document.querySelector('.select-input');
    const selectInput = document.querySelector('.select-input input');
    const arrow = document.querySelector('.arrow');
    const options = document.querySelector('.options-list');
    if(select) {
        select.addEventListener('click', (e) => {
            if(e.target.closest('.select-input')) {
                options.classList.toggle('open');
                arrow.classList.toggle('rotate-180')
            }
        })
        options.addEventListener('click', (e) => {
            if(e.target.classList.contains('options-list--item')) {
                selectInput.value = e.target.textContent.trim();
            }
        })
    }
}

openSelect();

