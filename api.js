// -----------------------------------------
// Github
// -----------------------------------------
class GithubAPI
{
  constructor(token)
  {
    this.token = token;
    this.baseURL = "https://api.github.com";
  }

  async fetch(extURL, additionnalHeaders = {})
  {
    try {
      const response = await fetch(`${this.baseURL}/${extURL}` , {
        headers: {
          'Authorization': `token ${this.token}`,
          ...additionnalHeaders
        }
      });

      return response;
    }

    catch (error) {
      throw new Error(`Github fetch has got errors: ${error.message}`);
    }
  }

  async getRepos(user)
  {
    const options = `sort=updated&direction=desc`
    const url = `users/${user}/repos?${options}`
    const response = await this.fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch user repositories: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getRepoLanguages(user, repo)
  {
    const url = `repos/${user}/${repo}/languages`;
    const response = await this.fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch languages for ${repo} of user: ${user}`)
    }

    return response.json();
  }

  async getRepoReadme(user, repo)
  {
    const url = `repos/${user}/${repo}/readme`;
    const response = await this.fetch(url, {'Accept': 'application/vnd.github.html'});

    if (response.ok) {
      const html = await response.text();
      return { result: html, success: true}
    }
    else
    {
      const json = await response.json();
      return { result: json, success: false}
    }
  }

  async getData(user)
  {
    // 1st: Get repositories from the user
    const repos = await this.getRepos(user);

    // 2nd: Get through each repositories for programming languages + README.md
    const repoData = await Promise.all(
      repos.map(async (repo) => {
        const [languages, readme] = await Promise.all([
          this.getRepoLanguages(user, repo.name),
          this.getRepoReadme(user, repo.name)
        ]);

        return {
          name: repo.name,
          url: repo.html_url,
          date: repo.pushed_at,
          description: repo.description,
          language: languages || {},
          readMe: readme || {},
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          isPrivate: repo.private
        };
      })
    );

    return repoData;
  }
}

async function getGithubData(user, token)
{
  const githubApi = new GithubAPI(token)
  return githubApi.getData(user);
}

// -----------------------------------------
// Command Line
// -----------------------------------------
const PAGES = {
  '/': {
    name: '/',
    parent: null,
    children: ['/projects.html', '/contacts.html', 'CV.pdf'],
    aliases: ['/', '~']
  },
  '/projects.html': {
    name: 'Projets',
    parent: '/',
    children: null,
    aliases: ['Projets', 'projects.html']
  },
  '/contacts.html': {
    name: 'Contacts',
    parent: '/',
    children: null,
    aliases: ['Contacts', 'contacts.html']
  }
};

const COMMANDS = {
  pwd: (args, dir) => pwd(args, dir),
  cd: (args, dir) => cd(args, dir),
  ls: (args, dir) => ls(args, dir),
}

// -----------------------------------------
// Helpers (command line)
// -----------------------------------------
function resolveAlias(args, currentDir){
  const page = PAGES[currentDir];

  if (!page)
    return null;

  if (args === '/' || args === '~')
    return '/';
  if (args === '..')
    return page.parent ?? '';

  if (page.children) {
    for (const dest of page.children) {
      // Skips files
      if (dest.endsWith('.html'))
      {
        const aliases = PAGES[dest].aliases || [];
        if (aliases.includes(args))
          return dest;
      }
    }
  }
  return '';
}

function formatChildren(currentDir) {
  const page = PAGES[currentDir];

  const entries = [];
  if (page.parent)
    entries.push({name: "..", type: "dir"});

  if (page.children) {
    for (const dest of page.children) {
      if (!dest.endsWith('.html'))
        entries.push({name: `${dest}`, type: "file"});
      else
        entries.push({name: `${PAGES[dest].name}`, type: "dir"});
    }
  }
  return entries;
}

function badFormat(cmd) {
  return { result: `Erreur de format pour '${cmd}'`, success: false, cmd };
}

// -----------------------------------------
// Commands (command line)
// -----------------------------------------
function cd(args, currentDir){
  if (args.length !== 1)
    return badFormat("cd");

  const path = resolveAlias(args[0], currentDir);
  return {result : path, success : path !== '', cmd: "cd"};
}

function ls(args, currentDir) {
  if (args.length)
    return badFormat("ls");

  const entries = formatChildren(currentDir);
  return { result: entries, success: entries.length > 0, cmd: "ls"};
}

function pwd(args, currentDir){
  if (args.length)
    return badFormat("pwd");

  let page = PAGES[currentDir];
  let path = '';

  while (page.name !== '/'){
    path = '/' + page.name + path;
    page = PAGES[page.parent];
  }

  if (path === '')
    path = '/';

  return {result: path, success: true, cmd: "pwd"}
}

function postCommandLine(req){
  const {command, currentDir} = req.body;
  const commandWords = command.trim().split(/\s+/);

  const cmd = COMMANDS[commandWords[0]];
  if (!cmd)
    return {result : "Tapez 'help' pour aide", success : false, cmd: undefined};

  return cmd(commandWords.slice(1), currentDir);
}

export {
  getGithubData,
  postCommandLine
}