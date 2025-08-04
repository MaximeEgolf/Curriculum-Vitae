// -----------------------------------------
// Github
// -----------------------------------------
async function userGithubRepos(user, token){
  try {
    const reposRes = await githubFetch(`https://api.github.com/users/${user}/repos?sort=updated&direction=desc`, token);
    const reposResJson = await reposRes.json();

    const repoData = [];
    for (const repo of reposResJson) {
      const languageRes = await githubFetch(`https://api.github.com/repos/${user}/${repo.name}/languages`, token);
      const languageResJson = await languageRes.json();

      const readMeRes = await githubFetch(`https://api.github.com/repos/${user}/${repo.name}/readme`, token, {'Accept': 'application/vnd.github.html'});
      const readMeResHtml = await readMeRes.text();

      repoData.push({
        name: repo.name,
        date: repo.pushed_at,
        description: repo.description,
        readMe: readMeResHtml,
        language: languageResJson
      });
    }

    return repoData;
  }

  catch(error) {
    throw new Error(error);
  }
}

async function githubFetch(request, token, otherheaders = {}){
  return await fetch(request, {
      headers: {
        'Authorization': `token ${token}`,
        ...otherheaders
      }
    }
  )
}

// -----------------------------------------
// Command Line
// -----------------------------------------
const PAGES = {
  '/': {
    name: '/',
    parent: null,
    child: ['/projects.html', '/contacts.html', 'cv.pdf'],
    aliases: ['/', '~']
  },
  '/projects.html': {
    name: 'Projets',
    parent: '/',
    child: null,
    aliases: ['Projets', 'projects.html']
  },
  '/contacts.html': {
    name: 'Contacts',
    parent: '/',
    child: null,
    aliases: ['Contacts', 'contacts.html']
  }
};

function commandLine(req){
  const command = req.body.command;
  const argument = req.body.argument;
  const currentDir = req.body.currentDir;

  let res = undefined;

  switch (command)
  {
    case "pwd":
      res = pwd(currentDir);
      break;
    case "cd":
      res = cd(argument, currentDir);
      break;
    case "ls":
      res = ls(currentDir);
      break;
  }
  return res;
}

function cd(argument, currentDir){
  const page = PAGES[currentDir];
  let path = '';

  if (argument === '/' || argument === '~')
    path = '/';
  if (argument === '..')
    path = page.parent;

  if (path === '' && page.child !== null)
  {
    for (const dest of page.child) {
      if (dest.endsWith('.html'))
      {
        const aliases = PAGES[dest].aliases;
        if (aliases.includes(argument))
        {
          path = dest;
          break;
        }
      }
    }
  }

  return {
    result : path,
    success : path === '' ? false : true
  };
}

function ls(currentDir){
  const page = PAGES[currentDir];
  let childDir = '';

  if (page.parent !== null)
  {
    childDir += `<span style="color:var(--blue)">..</span>`;
  }

  if (page.child !== null)
  {
    for (const dest of page.child) {
      if (!dest.endsWith('.html'))
      {
        childDir += `<span style="color:var(--green)">${dest}</span>`;
        break;
      }
      const name = PAGES[dest].name;
      childDir += `<span style="color:var(--blue)">${name}</span>`;
    }
  }

  return  {
    result: childDir,
    success: childDir === '' ? false : true
  }
}

function pwd(currentDir){
  let page = PAGES[currentDir];
  let path = '';

  while (page.name !== '/')
  {
    path = '/' + page.name + path;
    page = PAGES[page.parent];
  }

  if (path === '')
    path = '/';

  return {
    result: `<p>${path}</p>`,
    success: true
  }
}

export {
  userGithubRepos as github,
  commandLine as cmdLine
}