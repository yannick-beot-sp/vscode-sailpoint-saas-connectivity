<a id="readme-top"></a>

<!--  based on https://github.com/othneildrew/Best-README-Template -->

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/yannick-beot-sp/vscode-sailpoint-saas-connectivity">
    <img src="resources/saas-connectivity.png" alt="Logo" width="256" height="241">
  </a>

<h3 align="center">SailPoint SaaS Connectivity for Visual Studio Code</h3>

  <p align="center">
    Extension to easily manage SailPoint SaaS Connectivity
    <br />
    <br />
    <a href="#release-notes">View Release Notes</a>
    &middot;
    <a href="#usage">View Demo</a>
    &middot;
    <a href="https://github.com/yannick-beot-sp/vscode-sailpoint-saas-connectivity/issues/new?labels=bug&template=bug_report.md">Report Bug</a>
    &middot;
    <a href="https://github.com/yannick-beot-sp/vscode-sailpoint-saas-connectivity/issues/new?template=feature_request.md">Request Feature</a>
  </p>
</div>

<!-- PROJECT SHIELDS -->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![project_license][license-shield]][license-url]

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-this-extension">About this extension</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#release-notes">Release Notes</a></li>
    <li>
      <a href="#contributing">Contributing</a>
      <ul>
        <li><a href="#top-contributors">Top contributors</a></li>
      </ul>
    </li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

<!-- ABOUT THIS EXTENSION -->

## About this extension

> **This extension is not developed, maintained or supported by SailPoint.**
> **It is a community effort to help manage SaaS Connectivity from Visual Studio Code.**

<!--[![Product Name Screen Shot][product-screenshot]](https://example.com)-->

The SailPoint SaaS Connectivity extension makes it easy to:

- View, create, update (rename), delete, upload a zip or deploy local zip for a SaaS connector
- View, create, update (rename), delete, upload a zip or deploy local zip for a Customizer
- Link or unlink a customizer and a source
- View, stream logs from sources

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

### Installation

Go to the extension menu or press `Ctrl`+`Shift`+`X` and look for the extension "SailPoint SaaS Connectivity". Click on the button `Install`.

The VSIX can be installed from the extension menu. Press `Ctrl`+`Shift`+`X` and in the menu, click `Install from VSIX...`.

<!-- USAGE EXAMPLES -->

## Usage


<!-- ROADMAP -->

## Release Notes

### 0.0.5

- Support for customizers
- New command: copy ID of a connector, a source, or a customizer

### 0.0.4

- Deploy will also build the package

### 0.0.3

- Logging issue when logging object within the connector

### 0.0.2

- Downgrade VSCode requirement to support Cursor
- Fix confirmation message when uploading


### 0.0.1

Initial release

- List of tenants and folders linked to ISC Extension
- Create/Delete/Rename connectors
- Upload a zip or deploy local zip for a connector
- Start/stop streaming logs from an instance

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Top contributors:

<a href="https://github.com/yannick-beot-sp/vscode-sailpoint-saas-connectivity/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=yannick-beot-sp/vscode-sailpoint-saas-connectivity" alt="contrib.rocks image" />
</a>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/yannick-beot-sp/vscode-sailpoint-saas-connectivity.svg?style=for-the-badge
[contributors-url]: https://github.com/yannick-beot-sp/vscode-sailpoint-saas-connectivity/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/yannick-beot-sp/vscode-sailpoint-saas-connectivity.svg?style=for-the-badge
[forks-url]: https://github.com/yannick-beot-sp/vscode-sailpoint-saas-connectivity/network/members
[stars-shield]: https://img.shields.io/github/stars/yannick-beot-sp/vscode-sailpoint-saas-connectivity.svg?style=for-the-badge
[stars-url]: https://github.com/yannick-beot-sp/vscode-sailpoint-saas-connectivity/stargazers
[issues-shield]: https://img.shields.io/github/issues/yannick-beot-sp/vscode-sailpoint-saas-connectivity.svg?style=for-the-badge
[issues-url]: https://github.com/yannick-beot-sp/vscode-sailpoint-saas-connectivity/issues
[license-shield]: https://img.shields.io/github/license/yannick-beot-sp/vscode-sailpoint-saas-connectivity.svg?style=for-the-badge
[license-url]: https://github.com/yannick-beot-sp/vscode-sailpoint-saas-connectivity/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com
