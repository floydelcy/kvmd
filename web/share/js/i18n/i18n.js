function setCookie (name, value)
{
    var expdate = new Date();
    expdate.setTime(expdate.getTime() + 30 * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + value + "; expires=" + expdate.toGMTString() + "; path=/" + ";SameSite=Lax";
}

function getCookie(name)
{
    if (document.cookie.length > 0)
        {
            start = document.cookie.indexOf(name + "=")
            if (start != -1)
                {
                start = start + name.length + 1
                end = document.cookie.indexOf(";", start)
                if (end == -1) end = document.cookie.length
                return unescape(document.cookie.substring(start, end))
                }
        }
    return ""
}

function loadTranslationAndApply() {
    // 获取当前语言 从 cookie 或全局变量
    var currentLang = getCookie('userLanguage') || 'zh';
    var jsonUrl = "/share/i18n/i18n_" + currentLang + ".json";

    // 如果全局中已经有该语言的翻译数据，直接使用
    if (window.i18nResources && window.i18nResources[currentLang]) {
        applyTitles(window.i18nResources[currentLang]);
        return;
    }

    // 否则加载 JSON
    $.getJSON(jsonUrl, function(data) {
        if (!window.i18nResources) window.i18nResources = {};
        window.i18nResources[currentLang] = data;
        applyTitles(data);
    }).fail(function() {
        console.error("Failed to load i18n file for title translation:", jsonUrl);
    });
}

function applyTitles(translations) {
    // 遍历所有带有 data-i18n-title 属性的元素
    $("[data-i18n-title]").each(function() {
        var key = $(this).data("i18n-title");
        var translated = translations[key];
        if (translated && translated !== "") {
            $(this).attr("title", translated);
        } else {
            // 如果找不到翻译，保留原有的 title 属性 fallback
            console.warn("Missing translation for title key:", key);
        }
    });
}

var i18nLanguage = "zh";

$(document).ready(function() {
     if (getCookie('userLanguage')) {
        i18nLanguage = getCookie('userLanguage');
        if (i18nLanguage == "zh") {
            no = 0;
        }else if (i18nLanguage == "en") {
            no = 1;
        }
        $("#selectLanguage").each(function(){
            $(this).find("option").eq(no).prop("selected",true)
        });
    }

    $("[i18n]").i18n({
        defaultLang: i18nLanguage,
        filePath: "/share/i18n/",
        filePrefix: "i18n_",
        fileSuffix: "",
        forever: true,
        callback: function() {
            loadTranslationAndApply();
        }
    });

    $("#selectLanguage").change(function() {
        var selectOptionId = $(this).children("option:selected").attr("id");
        console.log(selectOptionId);
        $("[i18n]").i18n({
            defaultLang: selectOptionId,
            filePath: "/share/i18n/",
            filePrefix: "i18n_",
            fileSuffix: "",
            forever: true,
            callback: function() {
                loadTranslationAndApply();
            }
        });
        setCookie('userLanguage', selectOptionId)
    });


});