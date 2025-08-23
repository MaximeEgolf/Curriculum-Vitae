// DOM
const projects = document.getElementById('projects');

// Constants
const specialCases = {
  "C++": "cplusplus",
  "C#": "csharp",
  "F#": "fsharp",
  "Objective-C": "objectivec",
  "HTML": "html5",
  "CSS": "css3"
}
const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

// Functions
async function gitHubApiCall() {
  try {
    const githubRes = await fetch('http://localhost:3000/api/github');
    const githubResJson  = await githubRes.json();

    if (githubResJson.from != '/api/github')
      throw new Error(`Called api ${githubResJson.from} instead of /api/github`);

    for (const key in githubResJson.result) {
      const project = githubResJson.result[key];
      const date = new Date(project.date);

      const languagesHTML = Object.entries(project.language).map(([name, numberOfLines]) =>
      {
        const simpleIconName = specialCases[name] || name.toLowerCase();
        return `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${simpleIconName}/${simpleIconName}-original.svg"
                     alt="${name} logo"
                     style="width: 50px; height: 50px; margin: 5px;">`
      }).join('');

      projects.innerHTML += `<div class="project">
                              <div class="project-header">
                                <a href="${project.url}">
                                  <h1>${project.name}</h1>
                                </a>
                                <div class="project-date">
                                  <h4>${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}</h4>
                                  <i>${date.getHours()}h${date.getMinutes() < 10 ? '0':''}${date.getMinutes()}</i>
                                </div>
                              </div>
                              <h2>Description</h2>
                              <div class="project-description">
                                <p>${project.description ?? '(Ce projet ne contient malheureusement pas de description)'}</p>
                              </div>
                              <h2>Approfondissement</h2>
                              <div class="project-readme">
                                ${project.readMe.success ? project.readMe.result : '(Ce projet ne contient malheureusemnet pas de README.md)'}
                              </div>
                              <h2>Langages utilisés</h2>
                              <div class="project-languages">
                              ${languagesHTML}
                              </div>
                             </div>`;
    }
  document.getElementById('projects').classList.add('projects-loaded');
  }
  catch (error) {
    console.error(error);
  }
}

gitHubApiCall();