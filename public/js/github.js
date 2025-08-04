const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const projects = document.getElementById('projects');

async function gitHubApiCall() {
  try {
    const githubRes = await fetch('http://localhost:3000/api/github');
    const githubResJson  = await githubRes.json();

    if (githubResJson.from != '/api/github')
      throw new Error(`Called api ${githubResJson.from} instead of /api/github`);

    const value = githubResJson.value;

    for (const key in value) {
      const project = value[key];

      const date = new Date(project.date);

      projects.innerHTML += `<div class="project">
                              <div class="projectHeader">
                                <h1>${project.name}</h1>
                                <div>
                                  <h4>${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}</h4>
                                  <i>${date.getHours()}h${date.getMinutes() < 10 ? '0':''}${date.getMinutes()}</i>
                                </div>
                              </div>
                              <p>${project.description != null ? project.description:'Ce projet ne contient malheureusement pas de description!'}</p>
                              ${project.readMe}
                             </div>`;
    }
  }
  catch (error) {
    console.error(error);
  }
}

// gitHubApiCall();