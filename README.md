Now I know some of you use PTP to Radarr, well I always wondered if the functionality of the script could be implemented here at BTN. I tried for a long time to fork the actual codebase for PTP to Radarr to get it to work with BTN / TV Shows but I just could not get it to work.
After learning a few bits of JavaScript I decided I would try and implement it myself which I achieved in someway even if not exactly like PTP to Radarr as first intended.

It doesn't have all the functionality that PTP to Radarr has but its easy to setup and it works just fine for a basic user case. I'm no JavaScript pro, far from it so the code could be cleaner and more compressed no doubt but it's here and it works.

First on installing, visit your edit profile page here on BTN, you will see a new settings dialogue to enter the BTN 2 Sonarr settings which are pretty self explanatory.

As of v1.2 this now includes an option as to whether you want to "Search On Add" or not.

If you need help with the profile IDs enter your URL and API key, hit save then hit the helper buttons which will list your profile IDs for you to enter.

After adding all your Sonarr variables hit save and check the notification for confirmation they saved ok. Then take yourself off to a page for a TV show.
On loading the page, the script scrapes the TVDB URL then TVDB ID from the page, probes the Sonarr API using this to see if the show is present already.

If it is, it generates a link to Sonarr to the show and adds a clickable link to the linkbar above the TV show to take you straight to Sonarr to "View In Sonarr".

If the show isn't already in Sonarr, it will generate another link to "Add to Sonarr", this will use the response from the TV look up and your variables to make an API request to Sonarr and add the show to your server.

As it stands it adds all seasons as monitored but I do hope to offer this as an option in future updates.
