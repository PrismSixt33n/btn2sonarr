// ==UserScript==
// @name         BTN 2 Sonarr
// @version      1.0
// @description  Add shows directly to sonarr via the BTN tv show pages.
// @author       Prism16
// @match        https://broadcasthe.net/series.php?id=*
// @icon         https://broadcasthe.net/favicon.ico
// @require      https://cdn.jsdelivr.net/gh/sizzlemctwizzle/GM_config@43fd0fe4de1166f343883511e53546e87840aeaf/gm_config.js
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @grant        GM.xmlHttpRequest
// @grant        GM.notification
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
    //  ADD ALL SONARR VARIABLES HERE
    window.sonarrApi = '##########';
    window.sonarrUrl = 'https://######.#####/######';
    window.sonarrpath = '/####/#####/####/####/#####';
    window.sonarrprofileid = '#';
    window.sonarrlanguageid = '#';  // 1
    //  ADD ALL SONARR VARIABLES HERE

    function searchTVDBUrl() {
        let aElements = document.getElementsByTagName('a');
        for (let i = 0; i < aElements.length; i++) {
            let aElement = aElements[i];
            if (aElement.href.includes('thetvdb.com')) {
                return aElement.href;
            }
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
            console.log(response);
            let responseData = JSON.parse(response.responseText);
            if (responseData.title === result[0].title) {
                GM.notification({
                    text: `${result[0].title} has been added successfully..`,
                    title: 'BTN 2 Sonarr',
                    timeout: 5000
                });
            } else {
                GM.notification({
                    text: `Failed to add ${result[0].title}. Please try again.`,
                    title: 'BTN 2 Sonarr',
                    timeout: 2500
                });
            }
        }
    });
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
                        let sonarrSeriesLookupUrl = `${window.sonarrUrl}/api/series/lookup?term=tvdb:${tvdbId}`;
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: sonarrSeriesLookupUrl,
                            headers: {
                                "Content-Type": "application/json",
                                "X-Api-Key": window.sonarrApi
                            },
                            onload: function(response) {
                                let result = JSON.parse(response.responseText);
                                console.log(result);

                                let linkbox = document.querySelector('#content > div.thin > div.linkbox');
                                let aElement = document.createElement('a');

                                aElement.href = '#';
                              //  aElement.target = '_blank';
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
    getTVDBIdAndPassToSonarr();
})();
