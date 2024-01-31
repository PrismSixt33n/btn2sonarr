// ==UserScript==
// @name         BTN 2 Sonarr
// @version      1.2
// @description  Add shows directly to sonarr via the BTN tv show pages and V3 api.
// @author       Prism16
// @downloadURL  https://github.com/PrismSixt33n/btn2sonarr/raw/main/btn2sonarr.user.js
// @updateURL    https://github.com/PrismSixt33n/btn2sonarr/raw/main/btn2sonarr.user.js
// @match        https://broadcasthe.net/series.php?id=*
// @match        https://broadcasthe.net/user.php?action=edit*
// @icon         https://broadcasthe.net/favicon.ico
// @require      https://cdn.jsdelivr.net/gh/sizzlemctwizzle/GM_config@43fd0fe4de1166f343883511e53546e87840aeaf/gm_config.js
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @grant        GM.xmlHttpRequest
// @grant        GM.notification
// @grant        GM_notification
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
    window.sonarrsearch = GM_getValue('Search', '');

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
            let questionMark = document.createElement('b');
            questionMark.innerHTML = ' - [Helper]';
            questionMark.style.cursor = 'pointer';
            sonarrSettings.appendChild(questionMark);

            if (i === 3) {
                questionMark.onclick = function() {
                    profileids();
                };
            } else if (i === 4) {
                questionMark.onclick = function() {
                    languageids();
                };
            }
        }

        input.value = GM_getValue(labels[i], '');

        sonarrSettings.appendChild(input);
        sonarrSettings.appendChild(document.createElement('br'));
        sonarrSettings.appendChild(document.createElement('br'));
    }

    let searchLabel = document.createElement('label');
    searchLabel.innerHTML = 'Search On Add';
    searchLabel.style.fontWeight = 'bold';
    sonarrSettings.appendChild(searchLabel);

    let searchInput = document.createElement('input');
    searchInput.type = 'checkbox';
    searchInput.style.marginLeft = '10px';
    searchInput.checked = GM_getValue('Search', false);
    searchInput.addEventListener('change', function() {
        GM_setValue('Search', this.checked);
    });

    sonarrSettings.appendChild(searchInput);
    sonarrSettings.appendChild(document.createElement('br'));
    sonarrSettings.appendChild(document.createElement('br'));

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

    let img = document.createElement('img');
    img.src = 'https://ptpimg.me/s9yms4.png';
    img.style.width = '140px';
    img.style.position = 'absolute';
    img.style.bottom = '0';
    img.style.right = '5%';

    sonarrSettings.appendChild(img);

    window.sonarrApi = GM_getValue('Sonarr API Key', '');
    window.sonarrUrl = GM_getValue('Sonarr URL', '');
    window.sonarrpath = GM_getValue('Sonarr Root Path', '');
    window.sonarrprofileid = GM_getValue('Profile ID', '');
    window.sonarrlanguageid = GM_getValue('Language ID', '');
    window.sonarrsearch = GM_getValue('Search', false);
}
function profileids() {
    let sonarrApi = GM_getValue('Sonarr API Key', '');
    let sonarrUrl = GM_getValue('Sonarr URL', '');

    if (!sonarrApi || !sonarrUrl) {
        GM_notification({
            text: 'ADD URL And API Key, Save and try again.',
            title: 'Missing Information',
            timeout: 4000
        });
    } else {
        let apiUrl = sonarrUrl + '/api/v3/qualityprofile?apikey=' + sonarrApi;
        console.log(apiUrl);

        let xhr = new XMLHttpRequest();
        xhr.open("GET", apiUrl, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let data = JSON.parse(xhr.responseText);
                let names = filterByName(data);
                let ids = filterById(data);
                let output = {};
                for (let i = 0; i < names.length; i++) {
                    let name = names[i];
                    let id = ids[i];
                    output[name.name] = id.id;
                }
                createModal(output);
            }
        }
        xhr.send();
    }
}

    function languageids() {
    let sonarrApi = GM_getValue('Sonarr API Key', '');
    let sonarrUrl = GM_getValue('Sonarr URL', '');

    if (!sonarrApi || !sonarrUrl) {
        GM_notification({
            text: 'ADD URL And API Key, Save and try again.',
            title: 'Missing Information',
            timeout: 4000
        });
    } else {
        let apiUrl = sonarrUrl + '/api/v3/languageprofile?apikey=' + sonarrApi;
        console.log(apiUrl);

        let xhr = new XMLHttpRequest();
        xhr.open("GET", apiUrl, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let data = JSON.parse(xhr.responseText);
                let names = filterByName(data);
                let ids = filterById(data);
                let output = {};
                for (let i = 0; i < names.length; i++) {
                    let name = names[i];
                    let id = ids[i];
                    output[name.name] = id.id;
                }
                createModal(output);
            }
        }
        xhr.send();
    }
}

    function filterByName(data) {
    let filtered = [];
    for (let i = 0; i < data.length; i++) {
        let element = data[i];
        if (element.hasOwnProperty("name")) {
            filtered.push(element);
        }
    }
    return filtered;
}

function filterById(data) {
    let filtered = [];
    for (let i = 0; i < data.length; i++) {
        let element = data[i];
        if (element.hasOwnProperty("id")) {
            filtered.push(element);
        }
    }
    return filtered;
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

    function createModal(obj) {
    let modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.zIndex = "1";
    modal.style.left = "0";
    modal.style.top = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.overflow = "auto";
    modal.style.backgroundColor = "rgba(0,0,0,0.4)";

    let modalContent = document.createElement("div");
    modalContent.style.backgroundColor = "#000";
    modalContent.style.color = "#fff";
    modalContent.style.margin = "15% auto";
    modalContent.style.padding = "0px";
    modalContent.style.border = "1px solid #888";
    modalContent.style.width = "80%";
    modalContent.style.maxWidth = "300px";
    modalContent.style.borderRadius = "5px";

    let closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.color = "white";
    closeButton.style.position = "absolute";
    closeButton.style.top = "0px";
    closeButton.style.right = "0px";
    closeButton.style.padding = "5px 10px";
    closeButton.onclick = function() {
        modal.style.display = "none";
    };
    modalContent.style.position = "relative";
    modalContent.appendChild(closeButton);

    let table = createTable(obj);
    table.style.textAlign = "left";

    modalContent.appendChild(table);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);
}

function createTable(obj) {
    let table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    let thead = document.createElement("thead");
    let tr = document.createElement("tr");

    let th1 = document.createElement("th");
    th1.textContent = "Name";
    tr.appendChild(th1);

    let th2 = document.createElement("th");
    th2.textContent = "ID";
    tr.appendChild(th2);

    thead.appendChild(tr);
    table.appendChild(thead);

    let tbody = document.createElement("tbody");
    for (let key in obj) {
        let tr = document.createElement("tr");

        let td1 = document.createElement("td");
        td1.textContent = key;
        tr.appendChild(td1);

        let td2 = document.createElement("td");
        td2.textContent = obj[key];
        tr.appendChild(td2);

        tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    return table;
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
            searchForMissingEpisodes: window.sonarrsearch
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
                GM_notification({
                    text: `Please Click This Notification To Refresh The Page..`,
                    title: 'BTN2Sonarr - Added',
                    timeout: 7500,
                    onclick: function() {
                        location.reload();
            }
        });
    } else {
                GM_notification({
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
