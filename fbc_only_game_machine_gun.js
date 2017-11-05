//imacros-js:showsteps no
// эта первая строчка показывает выполнения скрипта js, но зато работает кнопка стоп

var dirData = 'FORBOT';

while (true) {
    playing();
    iimPlayCode("TAB CLOSE");
    iimPlayCode('REFRESH');
    window.scrollBy(0,750);
    wait(15);
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

// создаёт массив hi_lo вариантов на указанное количество спинов
function new_array_hi_lo_spins(num) {
    a = []
    for (i = 0; i < num; i++) {
        a[i] = getRandomInRange(0, 1);
    }
    return a;
}

// проверка на зависание игры (если таймер долго крутится)
function check_of_freezes() {
    for (i = 0; i < 20; i++) {
        var rollResultHi = window.document.getElementById('double_your_btc_bet_hi_button').getAttribute('disabled');
        if (rollResultHi == null) {
            return true;
        }
        else {
            iimDisplay('игра Multiply висит');
            wait(2.5);
        }
    }
    return false;
}

// преобразует массив в строку (для записи в лог)
function array_to_str(arr) {
    var s = JSON.stringify(arr);
    s = s.split('"').join('')
    s = s.split(',').join(', ')
    return s
}


// добавляет новую запись или увеличивает на единицу значение массива
function values_of_array(arr, value) {
    if (!arr[String(value)]) {
        arr[String(value)] = 1;
    } else {
        arr[String(value)]++;
    }
    return arr;
}

// сравнивает баланс и если есть возможность, то передаёт параметр для понижения ставки
function check_step_balance(step_balance_array) {
    balance = parseFloat(getBalance());
    for (i = 1, len = step_balance_array.length - 1; i < len; i++) {
        if (balance >= step_balance_array[i]) {
            // alert(i)
            // alert(balance + '>=' + step_balance_array[i])
            return i;
        }
    }
    return 0;
}

// рекурсивная функция игры (игра по массиву спинов)
function play_spins(    array_hi_lo_spins,
                        game_bets,
                        step_bet,
                        spins,
                        start_balance,
                        profit_balance,
                        number_of_spins,
                        step_balance_array) {

    var balance = parseFloat(getBalance());

    var profit = balance - start_balance;

    // ограничение на указанное количество ходов
    if (step_bet > game_bets.length - 1) {

        // создание копии массива (не ссылка на предварительный, а копия)
        log_spins = JSON.parse(JSON.stringify(spins));
        log_spins['value'] = str8(log_spins['value']);

        log('LOSE: ' + str8(profit) + '(' + str8(balance) + ') BTC, ставка: ' +
            str8(game_bets[step_bet - 1]) + ' | ' + array_to_str(log_spins) + '\n');
        step_bet = 1;
        return false;
    }

    // цикл игр будет до тех пор, пока будет получен необходимый профитный баланс
    spinoprofit:
    while (balance < profit_balance) {
        new_array = [];             // массив формируется из проигрышных вариантов
        bet = str8(game_bets[step_bet]);  // ставка

        step_plus = 1; // тестируем для увеличения ставки на втором ходе

        spinogriz:
        for (var i = 0, len = array_hi_lo_spins.length; i < len; i++) {



            // вставляем нужную ставку в поле на сайте
            window.document.querySelector('input[type="text"][id="double_your_btc_stake"]').value = bet;

            // нажимаем на нужную кнопку в зависимости от значения в массиве
            if (array_hi_lo_spins[i] == 0) {
                window.document.querySelector("#double_your_btc_bet_hi_button").click();
            } else {
                window.document.querySelector("#double_your_btc_bet_lo_button").click();
            }
            wait(0.5);

            // если игра зависла
            if (check_of_freezes == false) {
                log('Freebitcoin: игра Multiply зависла!!!' + ' | ' + array_to_str(spins) + '\n');
                return false;
            }

            spins['all']++;
            spins['value'] = spins['value'] + parseFloat(bet);
            balance = parseFloat(getBalance());

            var profit = balance - start_balance;

            // сообщение в аймакросе
            iimDisplay('Прибыль MULTIPLY = ' + str8(profit) + ' BTC' +
                    '\nставка: ' + bet + ' (шаг:' + step_bet + ')' +
                    '\nиграем до: ' + str8(profit_balance) + ' (бал: ' + str8(balance) + ')' +
                    '\nобъём ставок: ' + str8(spins['value']) + ', спин: ' + (len - i) + '(' + len + ')' +
                    '\nигр сыграно: ' + spins['all'] + ', выигрышей: ' + spins['hit']
                    );

            wait(0.5)

            // профитный результат
            if (balance >= profit_balance) {

                spins = values_of_array(spins, step_bet);

                // создание копии массива (не ссылка на предварительный, а копия)
                log_spins = JSON.parse(JSON.stringify(spins));
                log_spins['value'] = str8(log_spins['value']);

                log('PROFIT: ' + str8(profit) + '(' + str8(balance) + ') BTC, ставка: ' + str8(game_bets[1]) +
                    '\n         | ' + array_to_str(log_spins) + '\n');

                wait(1);
                break spinoprofit;
            }


            // слив по полной
            if (balance <= game_bets[step_bet] && window.document.getElementById("double_your_btc_bet_lose").style.display == 'block') {

                spins = values_of_array(spins, step_bet);

                // создание копии массива (не ссылка на предварительный, а копия)
                log_spins = JSON.parse(JSON.stringify(spins));
                log_spins['value'] = str8(log_spins['value']);

                log('LOSE-FULL: ' + str8(profit) + '(' + str8(balance) + ') BTC, ставка: ' +
                    str8(game_bets[step_bet - 1]) + ' | ' + array_to_str(log_spins) + '\n');

                step_bet = 1;
                break spinoprofit;
            }

            // если проиграли
            if (window.document.getElementById("double_your_btc_bet_lose").style.display == 'block') {
                new_array.push(array_hi_lo_spins[i]); // добавляем проигрышный вариант в новый массив

                // ==========++++++++++=============+++++++++==============++++++++++===
                // =====================================================================
                // закоменти/раскоменти этот if-else и ставки не_будут/будут плясать :-)
                // if (step_plus == 1 && step_bet != game_bets.length - 1) {
                //     bet = str8(game_bets[step_bet + 1]);
                //     step_plus++;
                // }
                // else {
                //     bet = str8(game_bets[step_bet]);
                //     step_plus = 1;
                // }
                // ======================================================================
            }
            else { // если выиграли
                spins['hit']++;
                bet = str8(game_bets[step_bet]);
                step_plus = 1;
            }

            // проверка и возможное понижение ставки
            if (step_bet > 1){
                go = check_step_balance(step_balance_array);
                if (go > 0) {
                    iimDisplay('Ступенька! :-) (' + go + ')');
                    wait(2);
                    step_bet = go;
                    new_array = new_array_hi_lo_spins(number_of_spins);
                    step_balance_array.splice(go + 1); // выбрасывание последних значений из массива

                    game_data = play_spins( new_array,
                                            game_bets,
                                            step_bet,
                                            spins,
                                            start_balance,
                                            profit_balance,
                                            number_of_spins,
                                            step_balance_array);

                    if (game_data == false) { return false; } // такой вариант, если случилась хрень и нужно выйти из игры

                    return game_data;
                }
            }

            // перезапуск и переход на начальную ставку
            // if (balance >= start_balance && step_bet > 1) {
            //     iimDisplay('Перезапуск! :-)');
            //     wait(2);
            //     step_bet = 1;
            //     new_array = new_array_hi_lo_spins(number_of_spins);
            //     step_balance_array.length = 0; // очистка массива шагов баланса

            //     game_data = play_spins( new_array,
            //                             game_bets,
            //                             step_bet,
            //                             spins,
            //                             start_balance,
            //                             profit_balance,
            //                             number_of_spins,
            //                             step_balance_array);

            //     if (game_data == false) { return false; } // такой вариант, если случилась хрень и нужно выйти из игры

            //     return game_data;
            // }

        }
        // вот здесь как раз и начинаются рекурсии
        if (new_array.length  > 0) {
            if (balance < start_balance){

                // если строку ниже убрать (закомментить), то будет играть
                // с уменьшением количества ставок, как было изначально
                new_array = new_array_hi_lo_spins(number_of_spins);

                step_bet++;

                step_balance_array[step_bet - 1] = balance; // добавление баланса для эффекта понижения

                game_data = play_spins( new_array,
                                        game_bets,
                                        step_bet,
                                        spins,
                                        start_balance,
                                        profit_balance,
                                        number_of_spins,
                                        step_balance_array);

                if (game_data == false) { return false; } // такой вариант, если случилась хрень и нужно выйти из игры

                break spinoprofit;
            }
            else {
                iimDisplay('Добавка! :-)');
                wait(2);
                step_bet = 1;
                new_array = new_array_hi_lo_spins(number_of_spins);
                step_balance_array.length = 0; // очистка массива шагов баланса

                game_data = play_spins( new_array,
                                        game_bets,
                                        step_bet,
                                        spins,
                                        start_balance,
                                        profit_balance,
                                        number_of_spins,
                                        step_balance_array);

                if (game_data == false) { return false; } // такой вариант, если случилась хрень и нужно выйти из игры

                return game_data;
            }
        }
    }
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
        wait(3);
        // iimPlayCode('TAG POS=1 TYPE=A ATTR=TXT:Got<SP>it!'); // нажимать на Got It (а надо ли?)
    } else {
       iimPlayCode('REFRESH');
        wait(3);
    }

    var balance = parseFloat(getBalance());
    var koefic = 0.07;          // коэффициент умножения по принципу мартингейл 4
    var max_step = 7;           // максимальное количество шагов игры (а дальше уже перезапуск, если не было слива)
    var start_bet = 1          // стартовая ставка (задаётся в сатошах, а не биткоинах)
    var number_of_spins = 129    // количество спинов, после которых будет перезагрузка/повышение ставок
    var game_bets = new_array_bets(start_bet, koefic, max_step);         // массив ставок
    var one_game_profit = satosh(start_bet * 9)   // выигрыш до которого будет играть (раз в час), задаётся в биткоинах

    var spins = {};             // для учёта всех спинов (для лога) (и на каком шаге выиграло)
    var step_balance_array = [];// массив для учёта баланса, чтобы делать понижение ставки
    step_balance_array[1] = balance; // баланс для первой ставки

    // переходим на вкладку игры
    window.document.querySelector(".double_your_btc_link").click();
    wait(3);
    window.scrollBy(0,980);

    // стартовые значения
    var start_balance = balance;                    // баланс на начала игры
    spins['all'] = 0;                               // сколько спинов за игру всего сыграно
    spins['hit'] = 0;                               // сколько выигрышных спинов случилось
    spins['value'] = 0;                             // объём ставок за игру
    var step_bet = 1;                               // номер шага ставки
    var profit_balance = balance + one_game_profit; // баланс до которого играть
    var payout_multiplayer = 2;                   // соотношение выигрыша/проигрыша (по умолчанию 2)

    //double_your_btc_payout_multiplier
    window.document.querySelector('input[type="text"][id="double_your_btc_payout_multiplier"]').value = String(payout_multiplayer);

    var array_hi_lo_spins = new_array_hi_lo_spins(number_of_spins);  // массив hi lo вариантов

    // основная игра
    game_data = play_spins( array_hi_lo_spins,
                            game_bets,
                            step_bet,
                            spins,
                            start_balance,
                            profit_balance,
                            number_of_spins,
                            step_balance_array);

    if (game_data == false) { return false; } // такой вариант, если случилась хрень и нужно выйти из игры
}
