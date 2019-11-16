'use strict';

function syntaxHighlight(json) { // http://jsfiddle.net/KJQ9K/554/
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var cls = 'number';
      if (/^"/.test(match)) {
          if (/:$/.test(match)) {
              cls = 'key';
          } else {
              cls = 'string';
          }
      } else if (/true|false/.test(match)) {
          cls = 'boolean';
      } else if (/null/.test(match)) {
          cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
  });
}

let timer             = null;
const apiUrl          = 'https://randomuser.me/api/',
      body            = document.body,
      $$              = (element, block = 'userData') => document.querySelector(`.${block}__${element}`),
      refreshUserBtn  = $$('refreshUser', 'actions'),
      copyBtn         = $$('copy', 'actions'),
      COPY_TEXT       = '💾',
      COPIED_TEXT     = 'Copied! ✅',
      LOADED_CLASS    = 'loaded',
      DEBOUNCE_TIME   = 2000, // 2 seconds
      resetTimer      = () => {
        timer && clearTimeout(timer);
        if (copyBtn) {
          copyBtn.innerText = COPY_TEXT;
        }
      },
      copy            = () => {
        const json      = $$('json'),
              user      = json && json.innerText,
              clipboard = navigator && navigator.clipboard;

        if (clipboard && user) {
          clipboard.writeText(user).then(() => {
            resetTimer && resetTimer();
            if (copyBtn) {
              copyBtn.innerText = COPIED_TEXT;
            }
            timer = setTimeout(resetTimer, DEBOUNCE_TIME);
          });
        }
      },
      parseUser       = (response) => {
        const results   = response && response.results,
              user      = results && results.length && results[0],
              email     = user && user.email,
              name      = user && user.name,
              title     = name && name.title,
              firstName = name && name.first,
              lastName  = name && name.last,
              login     = user && user.login,
              username  = login && login.username,
              fullName  = `${title} ${firstName} ${lastName}`,
              picture   = user && user.picture,
              avatar    = picture && picture.large,
              json      = $$('json'),
              selectors = [
                { element: 'head-avatar',     value: `<img src="${avatar}" title="${fullName}" alt="${fullName}" />` },
                { element: 'head-fullName',   value: fullName },
                { element: 'head-email',      value: email },
                { element: 'head-username',   value: username },
                { element: 'extraData-field', value: []},
              ];

        for (const item of selectors) {
          const element   = item && item.element,
                value     = item && item.value,
                selector  = element && $$(element),
                isArray   = Array.isArray(value);

          if (selector && value) {
            if (!isArray) {
              selector.innerHTML = value;
            } else { }
          }
        }

        json.innerHTML = syntaxHighlight(JSON.stringify(user, null, 2));
        body.classList.add(LOADED_CLASS);
      },
      onUserLoad      = (response) => response.json().then(parseUser),
      onApiError      = (error) => {
        console.info('It was an error trying to load the user', error)
      },
      getRandomUser   = () => {
        fetch(apiUrl).then(onUserLoad, onApiError)
      };

window.addEventListener('load', getRandomUser);
refreshUserBtn && refreshUserBtn.addEventListener('click', getRandomUser);
refreshUserBtn && copyBtn.addEventListener('click', copy);
