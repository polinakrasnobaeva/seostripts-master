var badHosts = ["yabs.yandex.ru", "news.yandex.ru", "rostov.propartner.ru", "market.yandex.ru", "rostov.pulscen.ru", "rostov.tiu.ru", "rostov.blizko.ru", "rostov-na-donu.unibo.ru", "rostov-na-donu.dmir.ru", "rostovnadonu.flagma.ru", "rostov-na-donu.aport.ru", "www.rostov-na-donu.build2last.ru", "ru.wikipedia.org", "rostov.neobroker.ru", "www.rosrealt.ru", "rostovnadonu.irr.ru", "rostov.n1.ru", "rostov-na-donu.naydidom.com", "dom.mirkvartir.ru", "www.realtymag.ru", "www.grinas.ru", "zemlidona.ru", "www.avito.ru", "allorostov.ru", "www.yell.ru", "dic.academic.ru", "rostov.printura.ru", "rostov.4geo.ru", "rnd.spravker.ru"];


//

var analyzerCompetitors = {
    buttonView: function () {
        var result = '';
        chrome.storage.local.get('seoChanger', function (result) {
            sC = result['seoChanger'];
            con(sC);
            if (sC.planirovkaSession) result = '<span>Сессия планировки запущена</span><button id="stopPS">Закончить сессию</button>';
            else
                result = '<button id="startPS">Начать сессию</button>'
        });
        con(result);
        return result;
    },

    save: function (searchResults) {
        $(searchResults).each(function() {
            con(this);
        })
    }
};



analyzerCompetitors.initialize = function () {
    chrome.storage.local.get('seoChanger', function (result) {
        sC = result['seoChanger'];

        sC.planirovkaSession = {};

        chrome.storage.local.set({
            'seoChanger': sC
        });
    });
}


analyzerCompetitors.stopped = function () {
    chrome.storage.local.get('seoChanger', function (result) {
        sC = result['seoChanger'];

        delete sC.planirovkaSession;

        chrome.storage.local.set({
            'seoChanger': sC
        });
    });
}


function con(data) {
    console.log(data);
}


insertStript();

if ($("div").is("#mk")) {} else {
    planirovka(badHosts, analyzerCompetitors);
}


function planirovka(badHosts, analyzerCompetitors) {
    console.log(analyzerCompetitors);
    var searchResults = determineIssue();

    analyzerCompetitors.save(searchResults);

    deleteRigthColumn();

    $('.serp-list').eq(1).append('<div id="mk" style="width:500px;">' + analyzerCompetitors.buttonView() + '<div class="bold-words-div">' + determineBoldWords(searchResults) + '</div>' + '<div class="issue">' + determineMainAndInternalPage(searchResults, badHosts) + '</div>' + '</div>');
}

function determineIssue() {
    //    var tempIssue = [];
    //    var issue = [];
    //    issueClassNameLength = 24;
    //    blocks = document.getElementsByClassName('serp-block serp-block');
    //    for (i = 0; i < blocks.length; i++) {
    //        if (blocks[i].className.length === issueClassNameLength) {
    //            tempIssue.push(document.getElementsByClassName(blocks[i].className));
    //        }
    //    }
    //    for (i = 0; i < tempIssue.length; i++) {
    //        issue = myConcat(issue, tempIssue[i][0].getElementsByClassName('serp-item'));
    //    }
    //    return issue;
    return $("div[data-bem*='serp-item\":{}']");
}

function deleteRigthColumn() {
    try {
        $('.serp-list[role="complementary"]').empty();
    } catch (e) {
        con('Ошибка при очистке правого сектора - ' + e);
    }
}

function determineBoldWords(issue) {
//    var t = document.getElementsByTagName('title');
//    t = t[0].innerHTML.toLowerCase();
//    t = t.substring(0, t.indexOf('яндекс') - 3);
    var searchQuery = $('input[type="search"][aria-label="Запрос"]').val();
    var result = '';
    badWords = searchQuery.split(' ');
    badWords.push($('.region-change__link').html());
    badWords.push('ростов', 'ростове', 'ростова', 'дону', 'на', '... ');


    for (var j = 0; j < issue.length; j++) {

        var h2 = issue[j].getElementsByTagName('h2')[0];
        var b = h2.getElementsByTagName('b');
        for (i = 0; i < b.length - 1; i++) {
            var s = b[i].innerHTML.toLowerCase().replace('<wbr>', '');
            //			if (s.length >7) {
            //				if ( isBadWithOtbrosSym(s,badWords, 4)) continue;
            //			} else {
            if (isBadWithOtbrosSym(s, badWords, 2)) continue;
            //			}
            badWords.push(s);
            result += s + ", ";
        }

        try {
            //console.log(issue);
            var snippet = issue[j].getElementsByClassName('serp-item__text')[0];
            //console.log(snippet);
            var b = snippet.getElementsByTagName('b');
            for (i = 0; i < b.length - 1; i++) {
                var s = b[i].innerHTML.toLowerCase().replace('<wbr>', '');
                //			if (s.length >7) {
                //				if ( isBadWithOtbrosSym(s,badWords, 4)) continue;
                //			} else {
                if (isBadWithOtbrosSym(s, badWords, 2)) continue;
                //			}
                badWords.push(s);
                result += s + ", ";
            }

        } catch (e) {
            console.log('Ошибка определителя подсвеченных слов в ' + j + ' сниппете - ' + e);

        }


    }
    return '<h3><em>Подсвеченные слова:</em></h3><p class="bold-words">' + result.substring(0, result.length - 2) + '</p>';
}

function determineMainAndInternalPage(issue, badHosts) {
    p = '<ol style="padding-left: 15px;">';
    p1 = '';
    mainPageCount = 0;
    internalPageCount = 0;
    catalogPageCount = 0;
    //issue = determineIssue();
    var isBadPage = false;
    page = '';

    for (i = 0; i < issue.length; i++) {
        urls = issue[i].getElementsByClassName('serp-item__title-link');
        //console.log(issue[i]);
        h2 = issue[i].getElementsByTagName('h2')[0];
        try {
            url = urls[0].href;

        } catch (e) {
            console.log('Ошибка ' + e);
            continue;
        }

        isBadPage = isBad(urls[0].hostname, badHosts) ? true : false;
        catalogPageCount = isBadPage ? catalogPageCount + 1 : catalogPageCount;
        humanUrl = url.replace(/http[s]*:\/\/(www.)*/g, '');

        page = isMain(humanUrl) ? 'Гл' : 'Вн';
        page = isBadPage ? 'Каталог' : page;
        if (urls[0].hostname === "ru.wikipedia.org") page = 'Википедия'
        if (!isBadPage) {
            if (page === 'Гл') {
                mainPageCount++;
            } else {
                internalPageCount++;
            }
        } else {

        }
        humanUrl = (humanUrl.length > 50) ? humanUrl.substring(0, 50) + "..." : humanUrl;
        humanUrl = (humanUrl.lastIndexOf("/") === humanUrl.length - 1) ? humanUrl.substring(0, url.length - 1) : humanUrl;

        //li
        p += '<li ';
        p += isBadPage ? 'class="bad-li-ol li-ol"' : 'class="li-ol"';
        p += '>';

        p += '<h3>' + h2.innerText + '</h3>';
        //checkbox
        p += '<input type="checkbox" class="checkbox-ol"';
        p += !isBadPage ? 'checked' : '';
        p += '>'
        p += page + ' - ' + '<a class="a-ol" target="_blank" href="' + url + '">';


        if (humanUrl.indexOf('/') > -1) {
            p += punycode.toUnicode(humanUrl.substring(0, humanUrl.indexOf('/'))) + humanUrl.substring(humanUrl.indexOf('/'));
        } else {
            p += punycode.toUnicode(humanUrl);
        }



        p += '</a></li>'
    }
    p += '</ol>';
    p1 += '<br /><span>Каталогов: ' + catalogPageCount + '</span><br />';
    p1 += '<span>Главная/Внутренная: ' + mainPageCount + '/' + internalPageCount + '</span>';
    //		p +=  '<br />';
    p += '<button type="button" id="btnOpenIssueLinks" onclick="openTabs();">Открыть отмеченные страницы</button>';

    p1 += p;
    return p1;
}

function isMain(url) {
    if (url.indexOf('/') > 0) {
        if (url.indexOf('/') === url.length - 1) {
            return true;
        }
    }
    return false;
}

function insertStript() {
    var loadedJS = document.createElement('script');
    loadedJS.text = "function openTabs() {  	var a = document.getElementsByClassName('a-ol'); 	var ck = document.getElementsByClassName('checkbox-ol'); 	for (j=0; j < ck.length; j++) { 		if (ck[j].checked===true) { 			window.open(a[j] , '_blank'); 		} 	} }";

    loadedJS.type = "text/javascript";
    loadedJS.language = "javascript";
    var head = document.getElementsByTagName('head')[0];

    head.appendChild(loadedJS);
}

//function myConcat(main, additional) {
//    for (qqq = 0; qqq < additional.length; qqq++)
//        main.push(additional[qqq]);
//    return main;
//}

function isBadWithOtbrosSym(word, badWords, otbrosSym) {
    var needLength = word.length - otbrosSym;
    for (j = 0; j < badWords.length; j++) {
        if (word.toLowerCase().substring(0, needLength) === badWords[j].toLowerCase().substring(0, needLength)) { // || word===traslit(badWords[j]))
            return true;
        }
    }
    return false;
}

function isBad(word, badWords) {
    for (j = 0; j < badWords.length; j++) {
        if (word.toLowerCase() === badWords[j].toLowerCase()) {
            return true;
        }
    }
    return false;
}









//$(document).ready(function () {
//    $('#startPS').click(function () {
//        analyzerCompetitors.initialize();
//    });
//
//    $('#stopPS').click(function () {
//        analyzerCompetitors.stopped();
//    });
//});
