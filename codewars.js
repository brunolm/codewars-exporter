var x;
var allSolutions = [];
(function () {
  var shouldStop = false;
  function getPage(n) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: '/users/brunolm/completed?page=' + n,
        headers: {
          'X-Http-RequestedWith': 'XMLHttpRequest',
        },
        success: (r) => {
          return resolve($(r));
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }

  function getSolution(url) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url,
        success: (r) => resolve($(r)),
        error: (err) => reject(err),
      });
    });
  }

  const katas = [];
  async function getKatas(r) {
    const urls = [];
    r.find('a[href^="/kata/"][href$="/javascript"]').each((i, e) => {
      urls.push(e.href);
    });

    for (const url of urls) {
      const solutionsLink = url.replace(/\/train\/(.*?)$/, (m, p1, p2) => '/solutions/' + p1) + '/me/best_practice';
      const kataSlug = url.match(/\/kata\/(.*?)\//i)[1];
      try {
        const solutionPage = await getSolution(solutionsLink);
        let solutions = [];
        solutionPage.find('#solutions_list code').each((solutionIndex, solutionElement) => {
          solutions.push('```\n' + $(solutionElement).text() + '\n```');
        });
        solutions = solutions.join('\n\n');
        const kyu = solutionPage.find('#shell_content span:first').text();
        katas.push({
          kataSlug,
          kyu,
          solutions,
          solutionsLink,
        });
      }
      catch (err) {
        console.error('Kata failed for', solutionsLink);
      }
    }

    return katas;
  }

  function copy(c) {
    var i = $('<textarea>');
    i.val(c);
    i.appendTo('body');
    setTimeout(() => {
      i.get(0).select();
      setTimeout(() => {
        document.execCommand('copy');
      }, 100);
    }, 100);
  }

  // -------------

  let limit = 1000;
  (async function () {
    for (let i = 0; i < limit; ++i) {
      let pages;
      try {
        pages = await getPage(i);
      }
      catch (err) {
        console.error('Failed to get pages #', i);
        break;
      }
      if (!pages.length) break;
      const katas = await getKatas(pages);

      allSolutions = allSolutions.concat(katas);
    }
    console.log(allSolutions);

    x = allSolutions.map(s => `${s.kataSlug}
${s.kyu}
${s.solutionsLink}
-=##__KATA_EXPORTER__##=-
${s.solutions}`
    ).join('\n-=##__KATA_EXPORTER_SEPARATOR__##=-\n');

    copy(x);


  }());
}());
