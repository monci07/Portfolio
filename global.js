let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/index.html', title: 'Projects' },
  { url: 'contact/index.html', title: 'Contact' },
  { url: 'CV/index.html', title: 'CV' },
  { url: 'https://github.com/monci07', title: 'Github'}
];

const BASE_PATH =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/' // Local server
    : '/Portfolio/'; // GitHub Pages repo name



let nav = document.createElement('nav');
document.body.prepend(nav);
for (let p of pages) {
    let url = p.url;
    let title = p.title;
    url = !url.startsWith('http') ? BASE_PATH + url : url;
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname,
    );
    nav.append(a);
    if (title == 'Github'){
        a.target = "_blank";
    }
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
	<label class="color-scheme">
		Theme:
		<select>
			<option value = "light dark">System</option>
			<option value = "light">Light</option>
			<option value = "dark">Dark</option>
		</select>
	</label>`,
);

let select = document.querySelector('select');
select.addEventListener('input', function (event) {
  document.documentElement.style.setProperty('color-scheme', event.target.value);
  localStorage.colorScheme = event.target.value
});

if (localStorage.getItem('colorScheme') !== null){
    document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
    select.value = localStorage.colorScheme;
}

let form = document.querySelector('form');
form?.addEventListener('submit', function (event){
    event.preventDefault();
    let data = new FormData(form);
    let url = 'mailto:dmoncivais@ucsd.edu?'
    for (let [name, value] of data) {
    // TODO build URL parameters here
        console.log(name, (value));
        url += name+'='+(value)+'&';
    }
    url = url.slice(0, -1)
    console.log(url);
    location.href = url;
});

export async function fetchJSON(url) {
    try {
        // Fetch the JSON file from the given URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        console.log(response);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
    containerElement.innerHTML = '';
    try {
        var title = document.querySelector('.projects-title');
        title.textContent = 'Projects page - ' + project.length + ' projects';    
    } catch (error) {
        console.log(error);
    }
    for (let i = 0; i < project.length; i++) {
        const article = document.createElement('article');
        article.innerHTML = `
            <${headingLevel}>${project[i].title}</${headingLevel}>
            <img src="${project[i].image}" alt="${project[i].title}">
            <p>${project[i].description}</p>
        `;
        containerElement.appendChild(article);
    }
}

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}
