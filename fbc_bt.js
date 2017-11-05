var Cc=Components.classes, Ci=Components.interfaces, a,b,c,d,e,f,k,t,j,i, Path='C:\\CapNum\\solve\\';
var proc=Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
var file=Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
var cok=Cc["@mozilla.org/cookiemanager;1"].getService(Ci.nsICookieManager);
var prf=Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
var str=Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
var alt=Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
var ab=Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader);
var iP=iimPlayCode, iD=iimDisplay, t0='SET !TIMEOUT_STEP 0\n', t3='SET !TIMEOUT 30\n';
var txt='', b='', a=0, t='', w=0, skz=1, skq=1;

var Tabs = {
	_browser: function () {
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator);
		return wm.getMostRecentWindow("navigator:browser").gBrowser;
	}(),
	go: function (tabIndex) {
		this._browser.selectedTab = this._browser.tabContainer.childNodes[tabIndex - 1];
	}
};

// функции (ЧТЕНИЯ / ЗАПИСИ / ДОБАВЛЕНИЕ В КОНЕЦ) файла
function readFromFile(filename){return imns.FIO.readTextFile(imns.FIO.openNode(filename))}
function writeToFile(filename, cont){imns.FIO.writeTextFile(imns.FIO.openNode(filename),cont)}
function appendToFile(filename,cont){imns.FIO.appendTextFile(imns.FIO.openNode(filename),cont)}

// функция, чтобы работала кнопка стоп
function iimPlayCode(code) {

    var Cc = Components.classes,
        Ci = Components.interfaces,
        wm = Cc["@mozilla.org/appshell/window-mediator;1"]
                .getService(Ci.nsIWindowMediator)
                .getMostRecentWindow("navigator:browser");

    iimPlay('CODE:' + code);

    if (iimGetLastError() == 'Macro stopped manually') {
            log('Скрипт остановлен кнопкой стоп!');
            window.setTimeout(function() {
                wm.iMacros.panel.sidebar.
                document.getElementById('message-box-button-close').click()
            } , 4);
            throw 'Скрипт остановлен кнопкой стоп!';
    }
};

var Nagibaka = {


    /**
     *  Solve Google reCaptcha v.2 with rucaptcha.com service
     *
     *  @author: Nagibaka<nagibaka.ru>
     *  @date: 18.01.2017
     *  @version : 1.0
     *
     *  @param {String} ruCaptchaKey [API key from rucaptcha.com]
     *  @return {JSON} [Object with info about success or errors]
     */
    fuckReCaptcha2: function () {

        ruCaptchaKey = keyApi['Rucaptha'];

        iimPlayCode('SET !EXTRACT_TEST_POPUP NO');
        iimPlayCode('SET !ERRORIGNORE YES');
        iimPlayCode('SET !TIMEOUT_STEP 0');

        var out = {
            isSolved: false,
            hasError: false,
            errorText: "no text"
        };

        var reqCount = 0;


        function checkSolution (gkey) {

            ruCaptchaKey = keyApi['Rucaptha'];

            if (reqCount > 14) {  // 14 * 7 = 98 second timeout

                out = {
                    isSolved: false,
                    hasError: true,
                    errorText: "Rucaptcha timeout error."
                };

                return;

            }

            wait(7);

            var XMLHttpRequestT = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1");
            var xhr = new XMLHttpRequestT();
            var url = "http://rucaptcha.com/res.php?key=" + ruCaptchaKey + "&action=get&id=" + gkey + "&json=1"
            xhr.open('GET', url, false);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

            xhr.timeout = 60000;


            // processing results
            try {

                xhr.send();

                if (xhr.status != 200) {
                    out = {
                        isSolved: false,
                        hasError: true,
                        errorText: xhr.statusText
                    };
                } else {
                    var res = JSON.parse(xhr.responseText);
                    if (res.status == 1) {
                        window.document.querySelector('.g-recaptcha-response').style = "";
                        window.document.querySelector('.g-recaptcha-response').textContent = res.request;
                        out = {
                            isSolved: true,
                            hasError: false,
                            errorText: "Success!"
                        };

                    } else {
                        reqCount++;
                        checkSolution (gkey)
                    }
                }

            } catch (e) {
                out = {
                    isSolved: false,
                    hasError: true,
                    errorText: e.name
                };

            }


        }



        if (window.document.querySelector('.g-recaptcha') == null) {
            return {
                isSolved: false,
                hasError: true,
                errorText: "Recaptcha not found on page."
            };
        }

        var dataSiteKey = window.document.querySelector('.g-recaptcha').getAttribute('data-sitekey');
        var domen = window.location.host;

        var params = "key=" + ruCaptchaKey + "&method=userrecaptcha&googlekey=" + dataSiteKey + "&pageurl=" + domen + "&json=true&header_acao=1";

        var XMLHttpRequest = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1");
        var xhr = new XMLHttpRequest();
        xhr.open('POST', "http://rucaptcha.com/in.php", false);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.timeout = 60000;

        try {

            xhr.send(params);

            if (xhr.status != 200) {
                out = {
                    isSolved: false,
                    hasError: true,
                    errorText: xhr.statusText
                };
            } else {
                var res = JSON.parse(xhr.responseText);
                if (res.status == 1) {
                    checkSolution(res.request);
                } else {
                    out = {
                        isSolved: false,
                        hasError: true,
                        errorText: xhr.statusText
                    };
                }
            }

        } catch (e) {
            out = {
                isSolved: false,
                hasError: true,
                errorText: e.name
            };

        }

        return out;

    }

};

// запись лога в файл
function log(txt) { appendToFile('c:\\' + dirData + '\\log.txt', get_current_time() + ' | ' + txt + '\n'); }

// добавляет впереди ноль, если число меньше десяти
function nulTen (txt) { return (Number(txt) < 10) ? '0' + txt : txt; }

// получить дату
function getDate() {
    var d=new Date();
    return d.getFullYear() + "-" + nulTen(d.getMonth()) + "-" + nulTen(d.getDate());
}

// получение времени
function get_current_time(){
    var d=new Date();
    return nulTen(d.getHours()) + ":" + nulTen(d.getMinutes()) + ":" + nulTen(d.getSeconds());
}

// Случайное число в диапазоне от min (включительно) до max (включительно)
function getRandomInRange(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// запись файла balance.txt
function saveBalanceFile() {
    var txt = 'Лог файл\n' + valuta['freebitco'] + '\n';
    writeToFile('C:\\' + dirData + '\\balans.txt', txt);
}

// чтение файла баланса
function loadBalanceFile() {
    return readFromFile('C:\\' + dirData + '\\balans.txt').split("\n");
}

// Функция проверки баланса FreeBitCoin
function getBalance() { return window.document.getElementById("balance").innerHTML; }

         /***-= Функция имитации мыши =-***/
function triggerMouseEvent (node, eventType) {
    var clickEvent = window.document.createEvent ('MouseEvents');
    clickEvent.initEvent (eventType, true, true);
    node.dispatchEvent (clickEvent);
}

         /***-= Ожидание =-***/
function wait(s) {iimPlayCode("WAIT SECONDS=" + s);}

// получает номер, а отправляет str с разрядом 8
function str8(nm) {
    if (typeof nm != 'number') { alert(nm + ':' + typeof nm); return nm; }
    return nm.toFixed(8); }

// ищем класс captchas.net капчи
function no_isset_captchas_net() {
    if (window.document.getElementsByClassName("captchasnet_captcha_content").length == 0) {
        log('captchasnet_captcha_content не существует');
        return true;
    }
    else return false;
}

                                                  // КОШЕЛЬКИ

// var keyApi = []; keyApi['Rucaptha'] = '8f795c02b4b9a10e6f1316bc167de1e3'; //ключ рукапчи одного ботодела
var keyApi = []; keyApi['Rucaptha'] = 'f7942f9be313107a8bf019367bb1b6a0'; //Мой ключ рукапчи
var bitWallet =  '45674565546';   //Ваш BITCON кошелек
var dogeWallet = '46546546546';   //Ваш DOGECOIN кошелек

                                                  //ПАРОЛИ

var passFreebitco = '6546546546546';  //Пароль для сайта Freebitco.in
var passFreedoge =  '45654654646546';  //Пароль для сайта Freedoge.co.in

                                                  //ФУНКЦИОНАЛ

var randomtimer = 1;         // Случайный таймер перед каждым сбором, 1 - вкл., 0 - выкл.
var recognition = 0;		 // Бесплатное распознавание: 1-включено, 0-выключено
var points = 1;				 // Опция включения и выключения работы с поинтами: 1-включено, 0-выключено
var free_btc_bonus = 1;		 // Опция покупки 1000% клейма: 1-включено, 0-выключено
var igrabit = 0;             // Игра Multiply после каждого сбора на Freebitcoin 1- вкл, 0 - выкл
var faucetOn = [];           // Не трогаем
var pp = 0;                  // Не трогаем
var prob = 10; 				 // Количество допустимых неудачных попыток на один сайт
var dirData = 'FORBOT';  	 // Папка на диске С: в которой хранятся данные для работы скрипта


												 //ТАЙМЕРЫ
//=============Ставим период сбора в минутах , 0 = ВЫКЛ (просто меняйте цифру)======================
faucetOn['log'] = 1440; 		  // время в минутах через которое очистится лог файл скрипта
faucetOn['freebitco'] = 61;       // 60


//==================================================================================================
//
//			ЕСЛИ ВАМ ИНТЕРЕСНО, И ВЫ ЧЕГО-ТО ПОНИМАЕТЕ, ТО МОЖЕТЕ ПОКОПАТЬСЯ В КОДЕ НИЖЕ :)))
//
//===================================================================================================
var n = '\n';

try {
	var b = loadBalanceFile();
} catch(e) {};

var valuta = [];
valuta['log'] = "<a href='logs\\' target='_blank'>папка logs</a>";
valuta['freebitco'] = b[1];

Main();

// ===================--------------======================----------------
// главная функция, которая собственно запускает весь процесс
function Main() {

    var col = 40;
    nextsbor = [];
    nextsbor = getTimerSite();

    while (true) {
        var msec = milisec();
        var i = 0;
        for (var key in faucetOn) {
            i++;
            if (nextsbor[i] < msec && faucetOn[key] > 0) {
                runFaucet(key);
            }
        }
        updateWaitTimer();
        closeAllOthers();
    }
}
// ===================--------------======================----------------

function waitrandom(){
    var randomNumber = Math.floor(Math.random()*117 + 48);
    iimDisplay('ждем ' + randomNumber + ' секунд');
	wait(randomNumber);
	}

function waitrandommin(){
    var randomNumber = Math.floor(Math.random()*120 + 10);
    iimDisplay('ждем ' + randomNumber + ' секунд');
	wait(randomNumber);
	}

function milisec() {
    return new Date().getTime()
}

// закрывает все вкладки
function closeAllOthers() {
	Tabs.go(1);
    iimPlayCode(t0+'TAB CLOSEALLOTHERS');
}

function getTimerSite() {
    var str = readFromFile('C:\\' + dirData + '\\timer2.csv');
    return str.split('|');
}

function updateTimer(t, i, min) {
    var nowtime = milisec();
    msec = min * 60 * 1000;
    t[i] = nowtime + msec;
    nextsbor[i] = t[i];
    var str = t.join('|');
    writeToFile('C:\\' + dirData + '\\timer2.csv', str);
}

// обновление файла wait.html
function updateWaitTimer() {
    var strUpFile = '';
    var strUpFile_light = '';
    timeToCountDown = '';
    var header = '<link href=\'bootstrap/css/bootstrap.min.css\' rel=\'stylesheet\' media=\'screen\'>\n' +
                '<link href=\'bootstrap/css/bootstrap-responsive.min.css\' rel=\'stylesheet\' media=\'screen\'>\n'+
                '<link href=\'vendors/easypiechart/jquery.easy-pie-chart.css\' rel=\'stylesheet\' media=\'screen\'>\n' +
                '<link href=\'assets/styles.css\' rel=\'stylesheet\' media=\'screen\'>\n';
    var table = '';
    table += '<div class=\'block\'>\n'+
            '<div class=\'navbar navbar-inner block-header\'>\n' +
            '<div class=\'muted pull-left\'>Condensed Table</div>\n' +
            '</div>\n' +
            '<div class=\'block-content collapse in\'>\n' +
            '<div class=\'span12\'>\n' +
            '<table class=\'table table-condensed\'>\n' +
            '<thead><tr><th>#</th><th>Site Name</th><th>Time Left</th><th>Timeout</th><th>Balance</th></tr></thead><tbody>\n';

    tbl = tableComplete();
    table += tbl.table;

    wait(1);

    table += '</tbody>\n' +
            '</table>\n' +
            '</div>\n' +
            '</div>\n' +
            '</div>';

    var footer = '<script src=\'vendors/jquery-1.9.1.min.js\'></script>\n' +
                '<script src=\'bootstrap/js/bootstrap.min.js\'></script>\n' +
                '<script src=\'vendors/easypiechart/jquery.easy-pie-chart.js\'></script>\n' +
                '<script src=\'js/fn.js\'></script>\n' +
                '<script>$(timerTable());</script>\n';
    var dopdata = '<span class=\'badge badge-warning \'>Next: ' + tbl.nextSite + '</span>\n' +
                '<span class=\'badge badge-success ttimer\'> ' + tbl.waitSecond + '</span>\n' +
                '<span class=\'badge badge-info pull-right\'><i class=\'icon-tag\'></i>RuCaptcha: ' + get_balance_rucaptcha() + ' RUB</span>\n';
	strUpFile += header + dopdata + table + footer + '';

    updateSiteTable(strUpFile);
    window.document.location.replace('file:///C:/' + dirData + '/wait.html');
    wait(tbl.waitSecond);
}

// заполнение таблицы (участвует в формировании файла site_table.html)
function tableComplete() {
    var waitSecond = 999999;
    var t = nextsbor;
    var nowMilisec = milisec();
    var i = 0;
    table = '';
    for (var key in faucetOn) {
        i++;
        if (faucetOn[key] > 0) {
            var countdownSec = parseInt((t[i] - nowMilisec) / 1000);
            if (countdownSec < 3) {
                countdownSec = 3
            }
            if (countdownSec < waitSecond) {
                var nextSite = key;
                var waitSecond = countdownSec;
            }
            if (key == 'log') { var key2 = "<a href='log.txt' target='_blank'>log</a>"; }
            else { key2 = key; }
            table += '<tr>\n' +
                    '<td>' + i + '</td>\n' +
                    '<td>' + key2 + '</td>\n' +
                    '<td class=\'ttimer\'>' + countdownSec + '</td>\n' +
                    '<td><span class=\'badge badge-info\'>' + faucetOn[key] + '</span></td>\n' +
                    '<td><span class=\'badge badge-info\'>'+ valuta[key] +'</span></td>\n' +
                    '</tr>\n'
        } else {
            table += '<tr>\n' +
                    '<td>' + i + '</td>\n' +
                    '<td>' + key + '</td>\n' +
                    '<td>OFF</td>\n' +
                    '<td></td>\n' +
                    '</tr>\n'
        }
    }
    return {
        table: table,
        nextSite: nextSite,
        waitSecond: waitSecond
    };
}

// перезапись файла site_table.html
function updateSiteTable(txt) {
    writeToFile('c:\\' + dirData + '\\site_table.html', txt);
}

// проверка баланса рукапчи (без открытия страницы)
function get_balance_rucaptcha() {
    apikey = keyApi['Rucaptha'];
    for (i = 0; i <= 14; i++) {
        if (i == 14) {  // 14 * 5 = 70 секунд timeout
            iimDisplay('Rucaptcha timeout error.');
            return 'timeout error';
        }

        var XMLHttpRequestT = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1");
        var xhr = new XMLHttpRequestT();
        var url = "http://rucaptcha.com/res.php?key=" + apikey + "&action=getbalance&json=1"
        xhr.open('GET', url, false);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        xhr.timeout = 60000;

        try {
            xhr.send();

            if (xhr.status != 200) {
                iimDisplay('Rucaptcha error:' + xhr.statusText);
                return 'error status';
            } else {
                var res = JSON.parse(xhr.responseText);
                if (res.status == 1) {
                    iimDisplay('Rucaptcha: ' + res.request + ' RUB');
                    return res.request;
                } else {
                    continue;
                }
            }
        } catch (e) {
            iimDisplay('error:' + e.name);
            return 'error: ' + e.name;
        }
        wait(5);
    }
}

// Функция получения ответа с рукапчи (без загрузки страницы)
function GetRucaptchaJSON(capthId, apikey) {
    var result = '';
    for (i = 0; i < prob; i++) {

        var XMLHttpRequestT = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1");
        var xhr = new XMLHttpRequestT();
        var url = 'http://rucaptcha.com/res.php?key=' + apikey + '&action=get&id=' + capthId + '&json=1'
        xhr.open('GET', url, false);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        xhr.timeout = 60000;

        try {
            xhr.send();

            if (xhr.status != 200) {
                iimDisplay('Rucaptcha error:' + xhr.statusText);
                return 'error status';
            } else {
                var res = JSON.parse(xhr.responseText);
                if (res.status == 1) {
                    iimDisplay('Rucaptcha: ' + res.request);
                    wait(5);
                    return res.request;
                } else {
                    var err = res.request;
                    switch (err) {
                        case'CAPCHA_NOT_READY':
                            wait(5);
                            break;
                        case'ERROR_KEY_DOES_NOT_EXIST':
                            log('Не прописан ключ от рукапчи или кончился баланс на счете');
                            return 'ERROR';
                            break;
                        case'ERROR_WRONG_ID_FORMAT':
                        	log('Rucaptcha: ERROR_WRONG_ID_FORMAT');
                            return 'ERROR';
                            break;
                        case'ERROR_WRONG_CAPTCHA_ID':
                        	log('Rucaptcha: ERROR_WRONG_CAPTCHA_ID');
                            return 'ERROR';
                            break;
                        case'ERROR_CAPTCHA_UNSOLVABLE':
                            log('Никто не смог разгадать капчу - пробуем еще');
                            return 'ERROR_CAPTCHA_UNSOLVABLE';
                            break;
                        default:
                            var result = err
                    }
                }
            }
        } catch (e) {
            iimDisplay('error:' + e.name);
            return 'error: ' + e.name;
        }
        return result;
    }
}

        // ФУНКЦИЯ СОХРАНЕНИЯ КАПЧИ CAPTHAS.NET НА FREEBITCOIN
function SaveCapthasNet(file_name) {
	iimPlayCode(
        'ONDOWNLOAD FOLDER=C:\\' + dirData + '\\ FILE=' + file_name + ' WAIT=YES\n' +
        'TAG POS=1 TYPE=IMG ATTR=SRC:https://captchas.freebitco.in/cgi-bin/captcha_generator?client=freebitcoin&random=* CONTENT=EVENT:SAVE_ELEMENT_SCREENSHOT\n' +
        'WAIT SECONDS=2'
	);
}

         // ФУНКЦИЯ ОТПРАВКИ НА РУКАПЧУ
function GetRucaptcha(file_name, apikey) {
    var result = [];
    var code = '';
    code += 'CODE: \n SET !EXTRACT_TEST_POPUP NO \n SET !ERRORIGNORE YES \n SET !TIMEOUT_STEP 0 \n';
    code += 'TAB OPEN' + n;
    code += 'TAB T=2' + n;
    code += 'URL GOTO=file:///C:/' + dirData + '/form_api_rucaptcha.html' + n;
    code += 'TAG POS=1 TYPE=INPUT:TEXT ATTR=NAME:key&&SIZE:64 CONTENT=' + apikey + n;
    code += 'TAG POS=1 TYPE=INPUT:FILE ATTR=TYPE:file&&NAME:file&&SIZE:20 CONTENT=C:\\' + dirData + '\\' + file_name + n;
    if (file_name == 'calc.png') {
        code += 'TAG POS=1 TYPE=INPUT:CHECKBOX FORM=ACTION:* ATTR=NAME:calc CONTENT=YES' + n
    }
    code += 'TAG POS=1 TYPE=INPUT:SUBMIT ATTR=TYPE:submit&&VALUE:recognize' + n;
    code += 'WAIT SECONDS=2' + n;
    code += 'TAG POS=1 TYPE=BODY ATTR=TXT:* EXTRACT=TXT' + n;
    code += 'WAIT SECONDS=1' + n;
    code += 'TAB CLOSE' + n;
    iimPlay(code, 120);
    var str = iimGetLastExtract();
    var capthId = str.replace('OK|', '');
    switch (capthId) {
        case'ERROR_NO_SLOT_AVAILABLE':
            var code = '';
            code += 'CODE: \n SET !EXTRACT_TEST_POPUP NO \n SET !ERRORIGNORE YES \n SET !TIMEOUT_STEP 0 \n';
            code += 'TAB T=1' + n;
            code += 'WAIT SECONDS=5' + n;
            return GetRucaptcha(file_name, apikey);
            break;
        default:
            // result['c_text'] = GetRucaptchaTEXT(capthId, apikey, file_name, pp);
            wait(5);
            result['c_text'] = GetRucaptchaJSON(capthId, apikey);
            result['c_id'] = capthId
    }
    return result
}



        //ФУНКЦИЯ ОТПРАВКИ ОТЧЕТА О НЕПРАВИЛЬНО РАСПОЗНАННОЙ КАПЧЕ
function reportRucaptcha(apikey, capthId) {
    var code = '';
    code += 'CODE: \n SET !EXTRACT_TEST_POPUP NO \n SET !ERRORIGNORE YES \n SET !TIMEOUT_STEP 0 \n';
    code += 'TAB OPEN' + n;
    code += 'TAB T=2' + n;
    code += 'URL GOTO=http://rucaptcha.com/res.php?key=' + apikey + '&action=reportbad&id=' + capthId + n;
    code += 'WAIT SECONDS=5' + n;
    code += 'TAB CLOSE' + n;
    iimPlay(code, 60)
}

        //ОБНОВЛЕНИЕ КАПЧИ SOLVEMEDIA
function reloadCaptcha(f){
	for (z = 0; z < 10; z++) {
	var f=iimPlayCode('SET !TIMEOUT_STEP 0\nTAG POS=1 TYPE=INPUT:TEXT FORM=NAME:NoFormName ATTR=NAME:adcopy_response');
		if(f<0){
			iimPlayCode('SET !TIMEOUT_STEP 0\nTAG POS=1 TYPE=IMG ATTR=SRC:*solvemedia.com/media/reload*.gif');
			iimDisplay('проверяем еще раз капчу');
			log('Выпала капча с окном выбора, обновляем');
		}
	iimDisplay('Капча в норме - можно отправлять');
	return;
	}
}

        // ОБНОВЛЕНИЕ КАПЧИ CAPCHAS.NET НА FREEBITCOIN
function reloadCaptchasNet(){
	iimPlayCode(
        'WAIT SECONDS = 3\n' +
        'TAG POS=1 TYPE=P ATTR=CLASS:captchasnet_captcha_change_p<SP>captchasnet_captcha_refresh&&ONCLICK:GenerateCaptchasNetCaptcha("captchasnet_free_play_captcha",<SP>0)&&TXT:\n' +
        'WAIT SECONDS = 3'
	);
}

// сохранение лог файла в папку logs и создание нового log.txt
function updateLogFile() {
    old_log = readFromFile('c:\\' + dirData + '\\log.txt');
    writeToFile('c:\\' + dirData + '\\logs\\' + getDate() + '_log.txt', old_log);
    start_log_txt = 'RuCaptcha: ' + get_balance_rucaptcha() + ' RUB\n' +
                    '-----------------------------------------------\n';
    writeToFile('c:\\' + dirData + '\\log.txt', start_log_txt);
}

function Faucet_log() {
    nextsbor = [];
    nextsbor = getTimerSite();
    updateTimer(nextsbor, 1, faucetOn['log']);

	updateLogFile();

	iimDisplay('Лог обновлён (остальные в папке logs)');
}

function Faucet_freebitco(pp) {
    if (pp > prob) return;

	kran();

    nextsbor = [];
    nextsbor = getTimerSite();

    updateTimer(nextsbor, 2, faucetOn['freebitco']);

    if (Number(igrabit) >= 1) {
        playing();
    } else {
       log('Баланс: ' + getBalance() + ' BTC' + '\n');
    }

    wait(3);
    iimPlayCode('REFRESH\nWAIT SECONDS=#DOWNLOADCOMPLETE#');
    wait(3);

    var bit = +getBalance();
	window.document.querySelector(".stats_link").click(); wait(10);

    try{
		curs_bit = +window.document.querySelector('span[id="btc_usd_price"]').textContent.match(/[.\d]+/g).join('');
	} catch(e){curs_bit = 0;}

    valuta['freebitco'] = bit + ' BTC = ' + (bit*curs_bit).toFixed(8) + ' USD , (курс: $' + curs_bit + ')';



    function kran() {
        var file = 'freebitcoin.png';
	   // var file = 'img' + milisec() + '.png';
	   iimPlayCode('TAB CLOSEALLOTHERS\nURL GOTO=freebitco.in/\n'+t0+'TAG POS=1 TYPE=A ATTR=TXT:Got<SP>it!');
	   wait(5);
	   if (iimPlayCode(t0+'TAG POS=1 TYPE=DIV ATTR=ID:header_right')>0) {
	       iimPlayCode(t0+'TAG POS=1 TYPE=DIV ATTR=ID:header_right  extract=txt');
	       wait(+iimGetExtract().match(/\d+/g)+3);
	       var targetNode = window.document.querySelector('a[href^="https://freebitco.in/?op=home"]');
	       if (targetNode) {
                triggerMouseEvent (targetNode, "mouseover");
                triggerMouseEvent (targetNode, "mousedown");
                triggerMouseEvent (targetNode, "mouseup");
                triggerMouseEvent (targetNode, "click");
            } else window.console.log ("*** Target node not found!");
	   }
	   wait(5);
	   iimPlayCode(
            'SET !ERRORIGNORE YES\n' +
            'SET !TIMEOUT_STEP 0\n' +
            'TAG POS=1 TYPE=A ATTR=TXT:LOGIN\n' +
            '\n' +
            'TAG POS=1 TYPE=INPUT:TEXT FORM=ID:login_form ATTR=ID:login_form_btc_address CONTENT=' +
            bitWallet + '\n' +
            'TAG POS=1 TYPE=INPUT:PASSWORD FORM=ID:login_form ATTR=ID:login_form_password CONTENT=' +
            passFreebitco + '\n' +
            'TAG POS=1 TYPE=A ATTR=TXT:"Got it!"'
        );
	   iimPlayCode('SET !TIMEOUT_STEP 0\nTAG POS=1 TYPE=A ATTR=TXT:LOGIN EXTRACT=TXT');
        err = iimGetLastExtract();
        if (err == 'LOGIN') {
		  iimDisplay('Заходим на кран');
		}

        iimPlayCode('SET !TIMEOUT_STEP 0\nTAG POS=1 TYPE=A ATTR=TXT:LOGIN EXTRACT=TXT');
        err = iimGetLastExtract();
        if (err == 'LOGIN') {
            iimDisplay('Заходим на кран');
            reloadCaptcha();
            SaveCapthasNet(file);
            var str = GetRucaptcha(file, keyApi['Rucaptha']);
            var cText = str['c_text'];
            if (cText == undefined) {
                log('Глюк рукапчи на сайте Freebitco - пробуем еще раз');
                kran();
                return;
            }
            var captha = cText.replace(/\s/g, '<SP>');
            iimDisplay(captha);
            if (captha == 'ERROR_CAPTCHA_UNSOLVABLE') {kran();return}
            iimPlayCode(
                'SET !ERRORIGNORE YES\n' +
                'SET !TIMEOUT_STEP 0\n' +
                'TAG POS=1 TYPE=INPUT:TEXT FORM=ACTION:/ ATTR=NAME:adcopy_response CONTENT=' + captha + '\n' +
                'TAG POS=2 TYPE=INPUT:SUBMIT FORM=ACTION:/ ATTR=*\n' +
                'FILEDELETE NAME=C:\\' + dirData + '\\' + file
            );
            iimPlayCode("SET !TIMEOUT_STEP 0 \nTAG POS=1 TYPE=P ATTR=ID:login_error EXTRACT=TXT");
            err = iimGetLastExtract();
            if (err == 'Incorrect captcha entered') {
                reportRucaptcha(keyApi['Rucaptha'], str['c_id']);
                log('Неверно разгадана капча на вход - кран freebitco');
                kran();
                return;
            }
        } else {iimDisplay('Вход не нужен - собираем сатоши');}

        if (Number(points)>=1) {
            if(!BonusCheck()) RP_WORK() ;
        }
        iimPlayCode("SET !TIMEOUT_STEP 0 \nTAG POS=1 TYPE=P ATTR=TXT:PLEASE<SP>ENTER<SP>CAPTCHA EXTRACT=TXT");
        playWithoutCaptcha = iimGetLastExtract();

    	if (playWithoutCaptcha<0){
            iimPlayCode('TAG POS=1 TYPE=INPUT:SUBMIT ATTR=ID:free_play_form_button\nWAIT SECONDS = 5');
    	}

    	if (iimPlayCode(t0 + 'TAG POS=1 TYPE=P ATTR=CLASS:"free_play_element free_play_result_style  free_play_result_error"&&ID:free_play_error&&TXT:*IP*address*has*been*blocked*')>0) {
    		faucetOn['freebitco'] = 0;
    	}

    	f=iimPlay("CODE:SET !TIMEOUT 1\nTAG POS=1 TYPE=DIV ATTR=ID:time_remaining&&CLASS:hasCountdown&&TXT:*Minut*Second*");
        if(f>0){
            log('Проверить тайминг на кране freebitco');
            return;
        }

    	var time = window.document.querySelector("#time_remaining").textContent.match(/\d+/);

        if (Number(time) < 1) {
    		//reloadCaptchasNet();
            if (no_isset_captchas_net()) {
                var result = Nagibaka.fuckReCaptcha2();
                if (result.isSolved) {
                    window.document.querySelector('#free_play_form_button').click(); // жмём ROLL
                    wait(2);
                    window.document.querySelector('.close-reveal-modal').click();
                } else {
                    log('Ошибка RuCaptcha: ' + result.errorText);
                    return;
                }
            } else {
                SaveCapthasNet(file);
                var str = GetRucaptcha(file, keyApi['Rucaptha']);
                var cText = str['c_text'];
                if (cText == undefined){
                    log('Глюк рукапчи на сайте freebitco - пробуем еще раз');
                    kran();
                    return;
                }
                var captha = cText.replace(/\s/g, '<SP>');
                iimDisplay(captha);
                if (captha == 'ERROR_CAPTCHA_UNSOLVABLE') {
                    kran();
                    return;
                }

                iimPlayCode(
                   'SET !ERRORIGNORE YES\n' +
                   'SET !TIMEOUT_STEP 0\n' +
                   'TAG POS=1 TYPE=INPUT:TEXT ATTR=* CONTENT=' + captha + '\n' +
                   'TAG POS=1 TYPE=INPUT:SUBMIT ATTR=ID:free_play_form_button\n' +
                   'WAIT SECONDS=10\n' +
                   'FILEDELETE NAME=C:\\' + dirData + '\\' +file
                );
            }

            if (iimPlayCode(t0 + 'TAG POS=1 TYPE=P ATTR=CLASS:"free_play_element free_play_result_style  free_play_result_error"&&ID:free_play_error&&TXT:*IP*address*has*been*blocked*') > 0) {
    		  faucetOn['freebitco'] = 0;
            }
            iimPlay("CODE:SET !TIMEOUT_STEP 3\nTAG POS=1 TYPE=P ATTR=ID:free_play_error EXTRACT=TXT");
            err = iimGetLastExtract();

            if (err == 'Session Expired. Please click here to reload the page.') {
                log ('Сессия истекла на сайте freebitco - пробуем еще раз');
                iimPlayCode('TAG POS=1 TYPE=A ATTR=HREF:https://freebitco.in/?op=home');
                var err = '';
                kran();
                return;
            }

            if (err == 'Captcha is incorrect or has expired. Please try again.') {
                reportRucaptcha(keyApi['Rucaptha'], str['c_id']);
        		log('Неверно разгадана капча на кране freebitco - отправляем репорт');
        		var err = '';
                kran();
        		return;
    		}
        }

        win_sum = window.document.getElementById("winnings").innerHTML;
        lotery_sum = window.document.getElementById("fp_lottery_tickets_won").innerHTML;
        points_sum = window.document.getElementById("fp_reward_points_won").innerHTML;

        win = "FreeBitco: " + win_sum + " BTC, lotery: " + lotery_sum + ", reward points: " + points_sum

        if (win_sum == '') {
            kran();
            return;
        } else {
            log(win);
            return;
        }

        // iimPlay("CODE:SET !TIMEOUT 1\nTAG POS=1 TYPE=DIV ATTR=ID:free_play_result EXTRACT=TXT");
        // win=iimGetLastExtract();

        // if (win == '#EANF#') {
        //     kran();
        //     return;
        // } else {
        //     log('FreeBitco: '+win);
        //     return;
        // }
    }
}

function runFaucet(facetName){
    switch (facetName) {
        case 'freebitco':
            if (Number(randomtimer) >= 1) waitrandom();
            Faucet_freebitco();
            saveBalanceFile();
            break;
		case 'log':
            Faucet_log();
            saveBalanceFile();
            break;
        default:
            break
    }

}

// ------------------------ Work with RP ---
function GetClass(s) {return content.document.getElementsByClassName(s) }
function GetId(s) {return content.document.getElementById(s) }
function OnlyDigits(s) { return s.replace(/\D+/g,"") }

function SaleRP(RP) {
	//1) если меньше 12, то идет собирать сатоши
	var P = -1;
	if (RP<12) var P = 0;
	//2) если >=12, но < 120 то скрипт берёт бонус Reward Points Bonus за 12 RP и идет собирать бесплатные сатоши.
	if (RP>=12 && RP< 120) P = 1 ;
	// 3) если >=120, но < 600 то скрипт берёт бонус за 120 RP и идёт собирать сатоши.
	if (RP>=120 && RP< 600) P = 10 ;
	//4) если >=600, но < 1200 то скрипт берёт бонус Reward points Bonus за 600 RP и идет собирать сатоши.
	if (RP>=600 && RP< 1200) P = 50 ;
	//5) если >=1200, но < 4400 то скрипт берёт бонус Reward points bonus за 1200 и идет собирать сатоши.
	if (RP>=1200 && RP< 4400) P = 100;
	//6) если >= 4400 то скрипт берёт бонус Reward points bonus за 1200 и ещё берет 1000% бонус к клейму за 3200 RP и идёт собирать сатоши.
	if (RP>=4400)  P = 101;
	return P ;
}

function BonusCheck() {
	var Bonus = '';
	try {
		Bonus  = GetId("bonus_container_free_points").textContent;
	} catch(e) {};
 return Bonus.length;
}

function RP_WORK() {
    wait(10);
	window.document.querySelector(".rewards_link").click();
    wait(2);
	var RP = +window.document.querySelector('div[class="reward_table_box br_0_0_5_5 user_reward_points font_bold"]').textContent.match(/\d+/g).join('');
	var press = SaleRP(RP);
    switch (press) {
        case -1: break;
    	case 0: break;
    	case 1: iimPlayCode('TAG POS=1 TYPE=BUTTON ATTR=ONCLICK:RedeemRPProduct(\'free_points_1\')&&CLASS:"reward_link_redeem_button_style "');
                break;
    	case 10: iimPlayCode('TAG POS=1 TYPE=BUTTON ATTR=ONCLICK:RedeemRPProduct(\'free_points_10\')&&CLASS:"reward_link_redeem_button_style "');
                break;
    	case 50: iimPlayCode('TAG POS=1 TYPE=BUTTON ATTR=ONCLICK:RedeemRPProduct(\'free_points_50\')&&CLASS:"reward_link_redeem_button_style "');
                break;
    	case 100: iimPlayCode('TAG POS=1 TYPE=BUTTON ATTR=ONCLICK:RedeemRPProduct(\'free_points_100\')&&CLASS:"reward_link_redeem_button_style "');
                break;
    	case 101: iimPlayCode('TAG POS=1 TYPE=BUTTON ATTR=ONCLICK:RedeemRPProduct(\'free_points_100\')&&CLASS:"reward_link_redeem_button_style "');
                wait(10);
                if (Number(free_btc_bonus) >=1 ) {
                    iimPlayCode('TAG POS=1 TYPE=BUTTON ATTR=ONCLICK:RedeemRPProduct(\'fp_bonus_1000\')&&CLASS:"reward_link_redeem_button_style "');
                }
                break;
    	}
    wait(20);
    window.document.querySelector(".free_play_link").click();
}



         /***-= HI-LO game! =-***/
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------
function playing() {

    // если страница закрыта (нет возможности найти элемент баланс), то открыть вкладку
    // и перейти на страницу freebitco.in
    if (window.document.getElementById("balance") == null) {
        window.open("https://freebitco.in", "_blank");
        wait(5);
        iimPlayCode('TAG POS=1 TYPE=A ATTR=TXT:Got<SP>it!');
    } else {
        wait(3);
        iimPlayCode('REFRESH\nWAIT SECONDS=#DOWNLOADCOMPLETE#');
        wait(3);
    }

    var balance = parseFloat(getBalance());
    var koefic = 0.15;           // коэффициент умножения по принципу мартингейл 4
    var maxStep = 13;           // максимальное количество шагов getRandomInRange(7, 8);
    var game_bets = [];         // массив ставок (вычисляется ниже)
    var pre_game_bets = [];     // массив для предварительной (временной) работы
    var streams = getRandomInRange(4, 6);               // количество отдновременно играющих потоков
    var percent_array = [108, 108, 216, 144, 108, 87, 72];  // массив процента ставок (для 1,2 сат)
    // var percent_array = [108, 108, 207, 134, 98, 72];  // массив процента ставок (для 3 сат)

    // коэффициент прибыли, относительно ставки
    var percent_profit = percent_array[streams];
    var spines = {};            // для учёта спинов

   // устанавливаем ставку и сразу же строим массив ставок по принципу мартингейл 4
    stavkin:
    for (var st = 1; st <= 17; st++) {
        for (var stp = 1; stp <= maxStep + 1; stp++) {
            if (stp == 1) {
                sum = st / 100000000;
            }
            else {
                sum = Math.ceil((sum * 2 + sum * koefic) * 100000000) / 100000000
            }
            pre_game_bets[stp] = sum;
        }
        if (balance < sum && st == 1) {
            log('Играть рано. Ждём минимального баланса:' + str8(sum) +  ', а пока баланс:' + str8(balance) + '\n');
            return;
        }
        if (balance <= sum) {
            var stavka = game_bets[1];
            break stavkin;
        }
        // создание копии массива (не ссылка на предварительный, а копия)
        game_bets = JSON.parse(JSON.stringify(pre_game_bets));
    }

    var stopSliv = -1 * game_bets[maxStep]; //Ограничение на слив

    //Ограничение на профит
    var stopProfit = (stavka * percent_profit + stavka * getRandomInRange(11, 21)) * streams;

    var stopProfit = 0.00000072 + 0.00000001 * getRandomInRange(11, 21);// тест

    // переходим на вкладку игры
    window.document.querySelector(".double_your_btc_link").click();
    wait(3);
    window.scrollBy(0,550);

    // стартовые значения
    var old_balance = balance;  // баланс перед игрой
    var games = 0; // сколько игр всего сыграно
    var valueBet = 0; // объём ставок
    var hit = 0;   // сколько выигрышных

    // массивы для последовательных потоков (streams)
    var g_stavka = [];
    var g_spin = [];
    var g_lo_hi = [];

    var start_hi_lo = getRandomInRange(0, 1);

    for (i = 1; i <= streams; i++) {
        g_stavka[i] = stavka;   // игровая ставка
        g_spin[i] = 1;   // ход игры
        g_lo_hi[i] = start_hi_lo;   // чтобы стартовало со одинаковой кнопки на всех потоках
        // g_lo_hi[i] = getRandomInRange(0, 1); // кнопка Lo или Hi разная на всех потоках
    }

    // основная игра
    multiplyBit:
    while (true) {
        for (i = 1; i <= streams; i++) {

            // принцип вписывания нужного значения в поле ставки
            window.document.querySelector('input[type="text"][id="double_your_btc_stake"]').value=str8(g_stavka[i]);

            // принцип простого умножения ставки. Нажатие на кнопку.
            // iimPlayCode('TAG POS=1 TYPE=A ATTR=ID:double_your_btc_2x');

            if (g_lo_hi[i] == 0) {
                window.document.querySelector("#double_your_btc_bet_hi_button").click();
            } else {
                window.document.querySelector("#double_your_btc_bet_lo_button").click();
            }

            valueBet = valueBet + g_stavka[i];
            games++;
            wait(1);

            // если игра висит
            proverka:
            for (ji=0; ji<20; ji++) {
                var rollResultHi = window.document.getElementById('double_your_btc_bet_hi_button').getAttribute('disabled');
                if (rollResultHi == null) {
                    break proverka;
                }
                else {
                    iimDisplay('игра Multiply висит');
                    wait(2.5);
                    if (ji == 19) {
                        log('Freebitcoin: игра Multiply зависла!!!' + ' | ' + str_spines + '\n');
                        break multiplyBit;
                    }
                }
            }

            var prib = parseFloat(getBalance()) - old_balance;

            // сообщение в аймакросе
            iimDisplay('Прибыль MULTIPLY = ' + str8(prib) + ' BTC' +
                    '\nставка: '+ str8(stavka) + ' (' + str8(g_stavka[i]) +
                    ')\nиграем до: '+ str8(stopProfit) + ' [' + streams + ' пот.] [к:' + koefic + ']' +
                    '\nстопСлив: '+ str8(stopSliv) + ' [' + maxStep + ']' +
                    '\nобъём ставок: ' + str8(valueBet));

            // прибыль
            if (prib >= stopProfit) {
                if (!spines[String(g_spin[i])]) {
                    spines[String(g_spin[i])] = 1;
                } else {
                    spines[String(g_spin[i])]++;
                }
                spines['all'] = games;
                spines['hit'] = hit;
                spines['str'] = streams;
                str_spines = JSON.stringify(spines);
                str_spines = str_spines.split('"').join('')
                str_spines = str_spines.split(',').join(', ')
                    log('MULTIPLY: ' + str8(prib) + '(' + getBalance() + ') BTC, ставка: ' + str8(stavka) + ' | объём ставок: ' +
                        str8(valueBet) + '\n         | ' + str_spines + '\n');
                    wait(3);
                    break multiplyBit;
            }

            // слив
            if (g_stavka[i] * -1 <= stopSliv && window.document.getElementById("double_your_btc_bet_lose").style.display == 'block') {
                if (!spines[String(g_spin[i])]) {
                    spines[String(g_spin[i])] = 1;
                } else {
                    spines[String(g_spin[i])]++;
                }
                spines['all'] = games;
                spines['hit'] = hit;
                spines['sliv'] = String(g_spin[i]) + '(' + str8(g_stavka[i]) + ')';
                spines['str'] = streams;
                str_spines = JSON.stringify(spines);
                str_spines = str_spines.split('"').join('')
                str_spines = str_spines.split(',').join(', ')

                log('СЛИВ!: ' + str8(prib) + '(' + getBalance() + ') BTC, ставка: ' + str8(stavka) + ' | ' + str_spines + '\n');
                break multiplyBit;
            }

            // если проиграли, то увеличиваем ставку
            if (window.document.getElementById("double_your_btc_bet_lose").style.display == 'block') {

                g_spin[i]++;

                // увеличиваем ставку, беря её из словаря
                g_stavka[i] = game_bets[g_spin[i]];

                if (g_spin[i] == maxStep) {
                    g_lo_hi[i] = (g_lo_hi[i] == 0) ? 1 : 0; // меняем кнопку
                } else if (g_spin[i] >= maxStep - getRandomInRange(2, 4)) { g_lo_hi[i] = getRandomInRange(0, 1); }

                // задержка после проигрышного спина c условием
                // (g_spin[i] > 3) ? wait(getRandomInRange(3, 4)* 0.1 * g_spin[i] + 0) : wait(0.2 + getRandomInRange(0, 1));
                wait(0.2 + getRandomInRange(0, 1));

            } else {
                // выиграло
                // объект-массив для статистики на каком ходу был выигрыш
                if (!spines[String(g_spin[i])]) {
                    spines[String(g_spin[i])] = 1;
                } else {
                    spines[String(g_spin[i])]++;
                }

                g_stavka[i] = stavka; // игровая ставка
                g_spin[i] = 1;
                // g_lo_hi[i] = (g_lo_hi[i] == 0) ? 1 : 0; // меняем кнопку
                g_lo_hi[i] = getRandomInRange(0, 1); // меняем кнопку или нет
                hit++;
                wait(0.5);
            }
        }
    }
}
