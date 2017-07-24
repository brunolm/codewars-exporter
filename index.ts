import * as fs from 'fs';
import * as path from 'path';

function readFile(file): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => err ? reject(err) : resolve(data.toString()));
  });
}

function writeFile(path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err) => err ? reject(err) : resolve());
  });
}

function createDir(path) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(path)) {
      return resolve();
    }

    fs.mkdir(path, (err) => err ? reject(err) : resolve());
  });
}

(async function () {
  const outputDir = 'output';
  const kataCodeSeparator = '-=##__KATA_EXPORTER__##=-';
  const kataSeparator = /[-][=][#][#]__KATA_EXPORTER_SEPARATOR__[#][#][=][-]/g;

  const all = await readFile('all.txt');

  await createDir(outputDir);

  const katas = all.split(kataSeparator);

  for (let kata of katas) {
    const [headers, code] = kata.split(kataCodeSeparator);
    const [slug, kyu, link] = headers.split(/\n/g).filter(h => h);

    await createDir(path.join(outputDir, kyu));
    await writeFile(path.join(outputDir, kyu, slug + '.md'), `# ${slug}\n// ${link}\n\n${code}`);
  }
}());
