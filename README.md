<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

Readme ToDo:
- Add images.
- Update the commands to set channel and follow regions.
- Update the contributing guide.
- Update the Roadmap.
- Add an open source licence (to make it seem like you know what you're doing?)

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/github_username/repo_name">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">League of Legends Esports Prediction Discord Bot</h3>

  <p align="center">
    Predict League matches, climb the leaderboard, and prove you're the ultimate LoL esports oracle!
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Prerequisites</a></li>
        <li><a href="#configuration">Installation</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

Find an image...

[![Product Name Screen Shot][product-screenshot]](https://example.com)

This Discord bot brings the excitement of League of Legends esports straight to your server! Choose your favorite regions or tournaments, and the bot will automatically post prediction polls for upcoming matches. Track your performance with detailed personal stats from previous votes, and compete with friends (or rivals) on dynamic leaderboards—sorted by region or tournament. Whether you're a casual fan or a hardcore LoL analyst, this bot lets you test your prediction skills and climb to the top!

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To host the discord bot in your own server, please following the steps for installation and configuration:

### Configuration

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

## Usage

To set up the bot in your server to run in a certain channel and track your favorite regions run the following commands:


<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Follow the same steps to install and setup the bot in your own server.
4. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the Branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- ROADMAP -->
## Roadmap

- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3
    - [ ] Nested Feature

See the [open issues](https://github.com/github_username/repo_name/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/github_username/repo_name.svg?style=for-the-badge
[contributors-url]: https://github.com/ephiiros/leonard/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/github_username/repo_name.svg?style=for-the-badge
[forks-url]: https://github.com/ephiiros/leonard/network/members
[stars-shield]: https://img.shields.io/github/stars/github_username/repo_name.svg?style=for-the-badge
[stars-url]: https://github.com/ephiiros/leonard/stargazers
[issues-shield]: https://img.shields.io/github/issues/github_username/repo_name.svg?style=for-the-badge
[issues-url]: https://github.com/ephiiros/leonard/issues
[license-shield]: https://img.shields.io/github/license/github_username/repo_name.svg?style=for-the-badge
[license-url]: https://github.com/github_username/repo_name/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png
