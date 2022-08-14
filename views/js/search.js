var directory;
var filteredResults = [];
var filtersApplied = {
    "SeriesName": "",
    "Author": "",
    "Year": "",
    "ScanStatus": "",
    "PublishStatus": "",
    "Type": "",
    "OfficialTranslation": "",
    "Genres": [],
    "GenresNot": [],
    "SortBy": ''
};
// Filters avaible for the user to select
const availableFilters = [
    {
        'name': 'Sort By',
        'filters': ['Alphabetical A-Z', 'Alphabetical Z-A', 'Recently Released Chapter', 'Year Released - Newest', 'Year Released - Oldest', 'Most Popular (All Time)', 'Most Popular (Monthly)', 'Least Popular']
    },
    {
        'name': 'Official Translation',
        'filters': ['Any', 'Offical Translation Only']
    },
    {
        'name': "Scan Status",
        'filters': ['Any', 'Cancelled', 'Complete', 'Discontinued', 'Hiatus', 'Ongoing']
    },
    {
        'name': "Publish Status",
        'filters': ['Any', 'Cancelled', 'Complete', 'Discontinued', 'Hiatus', 'Ongoing']
    },
    {
        'name': "Type",
        'filters': ['Any', 'Doujinshi', 'Manga', 'Manhua', 'Manhwa', 'OEL', 'One-shot']
    },
    {
        'name': "Genres",
        'filters': ['Any', 'Action', 'Adult', 'Adventure', 'Comedy', 'Doujinshi', 'Drama', 'Ecchi', 'Fantasy', 'Gender Bender', 'Harem', 'Hentai', 'Historical', 'Horror', 'Isekai', 'Josei', 'Lolicon', 'Martial Arts', 'Mature', 'Mecha', 'Mystery', 'Psychological', 'Romance', 'School Life', 'Sci-fi', 'Seinen', 'Shotacon', 'Shoujo', 'Shoujo Ai', 'Shounen', 'Shounen Ai', 'Slice of Life', 'Smut', 'Sports', 'Supernatural', 'Tragedy', 'Yaoi', 'Yuri']
    }
];

async function getSearchDirectory() {
    let fetchData = await fetch('/api/searchPage');
    let data = await fetchData.json();

    directory = data;

    //get rid of the loading screen
    document.getElementById('loading').remove();
    document.getElementById('main').classList.remove('none');
    // show the number of manga
    document.getElementById('amountOfManga').innerText = '(' + directory.length.toLocaleString("en-us") + ')';
    generateResultsHTML(directory, 0);
    generateFiltersHTML()

}

// toggle if that list of filters is visible or not
function toggleListVisibility(obj) {
    // check if it is hidden rn or not
    let filterList = obj.parentElement.children[1];
    let isHidden = filterList.classList.contains('hidden');

    if (isHidden) {
        filterList.classList.remove('hidden');
        obj.children[0].classList.remove('fa-caret-down');
        obj.children[0].classList.add('fa-caret-up');
        obj.classList.add('noBorderRadius');
    } else {
        filterList.classList.add('hidden');
        obj.children[0].classList.remove('fa-caret-up');
        obj.children[0].classList.add('fa-caret-down');
        obj.classList.remove('noBorderRadius');
    }
    console.log(obj);
}

// generate results html based on the arry
function generateResultsHTML(mangaArry, indxStart) {
    let htmlGenerated = [];
    // starting at a given index add more twenty items
    for (var i = indxStart; i < indxStart + 20; i++) {
        // i is index name, s is series name, y is year released
        // h is either its popular rn or not, a is an list list of authors
        // ss is scan staus ps is publish status
        htmlGenerated.push(`
           <div class="result_item">
             <a href="#" >
                <img src="https://temp.compsci88.com/cover/${mangaArry[i].indexName}.jpg" /> 
             </a>
             <div class="detailContainer">
                <a class="name" href="/manga/manga/${mangaArry[i].indexName}">${mangaArry[i].seriesName}</a>
                <div class="gray">
                    Author:${mangaArry[i].authors.map(author => `<span class="blue">&nbsp;${author}</span>`).join(',')}
                    &#183; Year:&nbsp;<span class="blue">${mangaArry[i].y}</span>
                </div>
                <div class="gray">
                    Status: <span class="blue">${mangaArry[i].ss} (Scan)</span>,
                    <span class="blue">${mangaArry[i].ps} (Publish)</span>
                </div>
                <div class="gray">
                    Latest: <a href="${mangaArry[i].chapterUrl}" class="blue">Chapter ${mangaArry[i].latestChapter} </a>
                    <span style="color:gray;">&#183; ${mangaArry[i].latestScan}</span>
                </div>
                <div class="gray">
                    Genres:${mangaArry[i].genres.map(genre => `<span class="blue">&nbsp;${genre}</span>`).join(',')}
                </div>
                ${mangaArry[i].offical == 'yes' ? `<div class="offical">Official Translation</div>` : ``}
             </div>
           </div>
        `)
    }
    document.getElementById('resultsContainer').innerHTML = htmlGenerated.join('');
}
// genreates html for all the avaible filters for user to select
function generateFiltersHTML() {
    let htmlGenerated = [];

    for (var i = 0; i < availableFilters.length; i++) {
        htmlGenerated.push(`
            <div class="filterContainer">
                <div class="filterHead" onclick="toggleListVisibility(this)" >
                    ${availableFilters[i].name}
                    <i class="fas fa-caret-down"></i>
                </div>
                <div class="filterItems hidden">
                    ${availableFilters[i].filters.map((filter, indx) => `<div onclick="filterSelection(this)" class="item">${filter}${ indx == 0 ?`<i class="fas fa-check"></i>`: ''}</div>`).join('')}
                </div>
            </div>
        `)
    }
    document.getElementById('filters').innerHTML = htmlGenerated.join('');
}
// update filters applied 
function updateFilters(type, filter) {

}
// toggle filters selection
function filterSelection(obj) {
    console.log(obj)
    if (obj.parentElement.parentElement.children[0].innerText != 'Genres' || obj.innerText == 'Any') {
        obj.parentElement.querySelectorAll('.fa-check').forEach((checked) => {
            checked.remove();
        })
        obj.innerHTML += `<i class="fas fa-check"></i>`
    } else {
        // change sign on that spefic genre
        if (obj.childElementCount == 0) {
            obj.innerHTML += `<i class="fas fa-check"></i>`;
            obj.parentElement.children[0].innerHTML = obj.parentElement.children[0].innerText;
        } else if (obj.innerHTML.includes(`fa-check`)) {
            obj.children[0].remove();
            obj.innerHTML += `<i class="fas fa-times"></i>`
        } else if (obj.innerHTML.includes(`fa-times`)) {
            obj.children[0].remove();
        }
        // now see if there are no signs on genre then add a sign to any
        if (obj.parentElement.querySelectorAll('i').length == 0) {
            obj.parentElement.children[0].innerHTML += `<i class="fas fa-check"></i>`;
        }
    }
}
getSearchDirectory();

