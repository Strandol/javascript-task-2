'use strict';

/**
 * Сделано задание на звездочку
 * Реализован метод importFromCsv
 */
var REGEXP_NAME = /^([a-zа-яё0-9]+\s?)+[^\s]$/i;
var REGEXP_PHONE = /^\d{10}$/;
var REGEXP_EMAIL =
    /^[a-zа-яё0-9](\.?[a-zа-яё0-9-_]+)+@([a-zа-яё0-9][-_a-zа-яё0-9]+\.)+[a-zа-яё]{2,4}$/i;
var REGEXP_PHONE_STANDART = /(\d{3})(\d{3})(\d{2})(\d{2})/;
var REGEXP_PHONE_BEAUTY = /\+?(\d)\s?\(?(\d{3})\)?\s?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})/;
var warnAlert = 'Телефонная книга пустая!';

var Person = function (phone, name, email) {
    this._phone = phone;
    this._name = name;
    this._email = email;
};

Person.prototype.getPhone = function () {
    return this._phone;
};

Person.prototype.setPhone = function (phone) {
    this._phone = phone;
};

Person.prototype.getName = function () {
    return this._name;
};

Person.prototype.setName = function (name) {
    this._name = name;
};

Person.prototype.getEmail = function () {
    return this._email || '';
};

Person.prototype.setEmail = function (email) {
    this._email = email;
};

/**
 * Телефонная книга
 */
var PhoneBook = function () {
    this._persons = [];
    this._nameColLength = null;
    this._phoneColLength = null;
    this._emailColLength = null;
};

PhoneBook.prototype.addPerson = function (person) {
    var phone = person.getPhone();
    var name = person.getName();
    var email = person.getEmail();

    if (isValidInfo(phone, name, email) && !this.getPersonByPhone(phone)) {
        this._persons.push(person);

        return true;
    }

    return false;
};

PhoneBook.prototype.updatePerson = function (phone, name, email) {
    if (!isValidInfo(phone, name, email)) {
        return false;
    }

    var person = this.getPersonByPhone(phone);
    if (!person) {
        return false;
    }

    person.setName(name);
    person.setEmail(email || '');

    return true;
};

PhoneBook.prototype.getPersonByIndex = function (i) {
    return this._persons[i];
};

PhoneBook.prototype.getIndexOfPerson = function (person) {
    return this._persons.indexOf(person);
};

PhoneBook.prototype.removePersonByIndex = function (i) {
    this._persons.splice(i, 1);
};

PhoneBook.prototype.getPersonByPhone = function (phone) {
    return this.getPersons().find(function (person) {
        return person.getPhone().includes(phone);
    });
};

PhoneBook.prototype.getPersons = function () {
    return this._persons;
};

PhoneBook.prototype.getNameArr = function () {
    return this._persons.map(function (person) {
        return person._name.length;
    });
};

PhoneBook.prototype.getBeautyPhoneArr = function () {
    return this._persons.map(function (person) {
        return beatifyPhoneNum(person._phone).length;
    });
};

PhoneBook.prototype.getEmailArr = function () {
    return this._persons.map(function (person) {
        return person._email
               ? person._email.length
               : 0;
    });
};

PhoneBook.prototype.getNameColLength = function () {
    return this._nameColLength;
};

PhoneBook.prototype.setNameColLength = function (length) {
    this._nameColLength = length;
};

PhoneBook.prototype.getPhoneColLength = function () {
    return this._phoneColLength;
};

PhoneBook.prototype.setPhoneColLength = function (length) {
    this._phoneColLength = length;
};

PhoneBook.prototype.getEmailColLength = function () {
    return this._emailColLength;
};

PhoneBook.prototype.setEmailColLength = function (length) {
    this._emailColLength = length;
};

var phoneBook = new PhoneBook();

/**
 * Добавление записи в телефонную книгу
 * @param {String} phone
 * @param {String} name
 * @param {String} email
 * @returns {boolean}
 */
function add(phone, name, email) {
    var person = new Person(phone, name, email);

    return phoneBook.addPerson(person);
}

/**
 * Обновление записи в телефонной книге
 * @param {String} phone
 * @param {String} name
 * @param {String} email
 * @returns {boolean}
 */
function update(phone, name, email) {
    return phoneBook.updatePerson(phone, name, email);
}

/**
 * Поиск записей по запросу в телефонной книге
 * @param {String} query
 * @returns {array}
 */
function find(query) {
    if (!query) {
        return '';
    }

    var resultInfo = [];
    if (query === '*') {
        resultInfo = phoneBook.getPersons().slice(0);
    } else {
        resultInfo = phoneBook.getPersons().filter(function (person) {
            return isPersonSuitesQuery(person, query);
        });
    }

    return stringifyPersonsInfo(resultInfo.sort(sortPersonsByName));
}

/**
 * Удаление записей по запросу из телефонной книги
 * @param {String} query
 * @returns {number}
 */
function findAndRemove(query) {
    var resultInfo = find(query);
    var phone = '';
    var foundedInfo;

    resultInfo.forEach(function (person) {
        phone = convertPhoneToStartFormat(getPhoneFromInfoStr(person));
        foundedInfo = phoneBook.getPersonByPhone(phone);
        phoneBook.removePersonByIndex(phoneBook.getIndexOfPerson(foundedInfo));
    });

    return resultInfo.length;
}

/**
 * Импорт записей из csv-формата
 * @star
 * @param {String} csv
 * @returns {Number} – количество добавленных и обновленных записей
 */
function importFromCsv(csv) {
    var parsedStr;
    var isUpdated;
    var isAdded;

    return csv.split('\n').reduce(function (amountOfAddedInfo, person) {
        isUpdated = false;
        isAdded = false;
        parsedStr = person.split(';');

        person = new Person(parsedStr[1], parsedStr[0], parsedStr[2]);

        if (phoneBook.getPersonByPhone(person.getPhone())) {
            isUpdated = update(person.getPhone(), person.getName(), person.getEmail());
        } else {
            isAdded = add(person.getPhone(), person.getName(), person.getEmail());
        }

        return isUpdated || isAdded
            ? ++amountOfAddedInfo
            : amountOfAddedInfo;
    }, 0);
}

function showTable() {
    if (!phoneBook.getPersons().length) {
        console.log(warnAlert);

        return;
    }
    phoneBook.setNameColLength(maxWordLength(phoneBook.getNameArr()));
    phoneBook.setPhoneColLength(maxWordLength(phoneBook.getBeautyPhoneArr()));
    phoneBook.setEmailColLength(maxWordLength(phoneBook.getEmailArr()));
    buildTopOfTable();
    addDataIntoTable();
    buildBottomOfTable();
}

function isValidInfo(phone, name, email) {
    return isValidPhone(phone || '') && isValidName(name || '') &&
        isValidEmail(email || '');
}

function isValidPhone(phone) {
    return phone.match(REGEXP_PHONE);
}

function isValidName(name) {
    return name.match(REGEXP_NAME);
}

function isValidEmail(email) {
    return !email || email.match(REGEXP_EMAIL);
}

function isPersonSuitesQuery(info, query) {
    for (var field in info) {
        if (info.hasOwnProperty(field) && info[field] && info[field].match(query)) {
            return true;
        }
    }

    return false;
}

function sortPersonsByName(p1, p2) {
    return p1.getName() > p2.getName() ? 1 : -1;
}

function stringifyPersonsInfo(info) {
    var resultStr;

    return info.map(function (person) {
        resultStr = person.getName() + ', ' + beatifyPhoneNum(person.getPhone());

        if (person.getEmail()) {
            resultStr += ', ' + person.getEmail();
        }

        return resultStr;
    });
}

function beatifyPhoneNum(phone) {
    return phone.replace(REGEXP_PHONE_STANDART, '+7 ($1) $2-$3-$4');
}

function convertPhoneToStartFormat(phone) {
    return phone.slice(4, 7) + phone.slice(9, 19).replace(/-/g, '');
}

function getPhoneFromInfoStr(info) {
    return info.match(REGEXP_PHONE_BEAUTY)[0];
}

function buildTopOfTable() {
    var topOfTable = '\n┌';
    var nameCol = 'Имя';
    var phoneCol = 'Телефон';
    var emailCol = 'email';
    topOfTable += '─'.repeat(phoneBook.getNameColLength() + 1) + '┬' +
        '─'.repeat(phoneBook.getPhoneColLength() + 1) + '╥' +
        '─'.repeat(phoneBook.getEmailColLength() + 1) + '┐\n';

    topOfTable += '│ ' + nameCol + ' '.repeat(phoneBook.getNameColLength() - nameCol.length);
    topOfTable += '│ ' + phoneCol + ' '.repeat(phoneBook.getPhoneColLength() - phoneCol.length);
    topOfTable += '║ ' + emailCol + ' '.repeat(phoneBook.getEmailColLength() - emailCol.length);
    topOfTable += '│';
    console.log(topOfTable);

    topOfTable = '├' + '─'.repeat(phoneBook.getNameColLength() + 1);
    topOfTable += '┼' + '─'.repeat(phoneBook.getPhoneColLength() + 1);
    topOfTable += '╫' + '─'.repeat(phoneBook.getEmailColLength() + 1);
    topOfTable += '┤\n';
    console.log(topOfTable);
}

function addDataIntoTable() {
    return phoneBook.getPersons().forEach(function (person) {
        var data = '│ ' + person.getName();
        data += ' '.repeat(phoneBook.getNameColLength() - person.getName().length);
        data += '│ ' + beatifyPhoneNum(person.getPhone()) +
            ' '.repeat(phoneBook.getPhoneColLength() - beatifyPhoneNum(person.getPhone()).length);
        data += '║ ' + person.getEmail();
        data += ' '.repeat(phoneBook.getEmailColLength() - person.getEmail().length);
        data += '│\n';
        console.log(data);
    });
}

function buildBottomOfTable() {
    var bottomOfTable = '└' + '─'.repeat(phoneBook.getNameColLength() + 1);
    bottomOfTable += '┴' + '─'.repeat(phoneBook.getPhoneColLength() + 1);
    bottomOfTable += '╨' + '─'.repeat(phoneBook.getEmailColLength() + 1);
    bottomOfTable += '┘';
    console.log(bottomOfTable);
}

function maxWordLength(lengthArr) {
    return Math.max.apply(null, lengthArr) + 1;
}

exports.add = add;
exports.update = update;
exports.find = find;
exports.findAndRemove = findAndRemove;
exports.importFromCsv = importFromCsv;
exports.isStar = true;
