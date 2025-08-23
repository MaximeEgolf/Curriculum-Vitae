// DOM
const cmdInput = document.getElementById("cmd-input");
const cmdOutput = document.getElementById("cmd-output");

// Functions
cmdInput.addEventListener('blur', () => {
  cmdInput.focus();
});

cmdInput.addEventListener('keydown', async (event) => {
  if (event.key === "Enter") {
    try {
      const res = await fetch('http://localhost:3000/api/commandLine', {
                              method: 'POST',
                              headers: {'Content-Type': 'application/json'},
                              body: JSON.stringify({command: cmdInput.value, currentDir: window.location.pathname})});
      const resJson = await res.json();

      if (resJson.from != '/api/commandLine')
        throw new Error(`Called api ${resJson.from} instead of /api/commandLine`);

      if (resJson.success) {
        switch (resJson.cmd) {
          case "cd":
            window.location.href = resJson.result;
            break;

          case "ls":
            cmdOutput.innerHTML = '';
            for (const dest of resJson.result) {
              if (dest.type === "file")
                cmdOutput.innerHTML += `<span style="color:var(--green)">${dest.name}</span> `;
              else if (dest.type === "dir")
                cmdOutput.innerHTML += `<span style="color:var(--blue)">${dest.name}</span> `;
            }
            break;

          default:
            cmdOutput.innerHTML = resJson.result;
            break;
        }
      }
      else {
        cmdOutput.innerHTML += `<span style="color:var(--red)">${resJson.result}</span>`
      }
      cmdInput.value = '';
    }
    catch (error) {
      console.error(error);
    }
  }
  else {
    cmdOutput.innerHTML = '';
  }
});