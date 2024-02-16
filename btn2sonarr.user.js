// ==UserScript==
// @name         BTN 2 Sonarr
// @version      1.6
// @description  Add shows directly to sonarr via the BTN tv show pages and V3 api.
// @author       Prism16
// @match        https://broadcasthe.net/series.php?id=*
// @match        https://broadcasthe.net/user.php?action=edit*
// @downloadURL  https://github.com/PrismSixt33n/btn2sonarr/raw/main/btn2sonarr.user.js
// @updateURL    https://github.com/PrismSixt33n/btn2sonarr/raw/main/btn2sonarr.user.js
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
    window.sonarrseasons = GM_getValue('Seasons','');
    window.useextendedpanel = GM_getValue('Extended','')
    window.sonarrpanelocation = GM_getValue('panelLocation','')

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

let seasonsLabel = document.createElement('label');
seasonsLabel.innerHTML = 'Seasons To Monitor';
seasonsLabel.style.fontWeight = 'bold';
seasonsLabel.style.marginLeft = '30px';
sonarrSettings.appendChild(seasonsLabel);

let seasonsSelect = document.createElement('select');
seasonsSelect.style.marginLeft = '10px';
let options = ['NONE', 'ALL', 'LATEST'];
for (let i = 0; i < options.length; i++) {
    let option = document.createElement('option');
    option.value = options[i];
    option.text = options[i];
    seasonsSelect.appendChild(option);
}
seasonsSelect.value = GM_getValue('Seasons', '');
seasonsSelect.addEventListener('change', function() {
    GM_setValue('Seasons', this.value);
    window.sonarrseasons = this.value;
    console.log("Saved selection: " + this.value);
});

    sonarrSettings.appendChild(seasonsSelect);
    sonarrSettings.appendChild(document.createElement('br'));
    sonarrSettings.appendChild(confirmButton);
    sonarrSettings.appendChild(document.createElement('br'));

let extendedLabel = document.createElement('label');
extendedLabel.innerHTML = 'Use Extended TV Show Panel';
extendedLabel.style.fontWeight = 'bold';
sonarrSettings.appendChild(extendedLabel);

let extendedInput = document.createElement('input');
extendedInput.type = 'checkbox';
extendedInput.style.marginLeft = '10px';
extendedInput.checked = GM_getValue('Extended', false);
extendedInput.addEventListener('change', function() {
    GM_setValue('Extended', this.checked);
    window.useextendedpanel = this.checked;
    console.log("Saved selection: " + this.checked);
    panelLocationSelect.style.display = this.checked ? 'inline' : 'none';
});

sonarrSettings.appendChild(extendedInput);

let panelLocationSelect = document.createElement('select');
panelLocationSelect.style.marginLeft = '10px';
panelLocationSelect.style.display = extendedInput.checked ? 'inline' : 'none';
let panelOptions = ['Above Table', 'Below Table'];
for (let i = 0; i < panelOptions.length; i++) {
    let option = document.createElement('option');
    option.value = panelOptions[i];
    option.text = panelOptions[i];
    panelLocationSelect.appendChild(option);
}
panelLocationSelect.value = GM_getValue('panelLocation', '');
panelLocationSelect.addEventListener('change', function() {
    GM_setValue('panelLocation', this.value);
    window.sonarrpanelocation = this.value;
    console.log("Saved selection: " + this.value);
});

sonarrSettings.appendChild(panelLocationSelect);

sonarrSettings.appendChild(extendedInput);
sonarrSettings.appendChild(document.createElement('br'));
sonarrSettings.appendChild(document.createElement('br'));
sonarrSettings.appendChild(confirmButton);
sonarrSettings.appendChild(document.createElement('br'));

    window.sonarrApi = GM_getValue('Sonarr API Key', '');
    window.sonarrUrl = GM_getValue('Sonarr URL', '');
    window.sonarrpath = GM_getValue('Sonarr Root Path', '');
    window.sonarrprofileid = GM_getValue('Profile ID', '');
    window.sonarrlanguageid = GM_getValue('Language ID', '');
    window.sonarrsearch = GM_getValue('Search', false);
    window.sonarrseasons = GM_getValue('Seasons', '');
    window.useextendedpanel = GM_getValue('Extended','')
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
                console.log(output);
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
                console.log(output);
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
                                linkbox.appendChild(aElement);
                            } else if (window.useextendedpanel === false) {
                                aElement.textContent = '[Add to Sonarr]';
                                aElement.style.color = "#afe4ee";
                                aElement.style.fontWeight = "bold";
                                aElement.onclick = function() {
                                    addToSonarr(result);
                                    return false;
                                };
                                linkbox.appendChild(aElement);
                            } else {
    createSonarrPanel();
}
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

var confirmButton;

function createSonarrPanel(result) {
    var settings = ['Path', 'Profile', 'Monitor'];
    var torrentTables = document.querySelectorAll(".torrent_table#discog_table");
    var lastTorrentTable = torrentTables[torrentTables.length - 1];

    var boxDiv = document.createElement('div');
    boxDiv.className = 'box';
    var headDiv = document.createElement('div');
    headDiv.className = 'head';
    headDiv.textContent = 'Add To Sonarr';
    headDiv.style.fontWeight = 'bold';
    var sonarrPanelDiv = document.createElement('div');
    sonarrPanelDiv.id = 'SonarrPanel';
    sonarrPanelDiv.style.display = 'flex';
    sonarrPanelDiv.style.justifyContent = 'space-between';
    sonarrPanelDiv.style.flexWrap = 'wrap';

    settings.forEach(function(setting, index) {
        var settingDiv = document.createElement('div');
        settingDiv.style.width = '30%';
        settingDiv.style.display = 'flex';
        settingDiv.style.flexDirection = 'column';
        settingDiv.style.alignItems = 'center';
        settingDiv.style.margin = '10px 0';
        var select = document.createElement('select');
        select.id = setting;
        settingDiv.appendChild(select);
        sonarrPanelDiv.appendChild(settingDiv);
    });

    confirmButton = document.createElement('button');
    confirmButton.textContent = 'Add';
    confirmButton.style.height = '30px';
    confirmButton.style.alignSelf = 'flex-end';
    confirmButton.style.marginTop = '0px';
    confirmButton.style.display = 'none';
    confirmButton.addEventListener('click', AddExtendedToSonarr);

    sonarrPanelDiv.appendChild(confirmButton);

    boxDiv.appendChild(headDiv);
    boxDiv.appendChild(sonarrPanelDiv);

    if (window.sonarrpanelocation === 'Above Table') {
        torrentTables[0].parentNode.insertBefore(boxDiv, torrentTables[0]);
    } else {
        lastTorrentTable.parentNode.insertBefore(boxDiv, lastTorrentTable.nextSibling);
    }

    rootProfileSpanelChoice();
    panelProfileIdChoice();
    seasonPanelChoice();

    document.getElementById('Path').addEventListener('change', checkSelections);
    document.getElementById('Profile').addEventListener('change', checkSelections);
    document.getElementById('Monitor').addEventListener('change', checkSelections);
}

function checkSelections() {
    var path = document.getElementById('Path').value;
    var profile = document.getElementById('Profile').value;
    var monitor = document.getElementById('Monitor').value;

    if (path && profile && monitor) {
        confirmButton.style.display = 'block';
    }
}

let extendedroot;

function rootProfileSpanelChoice() {
    let sonarrrootpathsUrl = `${window.sonarrUrl}/api/v3/rootfolder`;
    GM_xmlhttpRequest({
        method: "GET",
        url: sonarrrootpathsUrl,
        headers: {
            "Content-Type": "application/json",
            "X-Api-Key": window.sonarrApi
        },
        onload: function(response) {
            let responseData = JSON.parse(response.responseText);
            let select = document.getElementById('Path');

            if (select.options.length > 1) {
                return;
            }

            select.innerHTML = '';

            let placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.text = 'Root Path :';
            placeholder.disabled = true;
            placeholder.selected = true;
            select.appendChild(placeholder);

            responseData.forEach(function(item) {
                let option = document.createElement('option');
                option.value = item.path;
                option.text = item.path;
                select.appendChild(option);
            });

            select.addEventListener('change', function() {
                extendedroot = this.value;
            });
        }
    });
}


let extendedprofile;

function panelProfileIdChoice() {
    let sonarrProfilesUrl = `${window.sonarrUrl}/api/v3/qualityprofile?apikey=${window.sonarrApi}`;
    GM_xmlhttpRequest({
        method: "GET",
        url: sonarrProfilesUrl,
        headers: {
            "Content-Type": "application/json"
        },
        onload: function(response) {
            let responseData = JSON.parse(response.responseText);
            let select = document.getElementById('Profile');

            if (select.options.length > 1) {
                return;
            }

            select.innerHTML = '';

            let placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.text = 'Profile :';
            placeholder.disabled = true;
            placeholder.selected = true;
            select.appendChild(placeholder);

            responseData.forEach(function(item) {
                let option = document.createElement('option');
                option.value = item.id;
                option.text = item.name;
                select.appendChild(option);
            });

            select.addEventListener('change', function() {
                extendedprofile = this.value;
            });
        }
    });
}

var extendedSeasonChoice;

function seasonPanelChoice() {
    var select = document.getElementById('Monitor');

    if (select.options.length > 0) {
        return;
    }

    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.text = 'Seasons :';
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    var options = ["NONE", "ALL", "LATEST"];

    for (var i = 0; i < options.length; i++) {
        var option = document.createElement('option');
        option.value = options[i];
        option.text = options[i];
        select.appendChild(option);
    }

    select.addEventListener('change', function() {
        if (this.value !== '') {
            extendedSeasonChoice = this.value;
            placeholder.disabled = false;
            placeholder.selected = false;
            this.options[this.selectedIndex].selected = true;
        }
    });
}

function AddExtendedToSonarr(result) {
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
    let jsonResponse = JSON.parse(response.responseText);
    window.sonarrResponse = jsonResponse;

    let fullPath = extendedroot + '/' + window.sonarrResponse[0].title;

    let seriesData = {
        title: window.sonarrResponse[0].title,
        seasons: window.sonarrResponse[0].seasons,
        path: fullPath,
        qualityProfileId: extendedprofile,
        languageProfileId: window.sonarrlanguageid,
        images: window.sonarrResponse[0].images,
        tvdbId: window.sonarrResponse[0].tvdbId,
        titleSlug: window.sonarrResponse[0].titleSlug,
        monitored: true,
        seasonFolder: true,
        addOptions: {
            ignoreEpisodesWithFiles: false,
            ignoreEpisodesWithoutFiles: false,
            searchForMissingEpisodes: window.sonarrsearch
        }
    };

                            if (extendedSeasonChoice === "NONE") {
                                for (let i = 0; i < seriesData.seasons.length; i++) {
                                    seriesData.seasons[i].monitored = false;
                                }
                            } else if (extendedSeasonChoice === "ALL") {
                                for (let i = 0; i < seriesData.seasons.length; i++) {
                                    seriesData.seasons[i].monitored = true;
                                }
                            } else if (extendedSeasonChoice === "LATEST") {
                                for (let i = 0; i < seriesData.seasons.length; i++) {
                                    seriesData.seasons[i].monitored = false;
                                }
                                if (seriesData.seasons.length > 0) {
                                    seriesData.seasons[seriesData.seasons.length - 1].monitored = true;
                                }
                            }

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
                                    if (responseData.title === window.sonarrResponse[0].title) {
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
                                            text: `Failed to add ${window.sonarrResponse[0].title}. Possibly Already Added..`,
                                            title: 'BTN 2 Sonarr',
                                            timeout: 2500
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });
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
        seasonFolder: true,
        addOptions: {
            ignoreEpisodesWithFiles: false,
            ignoreEpisodesWithoutFiles: false,
            searchForMissingEpisodes: window.sonarrsearch
        }
    };
if (window.sonarrseasons === "NONE") {
    for (let i = 0; i < seriesData.seasons.length; i++) {
        seriesData.seasons[i].monitored = false;
    }
} else if (window.sonarrseasons === "ALL") {
    for (let i = 0; i < seriesData.seasons.length; i++) {
        seriesData.seasons[i].monitored = true;
    }
} else if (window.sonarrseasons === "LATEST") {
    for (let i = 0; i < seriesData.seasons.length; i++) {
        seriesData.seasons[i].monitored = false;
    }
    if (seriesData.seasons.length > 0) {
        seriesData.seasons[seriesData.seasons.length - 1].monitored = true;
    }
}
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