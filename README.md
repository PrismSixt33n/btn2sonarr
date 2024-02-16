![alt text](https://ptpimg.me/s9yms4.png)

Now I know some of you use PTP to Radarr, well I always wondered if the functionality of the script could be implemented at BTN. I tried for a long time to fork the actual codebase for PTP to Radarr to get it to work with BTN / TV Shows but I just could not get it to work.
After learning a few bits of JavaScript I decided I would try and implement it myself which I achieved in someway even if not exactly like PTP to Radarr as first intended.

* First on installing, visit your edit profile page on BTN, you will see a new settings dialogue to enter the BTN2Sonarr settings which are pretty self explanatory.

* v1.2 this now includes an option as to whether you want to "Search On Add" or not.
* v1.3 adds the choice of which seasons to monitor upon adding (None / All / Latest).
* v1.4 initial attempt at extended panel (broken)
* v1.5 working extended panel now added with season folders enabled by default too.

* If you need help with the profile IDs enter your URL and API key, hit save then hit the helper buttons which will list your profile IDs for you to enter.

After adding all your Sonarr variables hit save and check the notification for confirmation they saved ok. Then take yourself off to a page for a TV show.

On loading the page, the script scrapes the TVDB URL then TVDB ID from the page, probes the Sonarr API using this to see if the show is present already.
If it is present in sonarr then it generates a link to Sonarr to the show and adds a clickable link to the linkbar above the TV show to take you straight to Sonarr to "View In Sonarr"

If the show isn't already in Sonarr, the way this is disaplyed depends on the "Extended TV Panel" setting.
If the extended panel is DISABLED (default), it will generate another link to "Add to Sonarr", this will use the response from the TV look up and your variables to make an API request to Sonarr and add the show to your server.

If the extended panel is ENABLED then you won't see the link as described above, instead you will see a new panel below the torrent table with options to change the root path, download profile and season settings before sending the requst to Sonarr. Very useful if you run multiple root paths or quality profiles for example, 4k downloads for documentaries or a seperate fodler for kids content. Once all options are set on the drop downs, the add button will appear to add the show to sonarr with the desired settings.
