//imacros-js:showsteps no
// эта первая строчка показывает выполнения скрипта js, но зато работает кнопка стоп

var dirData = 'FORBOT';

while (true) {
    playing();
    iimPlayCode("TAB CLOSE");
    wait(30);
}

// функция, чтобы работала кнопка стоп
function iimPlayCode(code) {

    var Cc = Components.classes,
        Ci = Components.interfaces,
        wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow("navigator:browser");

    iimPlay('CODE:' + code);

    if (iimGetLastError() == 'Macro stopped manually') {
            window.setTimeout(function() {
                wm.iMacros.panel.sidebar.document.getElementById('message-box-button-close').click()
            } , 4);
            throw 'Скрипт остановлен кнопкой стоп!';
    }
};

// ожидание
function wait(s) { iimPlayCode("WAIT SECONDS=" + s); }

function readFromFile(filename){return imns.FIO.readTextFile(imns.FIO.openNode(filename))}//ЧТЕНИЕ ФАЙЛА
function writeToFile(filename, cont){imns.FIO.writeTextFile(imns.FIO.openNode(filename),cont)}//ПЕРЕЗАПИСЬ ФАЙЛА
function appendToFile(filename,cont){imns.FIO.appendTextFile(imns.FIO.openNode(filename),cont)}//ДОБАВЛЕНИЕ В КОНЕЦ

// добавляет впереди ноль, если число меньше десяти (используется в структурировании времени)
function nulTen (txt) { return (Number(txt) < 10) ? '0' + txt : txt; }

// получение времени
function getCurrentTime(){
    var d=new Date();
    return nulTen(d.getHours()) + ":" + nulTen(d.getMinutes()) + ":" + nulTen(d.getSeconds());
}

// запись лога в файл
function log(txt) { appendToFile('c:\\' + dirData + '\\log.txt', getCurrentTime() + ' | ' + txt + '\n'); }

/***-= Случайное число в диапазоне от min (включительно) до max (включительно)  =-***/
function getRandomInRange(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

/***-= Функция проверки баланса =-***/
function getBalance() { return window.document.getElementById("balance").innerHTML; }


// получает номер, а отправляет str с разрядом 8
function str8(nm) {
    if (typeof nm != 'number') { alert(nm + ':' + typeof nm); return nm; }
    return nm.toFixed(8); }

function satosh(num) { return num / 100000000; } // получает номер, а отдаёт сатоши

// создаёт массив ставок
function new_array_bets(start_bet, koefic, max_step) {
    game_bets = []
    for(i = 1; i<=max_step; i++) {
        if (i == 1) { sum = start_bet; }
        else { sum = Math.ceil(sum * 2 + sum * koefic); }
        game_bets[i] = satosh(sum)
    }
    return game_bets;
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
        iimPlayCode('REFRESH');
        wait(3);
    }

    var balance = parseFloat(getBalance());
    var stavka = 1 / 100000000; // жёсткая ставка
    var koefic = 0.15;          // коэффициент умножения по принципу мартингейл 4
    var max_step = 7;           // максимальное количество шагов getRandomInRange(7, 8);
    var game_bets = new_array_bets(1, koefic, max_step);   // массив ставок
    var pre_game_bets = [];     // массив для предварительной (временной) работы
    var streams = getRandomInRange(2, 3);               // количество отдновременно играющих потоков
    var percent_array = [108, 108, 216, 144, 108, 87, 72];  // массив процента ставок

    // коэффициент прибыли, относительно ставки
    var percent_profit = percent_array[streams];
    var spines = {};            // для учёта спинов

   // устанавливаем ставку и сразу же строим массив ставок по принципу мартингейл 4
    // stavkin:
    // for (var st = 1; st <= max_step + 2; st++) {
    //     for (var stp = 1; stp <= max_step + 1; stp++) {
    //         if (stp == 1) {
    //             sum = st / 100000000;
    //         }
    //         else {
    //             sum = Math.ceil((sum * 2 + sum * koefic) * 100000000) / 100000000
    //         }
    //         pre_game_bets[stp] = sum;
    //     }
    //     if (balance < sum && st == 1) {
    //         log('Играть рано. Ждём минимального баланса:' + str8(sum) +  ', а пока баланс:' + str8(balance) + '\n');
    //         return;
    //     }
    //     if (balance <= sum) {
    //         var stavka = game_bets[1];
    //         break stavkin;
    //     }
    //     // создание копии массива (не ссылка на предварительный, а копия)
    //     game_bets = JSON.parse(JSON.stringify(pre_game_bets));
    // }

    var stopSliv = -1 * game_bets[max_step]; //Ограничение на слив

    //Ограничение на профит
    var stopProfit = (stavka * percent_profit + stavka * getRandomInRange(11, 21)) * streams;

    // var stopProfit = (0.00000032).toFixed(8);// тест

    // переходим на вкладку игры
    window.document.querySelector(".double_your_btc_link").click();
    wait(3);
    window.scrollBy(0,550);

    // стартовые значения
    var old_balance = balance;              // баланс перед игрой
    var games = 0;                          // сколько игр всего сыграно
    var valueBet = 0;                       // объём ставок
    var hit = 0;                            // сколько выигрышных
    var payout_multiplayer = 2;           // соотношение выигрыша/проигрыша (по умолчанию 2)
    var smena = 0;  //  (0: менять, 1-2: шанс )  // сменять постоянно ход на противоположный или нет

    // массивы для последовательных потоков (streams)
    var g_stavka = [];
    var g_spin = [];
    var g_lo_hi = [];

    for (i = 1; i <= streams; i++) {
        g_stavka[i] = stavka;   // игровая ставка
        g_spin[i] = 1;   // ход игры
        g_lo_hi[i] = getRandomInRange(0, 1); // кнопка Lo или Hi
    }

    //double_your_btc_payout_multiplier
    window.document.querySelector('input[type="text"][id="double_your_btc_payout_multiplier"]').value = String(payout_multiplayer);


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
                    '\nставка: '+ str8(stavka) + ' (' + str8(g_stavka[i]) + ' [' + i + ']' +
                    ')\nиграем до: '+ str8(stopProfit) + ' [' + streams + ' пот.] [к:' + koefic + ']' +
                    '\nстопСлив: '+ str8(stopSliv) + ' [' + max_step + ']' +
                    '\nобъём ставок: ' + str8(valueBet));

            // прибыль
            if (prib >= stopProfit) {
                hit++;
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

                if (g_spin[i] == max_step) {
                    g_lo_hi[i] = (g_lo_hi[i] == 0) ? 1 : 0; // меняем кнопку
                } else if (g_spin[i] >= max_step - getRandomInRange(2, 4)) { g_lo_hi[i] = getRandomInRange(0, 1); }

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

                if (smena == 0){
                    g_lo_hi[i] = (g_lo_hi[i] == 0) ? 1 : 0; // меняем кнопку
                } else {
                    g_lo_hi[i] = getRandomInRange(0, smena); // меняем кнопку или нет
                }

                hit++;
                wait(0.5);
            }
        }
    }
}
