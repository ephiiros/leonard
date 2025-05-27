<div align="center">
  <a href="https://github.com/ephiiros/leonard">
    <img src="images/leonard.jpg" alt="Logo" width="80" height="80">
  </a>
  <br>

  <img src="https://img.shields.io/github/contributors/ephiiros/leonard">
  <img src="https://img.shields.io/github/stars/ephiiros/leonard">
  <img src="https://img.shields.io/github/issues/ephiiros/leonard">

  <h3 align="center">League of Legends Esports Prediction Discord Bot</h3>

  <p align="center">
    Predict League matches, climb the leaderboard, and prove you're the ultimate LoL esports oracle!
  </p>
</div>


<!-- TABLE OF CONTENTS -->
# Table of Contents
- <a href="#getting-started">Getting Started</a>
  - <a href="#installation">Installation</a></li>

<!-- GETTING STARTED -->

## Getting Started
(OLD VERSION)

To host the discord bot in your own server, please following the steps for installation and configuration:

### Installation

You will need install two things to setup the bot correctly: The bot (this repo) and the database.

1. Clone the repo
   ```sh
   git clone https://github.com/ephiiros/leonard
   ```
2. Install Pocketbase Database
   Download the latest version from here for your cpu architecture. https://github.com/pocketbase/pocketbase/releases
3. Unzip the database in the same discord bot git checkout directory. Give the directory the name db/ (<checkout_path>/leonard/db/)
4. Create a discord application. https://discord.com/developers/applications
   Login into the following page and create a new application. Give it a name, icon and description. Anything you feel like!
5. Go to bot and generate a new token, make sure to copy this somewhere for now. Go to the bottom are give the bot the following conditions: ...
6. Invite the discord bot to your discord server. Go to OAuth2, URL Generator, select bot and then click copy. Paste this url into your browser and add the bot to your server of choice.
7. Set up the database. In the db/ directory run the following:
   ```sh
   ./db/pocketbase serve
   ```
8. Click on the link that pops up and create a superuser account.
9. Set up the .env file with your specific information. In the checkout directory, make a file called .env and fill it with the following:

   ```sh
    DISCORD_TOKEN=<Your discord token I told you to copy earlier..>
    DISCORD_CLIENT_ID=<Your discord application ID (Found on the bot general page.)>

    DB_IP="<The DB IP given when you started up the DB.>" # e.g "http://127.0.0.1:8090"
    DB_USER="<Email of the superuser account.>"
    DB_PASSWORD="<Password of the superuser account>"
    VOTE_OFFSET="6" # Leave this for now.
   ```

10. Install the packages and run the bot:

```sh
 npm install
 npm run dev
```

You should see the bot appear online in discord. Note the bot exists like a running server, and needs to be run constantly to work. Also note the DB and bot are two difference processes and both need to be run at the same time.