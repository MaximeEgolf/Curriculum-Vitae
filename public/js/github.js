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
const months = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre"
];

// Functions
async function gitHubApiCall() {
  try {
    const res = await fetch('http://localhost:3000/api/github');
    const resJson  = await res.json();

    if (resJson.from != '/api/github')
      throw new Error(`Called api ${resJson.from} instead of /api/github`);

    for (const key in resJson.result) {
      const project = resJson.result[key];
      const date = new Date(project.date);

      const nbTotalWords = Object.values(project.language).reduce((sum, value) => sum + value, 0);
      const languagesHTML = Object.entries(project.language).map(([name, nbWords]) =>
      {
        const simpleIconName = specialCases[name] || name.toLowerCase();
        return `<div class="project-language">
                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${simpleIconName}/${simpleIconName}-original.svg"
                         alt="${name}"
                         style="width: 50px; height: 50px; margin: 5px;"
                         onerror="this.src='../images/iconFallback.svg'; this.onerror=null;">
                    <p>${name}</p>
                    <p>(${(nbWords/nbTotalWords*100).toFixed(2)}%)</p>
                </div>`
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
                              <h3>Description</h3>
                              <div class="project-description">
                                <p>${project.description ?? '(Ce projet ne contient malheureusement pas de description)'}</p>
                              </div>
                              <h3>Approfondissement</h3>
                              <div class="project-readme">
                                ${project.readMe.success ? project.readMe.result : '(Ce projet ne contient malheureusement pas de README.md)'}
                              </div>
                              <h3>Langages utilisés</h3>
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