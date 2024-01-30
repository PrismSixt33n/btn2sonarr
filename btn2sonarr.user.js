// ==UserScript==
// @name         BTN 2 Sonarr
// @version      1.0
// @description  Add shows directly to sonarr via the BTN tv show pages and V3 api.
// @author       Prism16
// @match        https://broadcasthe.net/series.php?id=*
// @match        https://broadcasthe.net/user.php?action=edit*
// @icon         https://broadcasthe.net/favicon.ico
// @require      https://cdn.jsdelivr.net/gh/sizzlemctwizzle/GM_config@43fd0fe4de1166f343883511e53546e87840aeaf/gm_config.js
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @grant        GM.xmlHttpRequest
// @grant        GM.notification
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    window.sonarrApi = GM_getValue('Sonarr API Key', '');
    window.sonarrUrl = GM_getValue('Sonarr URL', '');
    window.sonarrpath = GM_getValue('Sonarr Root Path', '');
    window.sonarrprofileid = GM_getValue('Profile ID', '');
    window.sonarrlanguageid = GM_getValue('Language ID', '');

    function settingsPanel() {
    let panel = document.createElement('div');
    panel.style.display = 'panel';
    let box = document.createElement('div');
    box.className = 'box';
    let headDiv = document.createElement('div');
    headDiv.className = 'head';
    headDiv.innerHTML = '<b>BTN 2 SONARR SETTINGS</b>';
    headDiv.style.textAlign = 'center';
    let sonarrSettings = document.createElement('div');
    sonarrSettings.id = 'sonarrSettings';
    sonarrSettings.className = 'scroll';

    let labels = ['Sonarr API Key', 'Sonarr URL', 'Sonarr Root Path', 'Profile ID', 'Language ID'];
    let placeholders = ['API Key Goes Here', 'https://blah.blah/sonarr', '/home/blah/blah', '#', '#'];

    for (let i = 0; i < 5; i++) {
        let label = document.createElement('label');
        label.innerHTML = labels[i];
        label.style.fontWeight = 'bold';
        sonarrSettings.appendChild(label);
        let input = document.createElement('input');
        input.type = 'text';
        input.placeholder = placeholders[i];
        input.style.marginLeft = '10px';

        if (i < 3) {
            input.style.width = '300px';
        }
        if (i >= 3) {
            input.style.width = '50px';
        }

        input.value = GM_getValue(labels[i], '');

        sonarrSettings.appendChild(input);
        sonarrSettings.appendChild(document.createElement('br'));
        sonarrSettings.appendChild(document.createElement('br'));
    }

    let confirmButton = document.createElement('button');
    confirmButton.innerHTML = 'Confirm';
    confirmButton.addEventListener('click', function() {

        let inputs = sonarrSettings.getElementsByTagName('input');
        for (let i = 0; i < inputs.length; i++) {
            GM_setValue(labels[i], inputs[i].value);
        }

        GM.notification({
            text: 'The values have been saved successfully!',
            title: 'Settings Saved',
            timeout: 4000
        });
    });

    sonarrSettings.appendChild(confirmButton);

    box.appendChild(headDiv);
    box.appendChild(sonarrSettings);
    panel.appendChild(box);
    let slider = document.querySelector('#slider');
    let ulNavigation = document.querySelector('#slider ul.navigation');
    slider.insertBefore(panel, ulNavigation);

    window.sonarrApi = GM_getValue('Sonarr API Key', '');
    window.sonarrUrl = GM_getValue('Sonarr URL', '');
    window.sonarrpath = GM_getValue('Sonarr Root Path', '');
    window.sonarrprofileid = GM_getValue('Profile ID', '');
    window.sonarrlanguageid = GM_getValue('Language ID', '');
}

    function searchTVDBUrl() {
        let aElements = document.getElementsByTagName('a');
        for (let i = 0; i < aElements.length; i++) {
            let aElement = aElements[i];
            if (aElement.href.includes('thetvdb.com')) {
                return aElement.href;
            }
        }
    }

    function getTVDBIdAndPassToSonarr() {
        let tvdbUrl = searchTVDBUrl();
        if (tvdbUrl) {
            GM_xmlhttpRequest({
                method: "GET",
                url: tvdbUrl,
                onload: function(response) {
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(response.responseText, "text/html");
                    let spanElement = doc.querySelector("#series_basic_info > ul > li:nth-child(1) > span");
                    if (spanElement) {
                        let tvdbId = spanElement.textContent;
                        let sonarrSeriesLookupUrl = `${window.sonarrUrl}/api/v3/series/lookup?term=tvdb:${tvdbId}`;
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: sonarrSeriesLookupUrl,
                            headers: {
                                "Content-Type": "application/json",
                                "X-Api-Key": window.sonarrApi
                            },
                            onload: function(response) {
                                let result = JSON.parse(response.responseText);
                                let linkbox = document.querySelector('#content > div.thin > div.linkbox');
                                let aElement = document.createElement('a');
                                aElement.href = '#';
                                if (result[0] && result[0].path) {
                                    aElement.textContent = '[View In Sonarr]';
                                    aElement.style.color = "#b1fcb1";
                                    aElement.style.fontWeight = "bold";
                                    let sonarrSeriesUrl = `${window.sonarrUrl}/series/${result[0].titleSlug}`;
                                    aElement.href = sonarrSeriesUrl;
                                    aElement.target = '_blank';
                                } else {
                                    aElement.textContent = '[Add to Sonarr]';
                                    aElement.style.color = "#afe4ee";
                                    aElement.style.fontWeight = "bold";
                                    aElement.onclick = function() {
                                        addToSonarr(result);
                                        return false;
                                    };
                                }

                                linkbox.appendChild(aElement);
                            }
                        });
                    } else {
                        console.log('No span element found for the specified selector');
                    }
                }
            });
        } else {
            console.log('No TVDB URL found on this page');
        }
    }

    function addToSonarr(result) {
    let fullPath = window.sonarrpath + '/' + result[0].title;
    let seriesData = {
        title: result[0].title,
        seasons: result[0].seasons,
        path: fullPath,
        qualityProfileId: window.sonarrprofileid,
        languageProfileId: window.sonarrlanguageid,
        images: result[0].images,
        tvdbId: result[0].tvdbId,
        titleSlug: result[0].titleSlug,
        monitored: true,
        addOptions: {
            ignoreEpisodesWithFiles: false,
            ignoreEpisodesWithoutFiles: false,
            searchForMissingEpisodes: true
        }
    };
    let sonarrAddSeriesUrl = `${window.sonarrUrl}/api/v3/series/`;
    GM_xmlhttpRequest({
        method: "POST",
        url: sonarrAddSeriesUrl,
        data: JSON.stringify(seriesData),
        headers: {
            "Content-Type": "application/json",
            "X-Api-Key": window.sonarrApi
        },
        onload: function(response) {
            let responseData = JSON.parse(response.responseText);
            if (responseData.title === result[0].title) {
                GM.notification({
                    text: `Please Click This Notification To Refresh The Page..`,
                    title: 'BTN2Sonarr - Added',
                    timeout: 7500,
                    onclick: function() {
                        location.reload();
            }
        });
    } else {
                GM.notification({
                    text: `Failed to add ${result[0].title}. Possibly Already Added..`,
                    title: 'BTN 2 Sonarr',
                    timeout: 2500
                });
            }
        }
    });
}

var url = window.location.href;

if (url.startsWith("https://broadcasthe.net/user.php?action=edit")) {
    settingsPanel();
} else if (url.startsWith("https://broadcasthe.net/series.php?id=")) {
    getTVDBIdAndPassToSonarr();
}
})();
